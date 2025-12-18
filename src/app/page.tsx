"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AssignmentPanel from "@/components/assignment-panel";
import CreateRoomForm from "@/components/create-room-form";
import HeroPanel from "@/components/hero-panel";
import InviteLink from "@/components/invite-link";
import JoinPanel from "@/components/join-panel";
import OwnerControls from "@/components/owner-controls";
import ParticipantsList from "@/components/participants-list";
import {
  Participant,
  Room,
  SelfInfo,
} from "@/types/secret-santa";

const TOKEN_STORE_PREFIX = "secret-santa:token:";
const ROOM_REFRESH_MS = 6000;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  const [room, setRoom] = useState<Room | null>(null);
  const [selfInfo, setSelfInfo] = useState<SelfInfo | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [hostName, setHostName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setSelfInfo(null);
      setToken(null);
      setRoomError(null);
      setParticipants([]);
      return;
    }

    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(`${TOKEN_STORE_PREFIX}${roomId}`);
    setToken(stored);
  }, [roomId]);

  const fetchSelf = useCallback(
    async (id: string, currentToken: string) => {
      try {
        const response = await fetch(
          `/api/rooms/${id}/self?token=${encodeURIComponent(currentToken)}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error();
        }
        const data = (await response.json()) as { self: SelfInfo };
        setSelfInfo(data.self);
      } catch {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(`${TOKEN_STORE_PREFIX}${id}`);
        }
        setToken(null);
        setSelfInfo(null);
      }
    },
    [],
  );

  const fetchRoom = useCallback(
    async (id: string) => {
      setRoomLoading(true);
      setRoomError(null);
      const scrollPosition =
        typeof window !== "undefined" ? window.scrollY ?? 0 : 0;
      try {
        const response = await fetch(`/api/rooms/${id}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Комната не найдена");
        }
        const data = (await response.json()) as { room: Room };
        setRoom(data.room);
        setParticipants(data.room.participants);
        if (token) {
          await fetchSelf(id, token);
        } else {
          setSelfInfo(null);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось загрузить комнату";
        setRoomError(message);
        setRoom(null);
      } finally {
        setRoomLoading(false);
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: scrollPosition });
          });
        }
      }
    },
    [token, fetchSelf],
  );

  const fetchParticipants = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `/api/rooms/${id}/participants`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error("Не удалось обновить участников");
        }
        const data = (await response.json()) as { participants: Participant[] };
        setParticipants(data.participants);
      } catch {
        // Игнорируем ошибки обновления
      }
    },
    [],
  );

  const handleKick = useCallback(
    async (participantId: string) => {
      if (!roomId || !token || !selfInfo?.participant.isOwner) return;

      setActionError(null);
      setRemovingId(participantId);

      try {
        const response = await fetch(
          `/api/rooms/${roomId}/participants/${participantId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Не удалось удалить участника");
        }
        setParticipants(payload.participants);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось удалить участника";
        setActionError(message);
      } finally {
        setRemovingId(null);
      }
    },
    [roomId, token, selfInfo?.participant.isOwner],
  );

  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId);
    }
  }, [roomId, fetchRoom]);

  useEffect(() => {
    if (!roomId) return undefined;
    fetchParticipants(roomId);
    const interval = setInterval(() => fetchParticipants(roomId), ROOM_REFRESH_MS);
    return () => clearInterval(interval);
  }, [roomId, fetchParticipants]);

  const rememberToken = useCallback(
    (roomKey: string, nextToken: string) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(`${TOKEN_STORE_PREFIX}${roomKey}`, nextToken);
      setToken(nextToken);
    },
    [],
  );

  const handleCreateRoom = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (creatingRoom) return;

      setCreatingRoom(true);
      setActionError(null);

      try {
        const response = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostName, roomName }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Не удалось создать комнату");
        }

        const createdRoom = payload.room as Room;
        const ownerToken = payload.token as string;
        const participant = payload.participant as SelfInfo["participant"];

        rememberToken(createdRoom.id, ownerToken);
        setSelfInfo({
          participant: { ...participant, isOwner: true },
        });
        setRoom(createdRoom);
        router.replace(`/?room=${createdRoom.id}`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Во время создания произошла ошибка";
        setActionError(message);
      } finally {
        setCreatingRoom(false);
      }
    },
    [creatingRoom, hostName, roomName, rememberToken, router],
  );

  const handleJoinRoom = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!roomId || pendingAction) return;

      setPendingAction(true);
      setActionError(null);

      try {
        const response = await fetch(`/api/rooms/${roomId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: joinName }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Не удалось войти");
        }

        const updatedRoom = payload.room as Room;
        const userToken = payload.token as string;
        const participant = payload.participant as SelfInfo["participant"];

        rememberToken(roomId, userToken);
        setSelfInfo({
          participant: { ...participant, isOwner: false },
        });
        setRoom(updatedRoom);
        setParticipants(updatedRoom.participants);
        setJoinName("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ошибка входа в комнату";
        setActionError(message);
      } finally {
        setPendingAction(false);
      }
    },
    [joinName, pendingAction, rememberToken, roomId],
  );

  const handleStart = useCallback(async () => {
    if (!roomId || !token || pendingAction) return;

    setPendingAction(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось запустить жеребьевку");
      }
      await fetchRoom(roomId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Сервис временно недоступен";
      setActionError(message);
    } finally {
      setPendingAction(false);
    }
  }, [fetchRoom, pendingAction, roomId, token]);

  const shareLink = useMemo(() => {
    if (!origin || !roomId) return "";
    return `${origin}/?room=${roomId}`;
  }, [origin, roomId]);

  const handleCopyLink = useCallback(async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setInfoMessage("Ссылка скопирована ✅");
      setTimeout(() => setInfoMessage(null), 3000);
    } catch {
      setActionError("Не удалось скопировать ссылку");
    }
  }, [shareLink]);

  const canStart =
    !!selfInfo?.participant.isOwner &&
    !!room &&
    participants.length >= 2 &&
    !room.startedAt;

  const youAreInRoom = Boolean(selfInfo?.participant);
  const alreadyStarted = Boolean(room?.startedAt);
  const assignmentName = selfInfo?.assignedTo?.name;

  return (
    <div className="min-h-screen px-4 py-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <HeroPanel />

        {!roomId && (
          <CreateRoomForm
            hostName={hostName}
            roomName={roomName}
            creating={creatingRoom}
            error={actionError}
            onHostChange={setHostName}
            onRoomChange={setRoomName}
            onSubmit={handleCreateRoom}
          />
        )}

        {roomId && (
          <section className="festive-card snow-fade border-0 px-8 py-10">
            {roomLoading && <p className="text-sm text-white/70">Загружаем комнату...</p>}
            {roomError && (
              <p className="text-rose-200">
                {roomError}.{" "}
                <button
                  className="underline text-amber-200"
                  onClick={() => router.replace("/")}
                >
                  Вернуться назад
                </button>
              </p>
            )}

            {!roomLoading && !roomError && room && (
              <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
                    Комната #{room.id}
                  </p>
                  <h2 className="text-3xl font-semibold text-white">{room.name}</h2>
                  <div className="flex flex-col gap-2 text-sm text-white/70">
                    <p>Участников: {participants.length}</p>
                    <p>
                      Статус:{" "}
                      {alreadyStarted ? "жеребьевка запущена" : "ожидание старта"}
                    </p>
                  </div>
                </header>

                <InviteLink shareLink={shareLink} onCopy={handleCopyLink} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <ParticipantsList
                    participants={participants}
                    highlightId={selfInfo?.participant.id ?? null}
                    showKickButton={Boolean(selfInfo?.participant.isOwner)}
                    onKick={selfInfo?.participant.isOwner ? handleKick : undefined}
                    busyId={removingId}
                  />
                  <JoinPanel
                    youAreInRoom={youAreInRoom}
                    participantName={selfInfo?.participant.name}
                    pending={pendingAction}
                    onJoin={handleJoinRoom}
                    onNameChange={setJoinName}
                    joinName={joinName}
                    isOwner={selfInfo?.participant.isOwner}
                  />
                </div>

                {selfInfo?.participant.isOwner && (
                  <OwnerControls
                    canStart={canStart}
                    pending={pendingAction}
                    participantsCount={participants.length}
                    started={Boolean(room.startedAt)}
                    onStart={handleStart}
                  />
                )}

                <AssignmentPanel
                  youAreInRoom={youAreInRoom}
                  alreadyStarted={alreadyStarted}
                  assignmentName={assignmentName}
                />

                {actionError && (
                  <p className="text-sm text-rose-200">{actionError}</p>
                )}
                {infoMessage && (
                  <p className="text-sm text-emerald-200">{infoMessage}</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

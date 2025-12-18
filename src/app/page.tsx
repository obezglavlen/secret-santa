"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Participant = {
  id: string;
  name: string;
  joinedAt: number;
};

type Room = {
  id: string;
  name: string;
  createdAt: number;
  startedAt?: number;
  participants: Participant[];
};

type SelfInfo = {
  participant: {
    id: string;
    name: string;
    isOwner: boolean;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
};

const TOKEN_STORE_PREFIX = "secret-santa:token:";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  const [room, setRoom] = useState<Room | null>(null);
  const [selfInfo, setSelfInfo] = useState<SelfInfo | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);

  const [hostName, setHostName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

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
        console.log(response);
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
      try {
        const response = await fetch(`/api/rooms/${id}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Комната не найдена");
        }
        const data = (await response.json()) as { room: Room };
        setRoom(data.room);
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
      }
    },
    [token, fetchSelf],
  );

  useEffect(() => {
    if (roomId) {
      fetchRoom(roomId);
    }
  }, [roomId, fetchRoom]);

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
        router.push(`/?room=${createdRoom.id}`);
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
    room.participants.length >= 2 &&
    !room.startedAt;

  const youAreInRoom = Boolean(selfInfo?.participant);
  const alreadyStarted = Boolean(room?.startedAt);
  const assignmentName = selfInfo?.assignedTo?.name;

  const hero = (
    <div className="rounded-2xl border border-black/5 bg-white/80 p-8 shadow-lg shadow-zinc-200 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/30">
      <p className="text-sm uppercase tracking-[0.2em] text-red-500">
        Тайный Санта
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-zinc-900 dark:text-white">
        Создайте комнату, позовите друзей и проведите жеребьевку в один клик
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
        Участники заходят по ссылке, вводят имя, а вы запускаете старт.
        Каждый увидит только своего получателя подарка.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white px-4 py-10 text-zinc-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        {hero}

        {!roomId && (
          <section className="rounded-2xl border border-red-100 bg-white/90 p-8 shadow-lg shadow-red-100 dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/40">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Создать новую комнату
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              После создания вы получите ссылку и сможете поделиться ей с друзьями.
            </p>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleCreateRoom}>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Ваше имя
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-400"
                  placeholder="Например, Катя"
                  value={hostName}
                  onChange={(event) => setHostName(event.target.value)}
                  required
                />
              </label>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Название комнаты (необязательно)
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-400"
                  placeholder="Семейный круг 2024"
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                />
              </label>
              <button
                type="submit"
                disabled={creatingRoom}
                className="mt-2 rounded-xl bg-red-500 px-6 py-3 text-lg font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {creatingRoom ? "Создание..." : "Создать комнату"}
              </button>
              {actionError && (
                <p className="text-sm text-red-500">{actionError}</p>
              )}
            </form>
          </section>
        )}

        {roomId && (
          <section className="rounded-2xl border border-zinc-100 bg-white/90 p-8 shadow-xl shadow-zinc-100 dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/40">
            {roomLoading && <p>Загружаем комнату...</p>}
            {roomError && (
              <p className="text-red-500">
                {roomError}.{" "}
                <button
                  className="underline"
                  onClick={() => router.replace("/")}
                >
                  Вернуться назад
                </button>
              </p>
            )}
            {!roomLoading && !roomError && room && (
              <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                    Комната #{room.id}
                  </p>
                  <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">
                    {room.name}
                  </h2>
                  <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Участников: {room.participants.length}</p>
                    <p>
                      Статус:{" "}
                      {alreadyStarted
                        ? "жеребьевка запущена"
                        : "ожидание старта"}
                    </p>
                  </div>
                </header>

                <div className="rounded-2xl border border-dashed border-zinc-200 p-4 dark:border-zinc-700">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Ссылка для приглашения
                  </p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      value={shareLink}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                    >
                      Скопировать
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Список участников
                    </h3>
                    <ul className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {room.participants.map((participant) => (
                        <li
                          key={participant.id}
                          className={`rounded-lg border border-transparent px-3 py-2 ${
                            participant.id === selfInfo?.participant?.id
                              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
                              : "bg-zinc-50 dark:bg-zinc-800"
                          }`}
                        >
                          {participant.name}
                          {participant.id === selfInfo?.participant?.id && (
                            <span className="ml-2 text-xs uppercase tracking-wider text-red-500">
                              это вы
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {youAreInRoom
                        ? "Вы в игре"
                        : "Войдите чтобы участвовать"}
                    </h3>

                    {!youAreInRoom && (
                      <form
                        className="mt-4 flex flex-col gap-3"
                        onSubmit={handleJoinRoom}
                      >
                        <input
                          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-400"
                          placeholder="Ваше имя"
                          value={joinName}
                          onChange={(event) => setJoinName(event.target.value)}
                          required
                        />
                        <button
                          type="submit"
                          disabled={pendingAction}
                          className="rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                        >
                          {pendingAction ? "Входим..." : "Присоединиться"}
                        </button>
                      </form>
                    )}

                    {youAreInRoom && (
                      <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <p>Вы участвуете под именем {selfInfo?.participant.name}.</p>
                        {selfInfo?.participant.isOwner && (
                          <p className="text-red-500">
                            Вы создатель комнаты и можете начинать жеребьевку.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <>{console.log(selfInfo)}</>
                {selfInfo?.participant.isOwner && (
                  <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Управление
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Когда все участники добавлены, запустите жеребьевку.
                    </p>
                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={!canStart || pendingAction}
                      className="mt-4 w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
                    >
                      {room.startedAt ? "Жеребьевка завершена" : "Запустить старт"}
                    </button>
                    {room.participants.length < 2 && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Нужно минимум два участника.
                      </p>
                    )}
                  </div>
                )}

                {youAreInRoom && (
                  <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
                    <p className="text-sm uppercase tracking-[0.4em] text-red-500">
                      Ваш получатель
                    </p>
                    {!alreadyStarted && (
                      <p className="mt-3 text-lg text-red-700 dark:text-red-200">
                        Ждем, когда организатор нажмет «Старт».
                      </p>
                    )}
                    {alreadyStarted && assignmentName && (
                      <>
                        <p className="mt-4 text-sm text-red-400">Дарите подарок</p>
                        <p className="text-3xl font-semibold text-red-600 dark:text-red-200">
                          {assignmentName}
                        </p>
                        <p className="mt-2 text-sm text-red-500 dark:text-red-200/90">
                          Никто больше не увидит этого имени, кроме вас.
                        </p>
                      </>
                    )}
                    {alreadyStarted && !assignmentName && (
                      <p className="mt-4 text-lg text-red-700 dark:text-red-200">
                        Мы не нашли вашу запись. Попробуйте перезагрузить страницу.
                      </p>
                    )}
                  </div>
                )}

                {actionError && (
                  <p className="text-sm text-red-500">{actionError}</p>
                )}
                {infoMessage && (
                  <p className="text-sm text-green-600">{infoMessage}</p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

import { randomUUID } from "crypto";

type Participant = {
  id: string;
  name: string;
  joinedAt: number;
  token: string;
};

type Room = {
  id: string;
  name: string;
  createdAt: number;
  ownerToken: string;
  participants: Participant[];
  startedAt?: number;
  assignments?: Record<string, string>;
};

export type PublicRoom = {
  id: string;
  name: string;
  createdAt: number;
  startedAt?: number;
  participants: Array<{
    id: string;
    name: string;
    joinedAt: number;
  }>;
};

export type SelfInfo = {
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

const MAX_ROOMS = 20;

class RoomsStore {
  #rooms = new Map<string, Room>();

  createRoom(roomName: string, hostName: string) {
    const id = this.#generateRoomId();
    const ownerToken = randomUUID();
    const hostParticipant: Participant = {
      id: randomUUID(),
      name: hostName,
      joinedAt: Date.now(),
      token: ownerToken,
    };
    const room: Room = {
      id,
      name: roomName,
      createdAt: Date.now(),
      ownerToken,
      participants: [hostParticipant],
    };

    this.#rooms.set(room.id, room);
    this.#pruneRooms();

    return { room: this.#toPublicRoom(room), ownerToken, participant: hostParticipant };
  }

  #pruneRooms() {
    while (this.#rooms.size > MAX_ROOMS) {
      let oldestRoomId: string | null = null;
      let oldestDate = Number.MAX_SAFE_INTEGER;
      for (const [id, room] of this.#rooms) {
        if (room.createdAt < oldestDate) {
          oldestDate = room.createdAt;
          oldestRoomId = id;
        }
      }
      if (!oldestRoomId) break;
      this.#rooms.delete(oldestRoomId);
    }
  }

  getRoom(roomId: string): PublicRoom | null {
    const room = this.#rooms.get(roomId);
    if (!room) return null;
    return this.#toPublicRoom(room);
  }

  joinRoom(roomId: string, participantName: string) {
    const room = this.#rooms.get(roomId);
    if (!room) throw new Error("Комната не найдена");
    if (room.startedAt) throw new Error("Жеребьевка уже началась");

    const token = randomUUID();
    const participant: Participant = {
      id: randomUUID(),
      name: participantName,
      joinedAt: Date.now(),
      token,
    };
    room.participants.push(participant);
    return { participant, room: this.#toPublicRoom(room), token };
  }

  removeParticipant(roomId: string, ownerToken: string, participantId: string) {
    const room = this.#rooms.get(roomId);
    if (!room) throw new Error("Комната не найдена");
    if (room.ownerToken !== ownerToken) throw new Error("Нет прав для удаления");
    if (room.startedAt) throw new Error("Жеребьевка уже началась");

    const index = room.participants.findIndex((p) => p.id === participantId);
    if (index === -1) throw new Error("Участник не найден");

    const participant = room.participants[index];
    if (participant.token === room.ownerToken) {
      throw new Error("Нельзя удалить организатора");
    }

    room.participants.splice(index, 1);

    return room.participants.map((p) => ({
      id: p.id,
      name: p.name,
      joinedAt: p.joinedAt,
    }));
  }

  startRoom(roomId: string, token: string) {
    const room = this.#rooms.get(roomId);
    if (!room) throw new Error("Комната не найдена");
    if (room.ownerToken !== token) throw new Error("Нет прав для запуска жеребьевки");
    if (room.participants.length < 2) {
      throw new Error("Нужно минимум два участника");
    }

    const assignments = this.#buildAssignments(room.participants);
    room.assignments = assignments;
    room.startedAt = Date.now();

    return {
      startedAt: room.startedAt,
      assignmentsCount: Object.keys(assignments).length,
    };
  }

  getSelf(roomId: string, token: string): SelfInfo {
    const room = this.#rooms.get(roomId);
    if (!room) throw new Error("Комната не найдена");

    const participant = room.participants.find((p) => p.token === token);
    if (!participant) throw new Error("Участник не найден");

    const assignmentId = room.assignments?.[participant.id];
    const assignedTo = assignmentId
      ? room.participants.find((p) => p.id === assignmentId)
      : undefined;

    return {
      participant: {
        id: participant.id,
        name: participant.name,
        isOwner: participant.token === room.ownerToken,
      },
      assignedTo: assignedTo
        ? { id: assignedTo.id, name: assignedTo.name }
        : undefined,
    };
  }

  #toPublicRoom(room: Room): PublicRoom {
    return {
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      startedAt: room.startedAt,
      participants: room.participants.map((p) => ({
        id: p.id,
        name: p.name,
        joinedAt: p.joinedAt,
      })),
    };
  }

  #generateRoomId() {
    return Math.random().toString(36).slice(2, 8);
  }

  #buildAssignments(participants: Participant[]): Record<string, string> {
    const ids = participants.map((p) => p.id);
    const receivers = [...ids];

    for (let i = receivers.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }

    // Ensure no participant gifts to themselves.
    for (let i = 0; i < ids.length; i += 1) {
      if (ids[i] === receivers[i]) {
        const swapWith = (i + 1) % ids.length;
        [receivers[i], receivers[swapWith]] = [receivers[swapWith], receivers[i]];
      }
    }

    const assignments: Record<string, string> = {};
    ids.forEach((id, index) => {
      assignments[id] = receivers[index];
    });
    return assignments;
  }
}

const globalStore = globalThis as typeof globalThis & {
  __roomsStore?: RoomsStore;
};

export const roomsStore = (globalStore.__roomsStore ??= new RoomsStore());

import { Collection } from "mongodb";
import { randomUUID } from "crypto";
import { getMongoClient } from "@/lib/mongodb";

type ParticipantDoc = {
  id: string;
  name: string;
  joinedAt: number;
  token: string;
};

type RoomDoc = {
  _id: string;
  name: string;
  createdAt: number;
  ownerToken: string;
  participants: ParticipantDoc[];
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

class RoomsStore {
  #collectionPromise: Promise<Collection<RoomDoc>>;

  constructor() {
    this.#collectionPromise = this.#prepareCollection();
  }

  async createRoom(roomName: string, hostName: string) {
    const collection = await this.#collectionPromise;
    const id = await this.#generateRoomId(collection);
    const ownerToken = randomUUID();
    const hostParticipant: ParticipantDoc = {
      id: randomUUID(),
      name: hostName,
      joinedAt: Date.now(),
      token: ownerToken,
    };
    const roomDoc: RoomDoc = {
      _id: id,
      name: roomName,
      createdAt: Date.now(),
      ownerToken,
      participants: [hostParticipant],
    };

    await collection.insertOne(roomDoc);

    return {
      room: this.#toPublicRoom(roomDoc),
      ownerToken,
      participant: hostParticipant,
    };
  }

  async getRoom(roomId: string) {
    const collection = await this.#collectionPromise;
    const room = await collection.findOne({ _id: roomId });
    if (!room) return null;
    return this.#toPublicRoom(room);
  }

  async joinRoom(roomId: string, participantName: string) {
    const collection = await this.#collectionPromise;
    const room = await collection.findOne({ _id: roomId });
    if (!room) throw new Error("Комната не найдена");
    if (room.startedAt) throw new Error("Жеребьевка уже началась");

    const participant: ParticipantDoc = {
      id: randomUUID(),
      name: participantName,
      joinedAt: Date.now(),
      token: randomUUID(),
    };

    await collection.updateOne(
      { _id: roomId },
      { $push: { participants: participant } },
    );

    const updatedRoom = await collection.findOne({ _id: roomId });
    if (!updatedRoom) throw new Error("Комната не найдена после обновления");

    return { room: this.#toPublicRoom(updatedRoom), participant };
  }

  async startRoom(roomId: string, token: string) {
    const collection = await this.#collectionPromise;
    const room = await collection.findOne({ _id: roomId });
    if (!room) throw new Error("Комната не найдена");
    if (room.ownerToken !== token) throw new Error("Нет прав для запуска жеребьевки");
    if (room.participants.length < 2) {
      throw new Error("Нужно минимум два участника");
    }

    const assignments = this.#buildAssignments(room.participants);
    const startedAt = Date.now();
    await collection.updateOne(
      { _id: roomId },
      { $set: { assignments, startedAt } },
    );

    return {
      startedAt,
      assignmentsCount: Object.keys(assignments).length,
    };
  }

  async getSelf(roomId: string, token: string): Promise<SelfInfo> {
    const collection = await this.#collectionPromise;
    const room = await collection.findOne({ _id: roomId });
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

  async removeParticipant(roomId: string, ownerToken: string, participantId: string) {
    const collection = await this.#collectionPromise;
    const room = await collection.findOne({ _id: roomId });
    if (!room) throw new Error("Комната не найдена");
    if (room.ownerToken !== ownerToken) throw new Error("Нет прав для удаления");
    if (room.startedAt) throw new Error("Жеребьевка уже началась");

    const target = room.participants.find((p) => p.id === participantId);
    if (!target) throw new Error("Участник не найден");
    if (target.token === room.ownerToken) {
      throw new Error("Нельзя удалить организатора");
    }

    await collection.updateOne(
      { _id: roomId },
      { $pull: { participants: { id: participantId } } },
    );

    const updatedRoom = await collection.findOne({ _id: roomId });
    if (!updatedRoom) throw new Error("Комната не найдена после удаления");

    return updatedRoom.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      joinedAt: participant.joinedAt,
    }));
  }

  async getParticipants(roomId: string) {
    const collection = await this.#collectionPromise;
    const room = await collection.findOne({ _id: roomId });
    if (!room) throw new Error("Комната не найдена");
    return room.participants.map((p) => ({
      id: p.id,
      name: p.name,
      joinedAt: p.joinedAt,
    }));
  }

  async #prepareCollection() {
    const client = await getMongoClient();
    const collection = client.db().collection<RoomDoc>("rooms");
    await collection.createIndex({ createdAt: 1 });
    await collection.createIndex({ ownerToken: 1 });
    await collection.createIndex({ "participants.token": 1 });
    return collection;
  }

  #toPublicRoom(room: RoomDoc): PublicRoom {
    return {
      id: room._id,
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

  async #generateRoomId(collection: Collection<RoomDoc>) {
    for (let i = 0; i < 10; i += 1) {
      const id = Math.random().toString(36).slice(2, 8);
      const exists = await collection.findOne({ _id: id });
      if (!exists) {
        return id;
      }
    }
    // очень маловероятно, но если повторяется, печатаем UUID
    return randomUUID();
  }

  #buildAssignments(participants: ParticipantDoc[]): Record<string, string> {
    const ids = participants.map((p) => p.id);
    const receivers = [...ids];

    for (let i = receivers.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }

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

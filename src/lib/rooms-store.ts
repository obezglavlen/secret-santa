import mongoose, { Document, Model } from "mongoose";
import { randomUUID } from "crypto";
import { initMongoose } from "@/lib/mongoose";

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

type RoomDocument = Document<unknown, unknown, RoomDoc> & RoomDoc;

const participantSchema = new mongoose.Schema<ParticipantDoc>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    joinedAt: { type: Number, required: true },
    token: { type: String, required: true },
  },
  { _id: false },
);

const roomSchema = new mongoose.Schema<RoomDocument>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Number, required: true },
  ownerToken: { type: String, required: true },
  participants: { type: [participantSchema], default: [], required: true },
  startedAt: { type: Number },
  assignments: { type: Map, of: String },
});

const RoomModel: Model<RoomDocument> =
  mongoose.models.Room ?? mongoose.model<RoomDocument>("Room", roomSchema);

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
  #ready = initMongoose();

  async createRoom(roomName: string, hostName: string) {
    await this.#ready;
    const id = await this.#generateRoomId();
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
    await RoomModel.create(roomDoc);

    return {
      room: this.#toPublicRoom(roomDoc),
      ownerToken,
      participant: hostParticipant,
    };
  }

  async getRoom(roomId: string) {
    await this.#ready;
    const room = await RoomModel.findById(roomId).lean();
    if (!room) return null;
    return this.#toPublicRoom(room);
  }

  async joinRoom(roomId: string, participantName: string) {
    await this.#ready;
    const room = await RoomModel.findById(roomId);
    if (!room) throw new Error("Комната не найдена");
    if (room.startedAt) throw new Error("Жеребьевка уже началась");

    const participant: ParticipantDoc = {
      id: randomUUID(),
      name: participantName,
      joinedAt: Date.now(),
      token: randomUUID(),
    };
    room.participants.push(participant);
    await room.save();

    return {
      room: this.#toPublicRoom(room.toObject()),
      participant,
    };
  }

  async removeParticipant(roomId: string, ownerToken: string, participantId: string) {
    await this.#ready;
    const room = await RoomModel.findById(roomId);
    if (!room) throw new Error("Комната не найдена");
    if (room.ownerToken !== ownerToken) throw new Error("Нет прав для удаления");
    if (room.startedAt) throw new Error("Жеребьевка уже началась");

    const entry = room.participants.find((p) => p.id === participantId);
    if (!entry) throw new Error("Участник не найден");
    if (entry.token === room.ownerToken) {
      throw new Error("Нельзя удалить организатора");
    }

    room.participants = room.participants.filter((p) => p.id !== participantId);
    await room.save();

    return room.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      joinedAt: participant.joinedAt,
    }));
  }

  async startRoom(roomId: string, token: string) {
    await this.#ready;
    const room = await RoomModel.findById(roomId);
    if (!room) throw new Error("Комната не найдена");
    if (room.ownerToken !== token) throw new Error("Нет прав для запуска жеребьевки");
    if (room.participants.length < 2) {
      throw new Error("Нужно минимум два участника");
    }

    const assignments = this.#buildAssignments(room.participants);
    room.assignments = assignments;
    room.startedAt = Date.now();
    await room.save();

    return {
      startedAt: room.startedAt,
      assignmentsCount: Object.keys(assignments).length,
    };
  }

  async getSelf(roomId: string, token: string) {
    await this.#ready;
    const room = await RoomModel.findById(roomId).lean();
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

  async getParticipants(roomId: string) {
    await this.#ready;
    const room = await RoomModel.findById(roomId).lean();
    if (!room) throw new Error("Комната не найдена");
    return room.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      joinedAt: participant.joinedAt,
    }));
  }

  async #generateRoomId() {
    for (let i = 0; i < 10; i += 1) {
      const id = Math.random().toString(36).slice(2, 8);
      const exists = await RoomModel.exists({ _id: id });
      if (!exists) return id;
    }
    return randomUUID();
  }

  #toPublicRoom(room: RoomDoc) {
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

  #buildAssignments(participants: ParticipantDoc[]) {
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

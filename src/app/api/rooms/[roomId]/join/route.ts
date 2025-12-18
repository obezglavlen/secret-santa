import { NextRequest, NextResponse } from "next/server";
import { roomsStore } from "@/lib/rooms-store";

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } },
) {
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const {roomId} = await params;

  if (!name) {
    return NextResponse.json(
      { error: "Введите имя перед входом" },
      { status: 400 },
    );
  }

  try {
    const { participant, room, token } = roomsStore.joinRoom(
      roomId,
      name,
    );
    return NextResponse.json({
      room,
      participant: { id: participant.id, name: participant.name },
      token,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось присоединиться";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

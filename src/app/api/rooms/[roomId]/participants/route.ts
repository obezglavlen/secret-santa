import { NextRequest, NextResponse } from "next/server";
import { roomsStore } from "@/lib/rooms-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: { roomId: string } },
) {
  const {roomId} = await params;
  const room = roomsStore.getRoom(roomId);

  if (!room) {
    return NextResponse.json({ error: "Комната не найдена" }, { status: 404 });
  }

  return NextResponse.json({ participants: room.participants });
}

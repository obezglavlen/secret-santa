import { NextRequest, NextResponse } from "next/server";
import { roomsStore } from "@/lib/rooms-store";
import { resolveRoomParams } from "@/lib/route-params";
import type { WishlistItem } from "@/types/secret-santa";

function parseWishlist(items: unknown[]): WishlistItem[] {
  return items.flatMap((item) => {
    if (typeof item === "string") {
      const text = item.trim();
      return text ? [{ id: "", text, description: "" }] : [];
    }

    if (!item || typeof item !== "object") {
      return [];
    }

    const payload = item as {
      id?: unknown;
      text?: unknown;
      title?: unknown;
      description?: unknown;
    };
    const text = String(payload.text ?? payload.title ?? "").trim();
    const description = String(
      payload.description ?? "",
    ).trim();
    const id = typeof payload.id === "string" ? payload.id.trim() : "";

    return text ? [{ id, text, description }] : [];
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const body = await request.json().catch(() => ({}));
  const token = String(body?.token ?? "").trim();
  const roomId = await resolveRoomParams(params);
  const rawWishlist: unknown[] = Array.isArray(body?.wishlist)
    ? body.wishlist
    : [];
  const wishlist = parseWishlist(rawWishlist);

  if (!token) {
    return NextResponse.json(
      { error: "Нужен токен участника" },
      { status: 400 }
    );
  }

  try {
    const updated = await roomsStore.updateWishlist(roomId, token, wishlist);
    return NextResponse.json({ ownerWishlist: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось обновить вишлист";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

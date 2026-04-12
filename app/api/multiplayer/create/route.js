import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { MultiplayerLobby } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const { mockIdRef, hostEmail } = await req.json();
    if (!mockIdRef || !hostEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const roomId = uuidv4();

    await db.insert(MultiplayerLobby).values({
      roomId,
      mockIdRef,
      hostEmail,
      gameState: "waiting",
      turn: "host",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, roomId });
  } catch (error) {
    console.error("Lobby creation error:", error);
    return NextResponse.json({ error: "Failed to create multiplayer lobby" }, { status: 500 });
  }
}

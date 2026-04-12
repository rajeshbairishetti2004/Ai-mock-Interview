import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  try {
    const { roomId, event, data } = await req.json();

    if (!roomId || !event) {
      return NextResponse.json({ error: "Missing roomId or event" }, { status: 400 });
    }

    // Broadcast the event to all clients listening to this room channel
    await pusher.trigger(roomId, event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pusher trigger error:", error);
    return NextResponse.json({ error: "Failed to broadcast signal" }, { status: 500 });
  }
}

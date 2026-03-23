import { NextResponse } from "next/server";
import { MockInterview } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import { db } from "@/utils/db";
export async function GET(req) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    

    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.createdBy, email))
      .orderBy(desc(MockInterview.id));

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to fetch" });
  }
}
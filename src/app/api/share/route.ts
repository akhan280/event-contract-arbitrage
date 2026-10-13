import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { shareSchema } from "@/lib/schemas";

// Shares expire after 72 hours. The daily cron deletes expired rows.
const SHARE_TTL_HOURS = 72;
const MAX_BODY_BYTES = 64 * 1024;

const getExpirationTime = () => {
  const date = new Date();
  date.setHours(date.getHours() + SHARE_TTL_HOURS);
  return date;
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    if (body.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Share is too large" }, { status: 413 });
    }

    const parsed = shareSchema.safeParse(JSON.parse(body));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid share data" }, { status: 400 });
    }

    const share = await prisma.share.create({
      data: {
        id: randomBytes(6).toString("base64url"),
        data: parsed.data,
        expiresAt: getExpirationTime(),
      },
    });

    return NextResponse.json({ id: share.id });
  } catch (error) {
    console.error("Error creating share:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    }

    const share = await prisma.share.findUnique({ where: { id } });
    if (!share || new Date() > share.expiresAt) {
      return NextResponse.json({ error: "Share not found or expired" }, { status: 404 });
    }

    return NextResponse.json({ data: share.data });
  } catch (error) {
    console.error("Error fetching share:", error);
    return NextResponse.json({ error: "Failed to fetch share data" }, { status: 500 });
  }
}

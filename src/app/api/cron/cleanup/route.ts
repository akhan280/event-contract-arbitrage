import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedShares = await prisma.share.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return NextResponse.json({
      message: `Deleted ${deletedShares.count} expired shares`,
      count: deletedShares.count,
    });
  } catch (error) {
    console.error("Error cleaning up expired shares:", error);
    return NextResponse.json({ error: "Failed to cleanup expired shares" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Set expiration time to 72 hours from now (vercel cron job cleans up)
const getExpirationTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 72);
    return date;
};

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const id = nanoid(8);

        const share = await prisma.share.create({
            data: {
                id,
                data: data,
                expiresAt: getExpirationTime(),
            },
        });

        return NextResponse.json({ id: share.id });
    } catch (error) {
        console.error("Error creating share:", error);
        return NextResponse.json(
        { error: "Failed to create share link" },
        { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
        return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        const share = await prisma.share.findUnique({
        where: { id },
        });

        if (!share) {
        return NextResponse.json({ error: "Share not found" }, { status: 404 });
        }

        // Check if share has expired
        if (new Date() > share.expiresAt) {
        // Delete expired share
        await prisma.share.delete({
            where: { id },
        });
        return NextResponse.json({ error: "Share has expired" }, { status: 410 });
        }

        return NextResponse.json({ data: share.data });
    } catch (error) {
        console.error("Error fetching share:", error);
        return NextResponse.json(
        { error: "Failed to fetch share data" },
        { status: 500 }
        );
    }
}

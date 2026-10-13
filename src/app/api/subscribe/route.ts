import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { subscribeSchema } from "@/lib/schemas";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const parsed = subscribeSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    const { email } = parsed.data;

    // Send the welcome email one time per address, so the form cannot flood an inbox.
    const existing = await prisma.eventarbemails.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Subscribed successfully" });
    }

    await prisma.eventarbemails.create({ data: { email } });

    await resend.emails.send({
      from: "Event Arb <alerts@eventarb.com>",
      to: email,
      subject: "Welcome to Event Arb",
      html: `
        <h1>Welcome to Event Arb!</h1>
        <p>Thank you for subscribing. We will email you when we ship new features.</p>
        <p>If you did not sign up, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Error subscribing:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

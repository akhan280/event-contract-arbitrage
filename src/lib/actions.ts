"use server"

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function submitSupportInquiry({
  name,
  message,
}: {
  name: string;
  message: string;
}): Promise<{ response: string | null; error: string | null }> {
    console.log(name, message);
    if (!name || !message) {
        return {
            response: null,
            error: "Invalid inputs",
        };
    }

    try {
        const data = await prisma.eventArbSupportRequests.create({
            data: {
                name: name,
                message: message,
            },
        });
        console.log(data, "support requests");
    } catch (e) {
        console.log("[ACTION] Submit Support Inquiry Error", e);
        return {
            response: null,
            error: "An error occured",
        };
    }

    return {
        response: "Successfully submitted support request",
        error: null,
    };
}


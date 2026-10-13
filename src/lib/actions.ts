"use server";

import { prisma } from "./prisma";
import { supportSchema } from "./schemas";

export async function submitSupportInquiry(input: {
  name: string;
  message: string;
}): Promise<{ response: string | null; error: string | null }> {
  const parsed = supportSchema.safeParse(input);
  if (!parsed.success) {
    return { response: null, error: "Invalid inputs" };
  }

  try {
    await prisma.eventArbSupportRequests.create({ data: parsed.data });
  } catch (e) {
    console.error("[ACTION] Submit Support Inquiry Error", e);
    return { response: null, error: "An error occurred" };
  }

  return { response: "Successfully submitted support request", error: null };
}

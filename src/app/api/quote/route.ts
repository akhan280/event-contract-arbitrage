import { NextResponse } from "next/server";
import { fetchQuote, parseVenueUrl, QuoteError } from "@/lib/quotes";

// Runs on the server because the venue APIs do not allow browser requests from our domain.
export async function GET(req: Request) {
  const link = new URL(req.url).searchParams.get("url");
  if (!link || link.length > 500) {
    return NextResponse.json({ error: "Paste a Kalshi or Polymarket link." }, { status: 400 });
  }

  try {
    const quote = await fetchQuote(parseVenueUrl(link));
    // Share links accept names of 200 characters or less.
    quote.title = quote.title.slice(0, 200);
    quote.options = quote.options.map((o) => ({ ...o, name: o.name.slice(0, 200) }));
    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof QuoteError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("Error fetching quote:", error);
    return NextResponse.json({ error: "Could not reach the venue. Try again soon." }, { status: 502 });
  }
}

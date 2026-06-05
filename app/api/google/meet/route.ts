import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getUserByEmail, setUserRefreshToken } from "@/lib/users";

interface InvitePayload {
  attendeeEmail: string;
  summary?: string;
  description?: string;
  startTime?: string; // ISO
  durationMinutes?: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as InvitePayload;
    if (!body?.attendeeEmail) {
      return NextResponse.json({ error: "Missing attendeeEmail" }, { status: 400 });
    }

    let accessToken = (session as any).accessToken as string | undefined;

    // If we don't have an access token in session, try to refresh using stored refresh token
    if (!accessToken) {
      const userRec = await getUserByEmail(session.user.email as string);
      const refreshToken = userRec?.refreshToken;
      if (refreshToken) {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID ?? "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        });

        if (tokenRes.ok) {
          const tokenJson = await tokenRes.json();
          accessToken = tokenJson.access_token;
          if (tokenJson.refresh_token) {
            // Google rarely returns a refresh_token on refresh, but if it does, persist it
            await setUserRefreshToken(session.user.email as string, tokenJson.refresh_token);
          }
        } else {
          console.warn("Failed to refresh Google access token", await tokenRes.text());
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Google access token. Re-auth with Google including Calendar scope." },
        { status: 403 }
      );
    }

    const start = body.startTime ? new Date(body.startTime) : new Date(Date.now() + 60 * 60 * 1000);
    const duration = body.durationMinutes ?? 30;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const event = {
      summary: body.summary ?? "Spotkanie (Google Meet)",
      description: body.description ?? "Zaproszenie na spotkanie wygenerowane z aplikacji",
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees: [{ email: body.attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Google Calendar API error:", txt);
      return NextResponse.json({ error: "Google Calendar API error", detail: txt }, { status: 502 });
    }

    const data = await res.json();

    return NextResponse.json({ ok: true, event: data }, { status: 201 });
  } catch (err) {
    console.error("Create Meet invite failed:", err);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}

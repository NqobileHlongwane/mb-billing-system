import { google } from "googleapis";
import { oauth2Client } from "../config/google.js";
import Billing from "../db.js";
import { supabase } from "../config/supabase.js";
import { extractClientName } from "../utils/parser.js";
import { getUserFromToken } from "../utils/auth.js"; // IMPORTANT
import { parseCalendarEvent } from "../utils/aiParser.js";



const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
];

// connect Google
export const connectGoogle = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("AUTH HEADER:", req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }


  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
     state: token, 
  });

  res.send(url); 
};

// Callback
export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) throw new Error("No code from Google");

    const token = state;
    if (!token) throw new Error("No token from state");

    // get user + supabase client properly
    const { user, supabaseUser } = await getUserFromToken({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    console.log("CALLBACK USER:", user.id);

    // exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log("GOOGLE TOKENS:", tokens);

    // save tokens
    const { error } = await supabaseUser
      .from("google_tokens")
      .upsert([
        {
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
        },
      ]);

    if (error) throw error;

    console.log("TOKENS SAVED FOR:", user.id);

    res.send("Google Connected ;)");

  } catch (err) {
    console.error("CALLBACK ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Sync Calendar
export const syncCalendar = async (req, res) => {
  try {
    const { user, supabaseUser } = await getUserFromToken(req);
    const user_id = user.id;

    console.log("SYNC USER:", user_id);

    // Get tokens
    const { data: tokenData, error: tokenError } = await supabaseUser
      .from("google_tokens")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) throw tokenError;
    if (!tokenData) throw new Error("No Google tokens found");

    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    });

    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // last 7 days
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items;
    console.log("EVENTS:", events);

console.log("EVENT COUNT:", events.length);
console.log("FIRST EVENT:", events[0]);

    for (const event of events) {
      const start = event.start?.dateTime;
      const end = event.end?.dateTime;

      if (!start || !end) continue;

      // PARSE EVENT
     const parsed = parseCalendarEvent(event.summary);
console.log("AI PARSED:", parsed);
      console.log("EVENT:", event.summary);

      //  1. UPSERT CLIENT
      const { data: client, error: clientError } = await supabaseUser
        .from("clients")
        .upsert(
            {
    name: parsed.client,
    user_id,
  },
  { onConflict: ["name", "user_id"] }
        )
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. UPSERT MATTER
      const { data: matter, error: matterError } = await supabaseUser
        .from("matters")
        .upsert(
           {
    title: parsed.matter,
    client_id: client.id,
    user_id,
  },
  { onConflict: ["title", "client_id"] }
        )
        .select()
        .single();

      if (matterError) throw matterError;

      //  3. PREVENT DUPLICATE TIME ENTRIES
      const { data: existing } = await supabaseUser
        .from("time_entries")
        .select("id")
        .eq("user_id", user_id)
        .eq("start_time", start)
        .eq("end_time", end)
        .eq("matter_id", matter.id)
        .maybeSingle();

      if (existing) {
        console.log("Skipping duplicate event");
        continue;
      }

      // 4. CREATE TIME ENTRY
      const durationHours =
  (new Date(end) - new Date(start)) / (1000 * 60 * 60);

const rate = 500; // example hourly rate

const amount = durationHours * rate;

if (!client || !matter) {
  console.log("Skipping invalid event");
  continue;
}
      const { error: timeError } = await supabaseUser
        .from("time_entries")
        .insert([
          {
            user_id,
            matter_id: matter.id,
            description: event.summary || "Calendar Event",
            start_time: start,
            end_time: end,
duration: durationHours,
            billable: true,
            amount,

          },
        ]);

      if (timeError) throw timeError;
    }

    //Invoicing
    //set invoiced to false. then processs calculations
    const { data: entries } = await supabaseUser
  .from("time_entries")
  .select("*, matters(id , client_id)")
  .eq("invoiced", false)
  .eq("user_id", user.id);

  //GROUP BY CLIENT
  const grouped = {};

entries.forEach((entry) => {
 if (!entry.matters) {
  console.log("Skipping entry with missing matter relation");
  return;
}

const clientId = entry.matters.client_id;
  if (!grouped[clientId]) {
    grouped[clientId] = [];
  }

  grouped[clientId].push(entry);
});

//CREATE INVOICES FOR EACH CLIENT

  for (const clientId in grouped) {
  const clientEntries = grouped[clientId];

  const total = clientEntries.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const { data: invoice, error } = await supabaseUser
    .from("invoices")
    .insert([
      {
        client_id: clientId,
        total_amount: total,
        status: "draft",
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // mark entries as invoiced
  await supabaseUser
    .from("time_entries")
    .update({ invoiced: true })
    .in(
      "id",
      clientEntries.map((e) => e.id)
    );
}
    res.json({
      message: "Calendar synced successfully",
      count: events.length,
    });

  } catch (err) {
    console.error("SYNC ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
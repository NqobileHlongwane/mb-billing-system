import { parseEvent } from "../utils/eventParser.js";

// Wrapper for event parsing
export const parseCalendarEvent = (text) => {
  try {
    //TEXT : client : matter
    const parsed = parseEvent(text);

    if (!parsed.client || !parsed.matter) {
      throw new Error("Invalid parsed data");
    }

    return parsed;

  } catch (err) {
    console.log("Parse failed .. using fallback");

    return {
      client: "Unknown Client",
      matter: text || "General Work",
    };
  }
};
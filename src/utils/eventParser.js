export const parseEvent = (title) => {
  if (!title || typeof title !== "string") {
    return {
      client: "Unknown Client",
      matter: "General Work",
    };
  }

  // Normalize spacing
  //remove trailing or leading  white spaces or  characters  from string
  title = title.trim();

  // BEST CASE: "Client - Matter"
  if (title.includes("-")) {
    const [client, ...rest] = title.split("-");
    return {
      client: client.trim(),
      matter: rest.join("-").trim() || "General Work",
    };
  }

  // SECOND CASE: "Client: Matter"
  if (title.includes(":")) {
    const [client, ...rest] = title.split(":");
    return {
      client: client.trim(),
      matter: rest.join(":").trim() || "General Work",
    };
  }

  //FALLBACK
  const words = title.split(" ");

//client  matter
  return {
    //use word spacing
    client: words.slice(0, 2).join(" "), // first 2 words
    matter: words.slice(2).join(" ") || "Consultation",
  };
};
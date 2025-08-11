function extractMessages(payload) {
  const results = [];
  try {
    const entries = payload.metaData?.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const ch of changes) {
        const value = ch.value || {};
        const contacts = value.contacts || [];
        const messages = value.messages || [];

        // Default name & wa_id
        let name = contacts[0]?.profile?.name || "Unknown";
        let wa_id = contacts[0]?.wa_id || messages[0]?.from || messages[0]?.to || "";

        for (const m of messages) {
          results.push({
            wa_id,
            name,
            number: wa_id,
            id: m.id,
            meta_msg_id: m.id,
            from: m.from,
            to: m.to || value.metadata?.display_phone_number,
            text: m.text?.body || "",
            timestamp: m.timestamp
              ? new Date(Number(m.timestamp) * 1000)
              : new Date(),
            status: "sent",
            direction:
              m.from &&
              value.metadata?.display_phone_number &&
              m.from === value.metadata.display_phone_number
                ? "out"
                : "in",
          });
        }
      }
    }
  } catch (err) {
    console.error("Error extracting messages:", err.message);
  }
  return results;
}

export default extractMessages;

import express from "express";
import Message from "../models/Message.js";
import extractMessages from "../utils/extractMessages.js"; 

const router = express.Router();

router.post("/", async (req, res) => {
  const payload = req.body;
  const io = req.app.get("io");

  try {
    const extractedMsgs = extractMessages(payload);

    if (extractedMsgs.length > 0) {
      const inserted = [];
      for (const doc of extractedMsgs) {
        const created = await Message.findOneAndUpdate(
          { id: doc.id },
          { $setOnInsert: doc },
          { upsert: true, new: true }
        );
        inserted.push(created);
        io.emit("message:new", created); 
      }
      return res.status(201).json({ inserted: inserted.length, details: inserted });
    }

   
    if (statuses.length > 0) {
      let modified = 0;
      for (const s of statuses) {
        const id = s.id || s.message_id || s.ref;
        const newStatus = s.status || s.event || s.state;
        const q = { $or: [{ id }, { meta_msg_id: id }] };
        const r = await Message.updateMany(q, { status: newStatus });
        modified += r.modifiedCount ?? r.nModified ?? 0;
        io.emit("message:status", { id, status: newStatus });
      }
      return res.json({ modified });
    }

    res.json({ ok: true, note: "No recognized data in payload" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "processing error" });
  }
});

export default router;

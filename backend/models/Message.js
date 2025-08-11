import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  wa_id: { type: String, required: true },         // user id (phone)
  name: { type: String, default: "Unknown" },
  number: { type: String, default: "" },
  id: { type: String, required: true, unique: true }, // message id from payload
  meta_msg_id: { type: String },                   // optional meta id to map status updates
  from: { type: String },                          // sender
  to: { type: String },                            // receiver
  text: { type: String },
  media: { type: Object, default: null },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["sent","delivered","read","pending"], default: "pending" },
  direction: { type: String, enum: ["in","out"], default: "in" } // in = incoming, out = sent by UI
}, { timestamps: true });

export default mongoose.model("Message", MessageSchema);

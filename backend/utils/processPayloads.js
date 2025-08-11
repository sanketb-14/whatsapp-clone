import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../models/Message.js";
import extractMessages from "./extractMessages.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Set MONGODB_URI in .env");
  process.exit(1);
}

const PAYLOAD_DIR = path.join(process.cwd(), "sample_payloads");

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB for seeding");
}

async function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.error("Invalid JSON:", filePath);
    return;
  }

  const msgs = extractMessages(payload);
  for (const doc of msgs) {
    await Message.updateOne({ id: doc.id }, { $setOnInsert: doc }, { upsert: true });
    console.log("Inserted/unchanged:", doc.id);
  }
}

async function main() {
  await connectDB();
  const files = fs.readdirSync(PAYLOAD_DIR).filter(f => f.endsWith(".json"));
  for (const f of files) {
    console.log("Processing:", f);
    await processFile(path.join(PAYLOAD_DIR, f));
  }
  console.log("Seeding done");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

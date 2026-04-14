import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_ADDRESS);
const db = mongoose.connection;
db.once("open", () => console.log("✅ DB Connected!"));
db.on("error", (err) => console.error("⛔️ DB Error", err));

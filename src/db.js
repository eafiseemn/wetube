import mongoose from "mongoose";

const MONGODB_ADDRESS = "mongodb://127.0.0.1:27017";

mongoose.connect(`${MONGODB_ADDRESS}/Wetube`);
const db = mongoose.connection;
db.once("open", () => console.log("✅ DB Connected!"));
db.on("error", (err) => console.error("⛔️ DB Error", err));

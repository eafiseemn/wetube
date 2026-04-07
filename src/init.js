import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

// Express Port Setup
const PORT = 4000;

// Server Listening
const handleListening = () => console.log(`✅ Server Listening on http://localhost:${PORT} 🚀`);
app.listen(PORT, handleListening);

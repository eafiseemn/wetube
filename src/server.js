import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";

const app = express();

// Logger Middleware
const logger = morgan("dev");
app.use(logger);

// Frontend Middleware
app.use("/static", express.static("src/client"));

// Form Middleware
app.use(express.urlencoded({ extended: true }));

// Html Renderer
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

// Session Middleware
app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({ mongoUrl: process.env.MONGODB_ADDRESS }),
	}),
);

app.use(localsMiddleware);

// Static
app.use("/uploads", express.static("uploads"));

// Router Settings
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

// 404 Page Rendering
app.use((req, res) => res.status(404).render("404", { pageTitle: "Page Not Found" }));

export default app;

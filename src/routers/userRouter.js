import express from "express";
import {
	profile,
	edit,
	logout,
	startGithubLogin,
	finishGithubLogin,
	getEdit,
	postEdit,
} from "../controllers/userController";
import { publicOnlyMiddleware, userOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/logout", userOnlyMiddleware, logout);
userRouter.route("/edit").all(userOnlyMiddleware).get(getEdit).post(postEdit);
userRouter.get("/:id", userOnlyMiddleware, profile);

export default userRouter;

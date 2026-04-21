import express from "express";
import {
	profile,
	edit,
	logout,
	startGithubLogin,
	finishGithubLogin,
	getEdit,
	postEdit,
	getChangePassword,
	postChangePassword,
} from "../controllers/userController";
import { avatarUploader, publicOnlyMiddleware, userOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/logout", userOnlyMiddleware, logout);
userRouter
	.route("/edit")
	.all(userOnlyMiddleware)
	.get(getEdit)
	.post(avatarUploader.single("avatar"), postEdit);
userRouter
	.route("/change-password")
	.all(userOnlyMiddleware)
	.get(getChangePassword)
	.post(postChangePassword);
userRouter.get("/profile/:username", userOnlyMiddleware, profile);

export default userRouter;

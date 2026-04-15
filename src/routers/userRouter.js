import express from "express";
import {
	profile,
	edit,
	logout,
	startGithubLogin,
	finishGithubLogin,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/:id", profile);

export default userRouter;

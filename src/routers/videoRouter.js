import express from "express";
import {
	watch,
	remove,
	getUpload,
	postUpload,
	getEdit,
	postEdit,
} from "../controllers/videoController";
import { userOnlyMiddleware, videoUploader } from "../middlewares";

const videoRouter = express.Router();

videoRouter
	.route("/upload")
	.all(userOnlyMiddleware)
	.get(getUpload)
	.post(videoUploader.single("video"), postUpload);
videoRouter.get("/:id", watch);
videoRouter.route("/:id/edit").all(userOnlyMiddleware).get(getEdit).post(postEdit);
videoRouter.get("/:id/remove", userOnlyMiddleware, remove);

export default videoRouter;

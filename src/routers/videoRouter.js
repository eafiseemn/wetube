import express from "express";
import {
	watch,
	remove,
	getUpload,
	postUpload,
	getEdit,
	postEdit,
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.route("/upload").get(getUpload).post(postUpload);
videoRouter.get("/:id", watch);
videoRouter.route("/:id/edit").get(getEdit).post(postEdit);
videoRouter.get("/:id/remove", remove);

export default videoRouter;

import express from "express";
import { watch, edit, remove, getUpload, postUpload } from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.route("/upload").get(getUpload).post(postUpload);
videoRouter.get("/:id", watch);
videoRouter.get("/:id/edit", edit);
videoRouter.get("/:id/remove", remove);

export default videoRouter;

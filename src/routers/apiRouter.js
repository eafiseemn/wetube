import express from "express";
import {
	createComment,
	deleteComment,
	editComment,
	registerView,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id/view", registerView);
apiRouter.post("/videos/:id/comment", createComment);
apiRouter.route("/videos/comment/:id").post(editComment).delete(deleteComment);

export default apiRouter;

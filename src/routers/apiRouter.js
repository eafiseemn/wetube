import express from "express";
import { createComment, deleteComment, registerView } from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id/view", registerView);
apiRouter.post("/videos/:id/comment", createComment);
apiRouter.delete("/videos/comment/:id", deleteComment);

export default apiRouter;

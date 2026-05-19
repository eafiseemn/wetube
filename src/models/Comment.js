import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
		content: { type: String, required: true },
		owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
		video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
	},
	{
		timestamps: true,
	},
);

commentSchema.virtual("formattedDate").get(function () {
	const isUpdated = this.updatedAt > this.createdAt;
	return `${(isUpdated ? this.updatedAt : this.createdAt).toLocaleDateString("ko-KR")} ${isUpdated ? "Updated" : "Created"}`;
});

const commentModel = mongoose.model("Comment", commentSchema);
export default commentModel;

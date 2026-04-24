import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, maxLength: 80 },
		description: { type: String, required: true, trim: true, minLength: 20 },
		fileUrl: { type: String, required: true },
		owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
		// createdAt: { type: Date, required: true, default: Date.now },
		hashtags: [{ type: String, trim: true }],
		meta: {
			views: { type: Number, required: true, default: 0 },
			likes: { type: Number, required: true, default: 0 },
		},
	},
	{
		timestamps: true,
	},
);

videoSchema.static("formatHashtags", function (hashtags) {
	return hashtags.split(",").map((tag) => (tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`));
});

videoSchema.virtual("formattedDate").get(function () {
	const isUpdated = this.updatedAt > this.createdAt;
	return `${(isUpdated ? this.updatedAt : this.createdAt).toLocaleDateString("ko-KR")} ${isUpdated ? "Updated" : "Created"}`;
});

const videoModel = mongoose.model("Video", videoSchema);
export default videoModel;

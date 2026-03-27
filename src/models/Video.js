import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true, maxLength: 80 },
	description: { type: String, required: true, trim: true, minLength: 20 },
	// createdAt: { type: Date, required: true, default: Date.now },
	hashtags: [{ type: String, trim: true }],
	timestamps: true,
	meta: {
		views: { type: Number, required: true, default: 0 },
		likes: { type: Number, required: true, default: 0 },
	},
});

const videoModel = mongoose.model("Video", videoSchema);
export default videoModel;

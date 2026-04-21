import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		nickname: { type: String, required: true },
		password: String,
		avatarUrl: String,
		socialOnly: { type: Boolean, required: true, default: false },
		location: String,
		videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
	},
	{
		timestamps: true,
	},
);

userSchema.virtual("joinedAt").get(function () {
	return this.createdAt.toDateString("ko-KR");
});

userSchema.pre("save", async function () {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
});

const User = mongoose.model("User", userSchema);
export default User;

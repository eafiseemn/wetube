import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: String,
	avatarUrl: String,
	socialOnly: { type: Boolean, required: true, default: false },
	location: String,
});

userSchema.pre("save", async function () {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
});

const User = mongoose.model("User", userSchema);
export default User;

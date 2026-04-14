import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Create Account" });
export const postJoin = async (req, res) => {
	const { username, email, password, passwordConfirm, location } = req.body;
	const pageTitle = "Create Account";
	// Password Confirm
	if (password !== passwordConfirm) {
		return res.status(400).render("join", {
			pageTitle,
			errorMsg: "Passwords do not match. Please try again.",
			oldData: {
				username,
				email,
				location,
			},
		});
	}
	try {
		// Check for Duplicate Account
		const userExists = await User.findOne({ $or: [{ email }, { username }] }).select(
			"email username",
		);
		if (userExists) {
			const errorMsg =
				userExists.email === email
					? "This email is already registered."
					: "This username is already taken.";
			return res.status(400).render("join", {
				pageTitle,
				errorMsg,
				oldData: {
					username,
					email,
					location,
				},
			});
		}
		// Create Account
		await User.create({ username, email, password, location });
		return res.redirect("/login");
	} catch (err) {
		console.error("Join Error: ", err);
		return res
			.status(500)
			.render("join", { pageTitle, errorMsg: "Internal Server Error. Please try again later." });
	}
};
export const getLogin = (req, res) => res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
	const { username, password } = req.body;
	const pageTitle = "Login";
	try {
		// Check if account exists
		const user = await User.findOne({ username });
		if (!user) {
			return res
				.status(400)
				.render("login", { pageTitle, errorMsg: "An account with this username does not exist." });
		}
		// Check if password is correct
		const passwordCorrect = await bcrypt.compare(password, user.password);
		if (!passwordCorrect) {
			return res
				.status(400)
				.render("login", { pageTitle, errorMsg: "Wrong password. Please try again." });
		}
		// Login Success
		req.session.loggedIn = true;
		req.session.user = user;
		return res.redirect("/");
	} catch (err) {
		console.error("Login Error: ", err);
		return res
			.status(500)
			.render("login", { pageTitle, errorMsg: "Internal Server Error. Please try again later." });
	}
};
export const logout = (req, res) => res.send("Log Out");
export const profile = (req, res) => res.send("See Profile");
export const edit = (req, res) => res.send("Edit Profile");
export const remove = (req, res) => res.send("Delete Profile");

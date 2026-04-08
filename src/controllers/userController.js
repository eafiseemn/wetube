import User from "../models/User";

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
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Log Out");
export const profile = (req, res) => res.send("See Profile");
export const edit = (req, res) => res.send("Edit Profile");
export const remove = (req, res) => res.send("Delete Profile");

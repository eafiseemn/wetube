import User from "../models/User";
import bcrypt from "bcrypt";

/************** Join **************/

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

/************** LogIn **************/

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
		req.session.user = user.toObject();
		return res.redirect("/");
	} catch (err) {
		console.error("Login Error: ", err);
		return res
			.status(500)
			.render("login", { pageTitle, errorMsg: "Internal Server Error. Please try again later." });
	}
};

/************** Social Login (GitHub) **************/

export const startGithubLogin = (req, res) => {
	// Redirect to GitHub
	const baseUrl = "https://github.com/login/oauth/authorize";
	const config = {
		client_id: process.env.GITHUB_CLIENT,
		scope: "read:user user:email",
		allow_signup: false,
	};
	const params = new URLSearchParams(config).toString();
	const finalUrl = baseUrl + "?" + params;
	return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
	try {
		// request access token
		const baseUrl = "https://github.com/login/oauth/access_token";
		const config = {
			client_id: process.env.GITHUB_CLIENT,
			client_secret: process.env.GITHUB_SECRET,
			code: req.query.code,
		};
		const params = new URLSearchParams(config).toString();
		const finalUrl = baseUrl + "?" + params;
		const data = await fetch(finalUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		});
		const tokenRequest = await data.json();

		// fetch user information
		if ("access_token" in tokenRequest) {
			const accessToken = tokenRequest["access_token"];
			const apiUrl = "https://api.github.com/user";
			const headers = {
				Authorization: `token ${accessToken}`,
			};
			const userData = await (await fetch(apiUrl, { headers })).json();
			const emailData = await (await fetch(`${apiUrl}/emails`, { headers })).json();
			const emailObj = emailData.find((email) => email.primary === true && email.verified === true);

			if (!emailObj) {
				return res.status(400).render("login", {
					pageTitle,
					errorMsg: "Can't verify Email connected to your GitHub Account.",
				});
			}

			// Check if there's user having a same email account
			let user = await User.findOne({ email: emailObj.email });
			if (!user) {
				// Create new User if there's no registered user
				user = await User.create({
					username: userData.login,
					email: emailObj.email,
					password: "",
					avatarUrl: userData.avatar_url,
					socialOnly: true,
					location: userData.location,
				});
			}
			req.session.loggedIn = true;
			req.session.user = user.toObject();
			return res.redirect("/");
		} else {
			console.error("Github Token Error");
			return res.status(500).render("login", {
				pageTitle: "Login",
				errorMsg: "Internal Server Error. Please try again later.",
			});
		}
	} catch (err) {
		console.error("Github Login Error", err);
		return res.status(500).render("login", {
			pageTitle: "Login",
			errorMsg: "Internal Server Error. Please try again later.",
		});
	}
};

/************** Log Out **************/
export const logout = (req, res) => {
	req.session.destroy();
	return res.redirect("/");
};

export const profile = (req, res) => res.send("See Profile");
export const edit = (req, res) => res.send("Edit Profile");
export const remove = (req, res) => res.send("Delete Profile");

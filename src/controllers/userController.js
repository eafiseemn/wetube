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
		const user = await User.findOne({ username, socialOnly: false });
		if (!user) {
			return res
				.status(400)
				.render("login", { pageTitle, errorMsg: "An account with this username does not exist." });
		}
		// Check if password is correct
		const passwordCorrect = await bcrypt.compare(password, user.password);
		if (!passwordCorrect) {
			return res.status(400).render("login", {
				pageTitle,
				errorMsg: "Wrong password. Please try again.",
				oldData: { username },
			});
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
	const pageTitle = "Login";
	try {
		const { code } = req.query;
		if (!code) throw new Error("No code provided from GitHub");

		// request access token
		const baseUrl = "https://github.com/login/oauth/access_token";
		const config = {
			client_id: process.env.GITHUB_CLIENT,
			client_secret: process.env.GITHUB_SECRET,
			code,
		};
		const params = new URLSearchParams(config).toString();
		const finalUrl = baseUrl + "?" + params;
		const data = await fetch(finalUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});
		const tokenRequest = await data.json();

		if (!tokenRequest.access_token) {
			console.error("GitHub Token Error");
			return res.status(400).render("login", {
				pageTitle,
				errorMsg: "Failed to Authenticate through GitHub.",
			});
		}

		// fetch user information
		const apiUrl = "https://api.github.com";
		const headers = {
			Authorization: `token ${tokenRequest.access_token}`,
		};
		const [userFetch, emailFetch] = await Promise.all([
			fetch(`${apiUrl}/user`, { headers }),
			fetch(`${apiUrl}/user/emails`, { headers }),
		]);
		const userData = await userFetch.json();
		const emailData = await emailFetch.json();
		console.log(emailData);

		if (!userData.login) {
			return res.status(500).render("login", {
				pageTitle,
				errorMsg: "Unable to load GitHub account information.",
			});
		}
		// Check for the Email verification
		const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
		if (!emailObj) {
			return res.status(400).render("login", {
				pageTitle,
				errorMsg: "Can't find verified Email connected to your GitHub Account.",
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
	} catch (err) {
		console.error("Github Login Error", err);
		return res.status(500).render("login", {
			pageTitle,
			errorMsg: "Internal Server Error. Please try again later.",
		});
	}
};

/************** Log Out **************/

export const logout = (req, res) => {
	req.session.destroy();
	return res.redirect("/");
};

/************** Update Profile **************/

export const getEdit = (req, res) => res.render("edit-profile", { pageTitle: "Edit Profile" });
export const postEdit = async (req, res) => {
	const pageTitle = "Edit Profile";
	const {
		session: {
			user: { _id: id, username: oldUsername, email: oldEmail, location: oldLocation },
		},
		body: { username, email, location },
	} = req;

	if (username === oldUsername && email === oldEmail && location === oldLocation) {
		return res.status(400).render("edit-profile", { pageTitle, errorMsg: "No changes were made." });
	}

	try {
		// Check for Duplicate Account
		let errorMsg;
		if (username !== oldUsername && (await User.exists({ username }))) {
			errorMsg = "This username is already taken.";
		}
		if (email !== oldEmail && (await User.exists({ email }))) {
			errorMsg = "This email is already registered.";
		}
		if (errorMsg) {
			return res.status(400).render("edit-profile", {
				pageTitle,
				errorMsg,
				oldData: { ...req.body },
			});
		}

		// Update Account
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ username, email, location },
			{ returnDocument: "after" },
		).lean();
		req.session.user = updatedUser;
		return res.redirect("/users/edit");
	} catch (err) {
		console.error("Profile Update Error: ", err);
		return res.status(500).render("edit-profile", {
			pageTitle,
			errorMsg: "Something went wrong. Please try again later.",
		});
	}
};

export const profile = (req, res) => res.send("See Profile");
export const remove = (req, res) => res.send("Delete Profile");

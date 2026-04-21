import multer from "multer";

export const localsMiddleware = (req, res, next) => {
	res.locals.siteName = "Wetube";
	if (req.session.loggedIn) {
		res.locals.loggedIn = req.session.loggedIn;
		res.locals.loggedInUser = req.session.user;
	}
	next();
};

export const userOnlyMiddleware = (req, res, next) => {
	if (req.session.loggedIn) return next();
	else return res.redirect("/login");
};
export const publicOnlyMiddleware = (req, res, next) => {
	if (!req.session.loggedIn) return next();
	else return res.redirect("/");
};

export const avatarUploader = multer({ dest: "uploads/avatar/", limits: { fileSize: 3_000_000 } });
export const videoUploader = multer({ dest: "uploads/video/", limits: { fileSize: 10_000_000 } });

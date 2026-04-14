export const localsMiddleware = (req, res, next) => {
	res.locals.siteName = "Wetube";
	if (req.session.loggedIn) {
		res.locals.loggedIn = req.session.loggedIn;
		res.locals.user = req.session.user;
	}
	next();
};

import Video from "../models/Video";
const regexId = /^[0-9a-f]{24}$/;

export const home = async (req, res) => {
	try {
		const videos = await Video.find({});
		return res.render("home", { pageTitle: "Home", videos });
	} catch (err) {
		return res.status(500).render("404", { pageTitle: "Server Error", errorMsg: "Server Error" });
	}
};
export const search = (req, res) => res.send("Search Videos");
export const watch = (req, res) => {
	const videoId = req.params.id;
	if (!regexId.test(videoId)) {
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Video Not Found" });
	}
	return res.render("watch", { pageTitle: "Watch", videoId });
};
export const getUpload = (req, res) => res.render("upload", { pageTitle: "Upload New Video" });
export const postUpload = async (req, res) => {
	const { title, description, hashtags } = req.body;
	try {
		await Video.create({
			title,
			description,
			hashtags: hashtags.split(",").map((tag) => `#${tag.trim()}`),
		});
		return res.redirect("/");
	} catch (err) {
		console.error(err);
		return res.render("upload", { pageTitle: "Upload New Video", errorMsg: err._message });
	}
};
export const edit = (req, res) => res.send("Edit Video");
export const remove = (req, res) => res.send("Remove Video");

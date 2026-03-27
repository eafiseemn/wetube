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
export const watch = async (req, res) => {
	const { id } = req.params;
	if (!regexId.test(id)) {
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Wrong Address" });
	}
	try {
		const video = await Video.findById(id);
		if (!video) throw new Error("No video found match to this ID");
		return res.render("watch", { pageTitle: video.title, video });
	} catch (err) {
		console.error(err.message);
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Video Not Found" });
	}
};

export const getUpload = (req, res) => res.render("upload", { pageTitle: "Upload New Video" });
export const postUpload = async (req, res) => {
	const { title, description, hashtags } = req.body;
	try {
		await Video.create({
			title,
			description,
			hashtags: hashtags
				.split(",")
				.map((tag) => (tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`)),
		});
		return res.redirect("/");
	} catch (err) {
		console.error(err);
		return res.render("upload", { pageTitle: "Upload New Video", errorMsg: err._message });
	}
};

export const getEdit = async (req, res) => {
	const { id } = req.params;
	if (!regexId.test(id)) {
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Wrong Address" });
	}
	try {
		const video = await Video.findById(id);
		if (!video) {
			return res
				.status(404)
				.render("404", { pageTitle: "Page Not Found", errorMsg: "Cannot Find Video" });
		}
		return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
	} catch (err) {
		console.error("DB Error:", err.message);
		return res.redirect("/");
	}
};

export const postEdit = async (req, res) => {
	const { id } = req.params;
	const { title, description, hashtags } = req.body;

	if (!regexId.test(id)) {
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Wrong Address" });
	}
	try {
		const updatedVideo = await Video.findByIdAndUpdate(id, {
			title,
			description,
			hashtags: hashtags
				.split(",")
				.map((tag) => (tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`)),
		});
		if (!updatedVideo) {
			return res
				.status(404)
				.render("404", { pageTitle: "Page Not Found", errorMsg: "Cannot Find Video" });
		}
		return res.redirect(`/videos/${id}`);
	} catch (err) {
		console.error(err.message);
		return res.status(500).render("edit", {
			pageTitle: "Edit Video",
			video: { title, description, hashtags, _id: id },
			errorMsg: "Something Went Wrong... Please Try Again!",
		});
	}
};

export const remove = (req, res) => res.send("Remove Video");

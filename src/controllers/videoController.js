import User from "../models/User";
import Video from "../models/Video";
const regexId = /^[0-9a-f]{24}$/;

/************** Home **************/

export const home = async (req, res) => {
	try {
		const videos = await Video.find({}).populate("owner");
		return res.render("home", { pageTitle: "Home", videos });
	} catch (err) {
		return res.status(500).render("404", { pageTitle: "Server Error", errorMsg: "Server Error" });
	}
};

/************** Search **************/

export const search = async (req, res) => {
	const { keyword } = req.query;
	let videos = [];
	if (keyword) {
		try {
			videos = await Video.find({
				title: { $regex: new RegExp(keyword, "i") },
			}).populate("owner");
		} catch (err) {
			console.error(err._message);
			return res
				.status(500)
				.render("404", { pageTitle: "Server Error", errorMsg: "Something's Wrong!" });
		}
	}
	return res.render("videos/search", { pageTitle: "Search", keyword, videos });
};

/************** Watch Video **************/

export const watch = async (req, res) => {
	const { id } = req.params;
	if (!regexId.test(id)) {
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Wrong Address" });
	}
	try {
		const video = await Video.findById(id).populate("owner");
		if (!video) throw new Error("No video found match to this ID");
		return res.render("videos/watch", { pageTitle: video.title, video });
	} catch (err) {
		console.error(err.message);
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Video Not Found" });
	}
};

/************** Upload Video **************/

export const getUpload = (req, res) =>
	res.render("videos/upload", { pageTitle: "Upload New Video" });

export const postUpload = async (req, res) => {
	const {
		session: {
			user: { _id: userId },
		},
		body: { title, description, hashtags },
		file: { path: fileUrl },
	} = req;
	try {
		const newVideo = await Video.create({
			title,
			description,
			fileUrl,
			owner: userId,
			hashtags: Video.formatHashtags(hashtags),
		});
		const user = await User.findById(userId);
		user.videos.push(newVideo._id);
		user.save();
		return res.redirect("/");
	} catch (err) {
		console.error(err);
		return res.render("videos/upload", { pageTitle: "Upload New Video", errorMsg: err._message });
	}
};

/************** Edit Video **************/

export const getEdit = async (req, res) => {
	const {
		params: { id: videoId },
		session: {
			user: { _id: userId },
		},
	} = req;
	if (!regexId.test(videoId)) {
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Wrong Address" });
	}
	try {
		const video = await Video.findById(videoId);
		if (!video) {
			return res
				.status(404)
				.render("404", { pageTitle: "Page Not Found", errorMsg: "Cannot Find Video" });
		}
		if (String(video.owner) !== userId) {
			return res.status(403).redirect("/");
		}
		return res.render("videos/edit", { pageTitle: `Edit ${video.title}`, video });
	} catch (err) {
		console.error("DB Error:", err.message);
		return res.redirect("/");
	}
};

export const postEdit = async (req, res) => {
	const {
		params: { id: videoId },
		body: { title, description, hashtags },
		session: {
			user: { _id: userId },
		},
	} = req;

	if (!regexId.test(videoId)) {
		return res
			.status(404)
			.render("404", { pageTitle: "Page Not Found", errorMsg: "Wrong Address" });
	}
	try {
		const videoToUpdate = await Video.findById(videoId);
		if (!videoToUpdate) {
			return res
				.status(404)
				.render("404", { pageTitle: "Page Not Found", errorMsg: "Can't Find Video" });
		}
		if (String(videoToUpdate.owner) !== userId) {
			return res.status(403).redirect("/");
		}
		console.log(hashtags, videoToUpdate.hashtags);
		if (
			title === videoToUpdate.title &&
			description === videoToUpdate.description &&
			hashtags === videoToUpdate.hashtags.map((tag) => tag.slice(1)).join(", ")
		) {
			return res.status(400).render("videos/edit", {
				pageTitle: `Edit ${videoToUpdate.title}`,
				errorMsg: "No changes were made.",
				video: videoToUpdate,
			});
		}
		await Video.findByIdAndUpdate(videoId, {
			title,
			description,
			hashtags: Video.formatHashtags(hashtags),
		});
		return res.redirect(`/videos/${videoId}`);
	} catch (err) {
		console.error(err.message);
		return res.status(500).render("videos/edit", {
			pageTitle: "Edit Video",
			video: { title, description, hashtags, _id: videoId },
			errorMsg: "Something Went Wrong... Please Try Again!",
		});
	}
};

/************** Remove Video **************/

export const remove = async (req, res) => {
	const {
		params: { id: videoId },
		session: {
			user: { _id: userId },
		},
	} = req;
	try {
		const videoToDelete = await Video.findById(videoId).select("owner");
		if (!videoToDelete) {
			return res
				.status(404)
				.render("404", { pageTitle: "Page Not Found", errorMsg: "Can't Find Video" });
		}
		if (String(videoToDelete.owner) !== userId) {
			return res.status(403).redirect("/");
		}
		await Video.findByIdAndDelete(videoId);
		return res.redirect("/");
	} catch (err) {
		console.error(err._message);
		return res.redirect(`/videos/${videoId}`);
	}
};

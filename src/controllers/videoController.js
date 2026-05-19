import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";
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
			console.error("[ERROR/DB] Search Error: ", err._message || err.message);
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
		const video = await Video.findById(id)
			.populate("owner")
			.populate({
				path: "comments",
				populate: {
					path: "owner",
					model: "User",
					select: "username nickname avatarUrl",
				},
			});
		if (!video) throw new Error("No video found match to this ID");
		return res.render("videos/watch", { pageTitle: video.title, video });
	} catch (err) {
		console.error("[ERROR/DB] Watch Video Error: ", err._message || err.message);
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
		files: { video, thumbnail },
	} = req;

	try {
		const newVideo = await Video.create({
			title,
			description,
			fileUrl: video[0].path,
			thumbUrl: thumbnail[0].path,
			owner: userId,
			hashtags: Video.formatHashtags(hashtags),
		});
		const user = await User.findById(userId);
		user.videos.push(newVideo._id);
		user.save();
		req.flash("success", "Success to upload video.");
		return res.redirect("/");
	} catch (err) {
		console.error("[ERROR/DB] Video Upload Error: ", err._message || err.message);
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
				.render("404", { pageTitle: "Page Not Found", errorMsg: "Can't Find Video" });
		}
		if (String(video.owner) !== userId) {
			req.flash("error", "Not Authorized.");
			return res.status(403).redirect("/");
		}
		return res.render("videos/edit", { pageTitle: `Edit ${video.title}`, video });
	} catch (err) {
		console.error("[ERROR/DB] Find Video Error: ", err._message || err.message);
		req.flash("error", "Failed to find requested video.");
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
			req.flash("error", "Not Authorized.");
			return res.status(403).redirect("/");
		}
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
		req.flash("success", "Success to edit video.");
		return res.redirect(`/videos/${videoId}`);
	} catch (err) {
		console.error("[ERROR/DB] Edit Video Error: ", err._message || err.message);
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
			req.flash("error", "Not Authorized.");
			return res.status(403).redirect("/");
		}
		await Video.findByIdAndDelete(videoId);
		req.flash("success", "Success to delete video.");
		return res.redirect("/");
	} catch (err) {
		console.error("[ERROR/DB] Remove Video Error: ", err._message || err.message);
		req.flash("error", "Something went wrong... Please try again.");
		return res.redirect(`/videos/${videoId}`);
	}
};

/************** View Count **************/

export const registerView = async (req, res) => {
	const videoId = req.params.id;
	if (!regexId.test(videoId)) {
		console.error("[ERROR/DB] Search Video Error: regex test failed");
		return res.sendStatus(404);
	}
	const video = await Video.findById(videoId);
	if (!video) {
		console.error("[ERROR/DB] Find Video Error: ", err._message || err.message);
		return res.sendStatus(404);
	}

	video.meta.views += 1;
	await video.save();
	return res.sendStatus(200);
};

/************** Add Comment **************/

export const createComment = async (req, res) => {
	const {
		params: { id: videoId },
		body: { content },
		session: { user },
	} = req;

	if (!regexId.test(videoId)) {
		console.error("[ERROR/DB] Search Video Error: regex test failed");
		return res.status(404).json({ errorMsg: "Failed to find video." });
	}
	try {
		const video = await Video.findById(videoId);
		if (!video) {
			console.error("[ERROR/DB] Find Video Error: ", err._message || err.message);
			return res.status(404).json({ errorMsg: "Failed to find video." });
		}
		const comment = await Comment.create({
			content,
			owner: user._id,
			video: videoId,
		});
		video.comments.push(comment._id);
		await video.save();
		return res.status(201).json({ newComment: comment });
	} catch (err) {
		console.error("[ERROR/DB] Create Comment Error: ", err._message || err.message);
		return res.status(500).json({ errorMsg: "Failed to create a comment." });
	}
};

/************** Delete Comment **************/
export const deleteComment = async (req, res) => {
	const {
		params: { id: commentId },
		session: { user },
	} = req;
	try {
		const commentToDelete = await Comment.findById(commentId).select("owner");

		if (!commentToDelete) {
			return res.status(404).json({ errorMsg: "Failed to find comment." });
		}
		if (String(commentToDelete.owner) !== user._id) {
			return res.status(403).json({ errorMsg: "Not authorized." });
		}

		await Comment.findByIdAndDelete(commentId);
		await Video.findByIdAndUpdate(commentId.video, {
			$pull: { comments: commentId },
		});

		return res.sendStatus(200);
	} catch (err) {
		console.error("[ERROR/DB] Comment Delete Error: ", err);
		return res.status(404).json({ errorMsg: "Failed to find comment." });
	}
};

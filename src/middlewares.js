import multer from "multer";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import path from "path";

const S3_BUCKET_NAME = "wetube-media-assets-storage-2026";
const s3client = new S3Client({
	region: "ap-southeast-2",
	credentials: {
		accessKeyId: process.env.AWS_KEY,
		secretAccessKey: process.env.AWS_SECRET,
	},
});

const s3AvatarStorage = multerS3({
	s3: s3client,
	bucket: S3_BUCKET_NAME,
	acl: "public-read",
	key: function (req, file, cb) {
		const userId = req.session.user._id;
		const createdAt = Date.now().toString();
		const extension = path.extname(file.originalname);
		cb(null, `avatars/${userId}/${createdAt}${extension}`);
	},
});

const s3VideoStorage = multerS3({
	s3: s3client,
	bucket: S3_BUCKET_NAME,
	acl: "public-read",
	key: function (req, file, cb) {
		const userId = req.session.user._id;
		const fieldName = file.fieldname;
		if (!req.uploadTimestamp) {
			req.uploadTimestamp = Date.now().toString();
		}
		const extension = path.extname(file.originalname);
		cb(null, `videos/${userId}/${req.uploadTimestamp}/${fieldName}${extension}`);
	},
});

export const localsMiddleware = (req, res, next) => {
	res.locals.siteName = "Wetube";
	if (req.session.loggedIn) {
		res.locals.loggedIn = req.session.loggedIn;
		res.locals.loggedInUser = req.session.user;
	}
	res.locals.currentPath = req.path;
	next();
};

export const userOnlyMiddleware = (req, res, next) => {
	if (req.session.loggedIn) {
		return next();
	} else {
		req.flash("error", "Not authorized. Please Login");
		return res.redirect("/login");
	}
};
export const publicOnlyMiddleware = (req, res, next) => {
	if (!req.session.loggedIn) {
		return next();
	} else {
		req.flash("error", "Not authorized.");
		return res.redirect("/");
	}
};

export const avatarUploader = multer({ storage: s3AvatarStorage, limits: { fileSize: 3_000_000 } });
export const videoUploader = multer({ storage: s3VideoStorage, limits: { fileSize: 10_000_000 } });

export const deleteS3File = async (fileUrl) => {
	const fileKey = new URL(fileUrl).pathname.substring(1);
	try {
		const command = new DeleteObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: fileKey,
		});
		await s3client.send(command);
		console.log("[LOG] Success to delete S3 File: ", fileKey);
	} catch (err) {
		console.error("[ERROR/AWS] Fail to delete S3 File: ", fileKey, err);
	}
};

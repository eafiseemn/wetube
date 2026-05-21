import "../scss/styles.scss";
import { createConfirm } from "./util";

// Cancel Edit Video
const cancelEditBtn = document.querySelector(".cancelEditBtn");
const handleCancelEdit = async () => {
	const cancelOk = await createConfirm(
		"Are You Sure? All Changes will be discarded",
		"Cancel Edit",
		"Keep Edit",
	);
	if (!cancelOk) return;
	if (document.referrer) {
		history.back();
	} else {
		location.href = "/";
	}
};

if (cancelEditBtn) {
	cancelEditBtn.addEventListener("click", handleCancelEdit);
}

// Confirm to Delete Video
const deleteVideoAnchor = document.querySelector(".deleteVideo");
const handleDeleteVideo = async (e) => {
	e.preventDefault();
	const ok = await createConfirm("Are You Sure? This action cannot be undone.", "Delete");
	if (!ok) return;
	const targetUrl = e.target.href;
	location.href = targetUrl;
};

if (deleteVideoAnchor) {
	deleteVideoAnchor.addEventListener("click", handleDeleteVideo);
}

// File Input
const fileInput = document.querySelector(".upload-file-input");
const fileLabel = document.querySelector(".upload-file-name");
const avatarPreview = document.querySelector(".current-avatar");

const handleFileUpload = (e) => {
	const uploadFile = e.target.files[0];
	if (!uploadFile) return;
	fileLabel.value = uploadFile.name;

	if (uploadFile.type.startsWith("image/")) {
		const imageUrl = URL.createObjectURL(uploadFile);
		avatarPreview.src = imageUrl;
		avatarPreview.onload = () => URL.revokeObjectURL(imageUrl);
	}
};

if (fileInput && fileLabel) {
	fileInput.addEventListener("change", handleFileUpload);
}

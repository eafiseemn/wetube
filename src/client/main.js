// Cancel Edit Video
const cancelEditBtn = document.querySelector(".cancelEditBtn");
const handleCancelEdit = () => {
	const cancelOk = confirm("Are You Sure? All Changes will be discarded");
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
const handleDeleteVideo = (e) => {
	e.preventDefault();
	const ok = confirm("Are You Sure? This action cannot be undone.");
	if (!ok) return;
	const targetUrl = e.target.href;
	location.href = targetUrl;
};

if (deleteVideoAnchor) {
	deleteVideoAnchor.addEventListener("click", handleDeleteVideo);
}

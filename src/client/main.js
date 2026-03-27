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

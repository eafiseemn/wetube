import { createCommentForm, createConfirm, createFakeComment, createToast } from "./util";

const videoContainer = document.getElementById("video-container");
const loggedInUser = document.querySelector(".comment--user-avatar");
const commentForm = document.getElementById("commentForm");
const textarea = commentForm?.querySelector("textarea");
const cancelBtn = commentForm?.querySelector(".cancelBtn");
const submitBtn = commentForm?.querySelector(".submitBtn");
const commentList = document.querySelector(".comment--list");
const commentItems = commentList.querySelectorAll("li");
const commentCount = document.querySelector(".comment--count");

/************** Add Comment **************/

const handleInput = (e) => {
	const { value } = e.target;
	if (value.trim() !== "") {
		cancelBtn.disabled = false;
		submitBtn.disabled = false;
	} else {
		cancelBtn.disabled = true;
		submitBtn.disabled = true;
	}
};

const handleSubmit = async (e) => {
	e.preventDefault();
	submitBtn.disabled = true;
	submitBtn.innerText = "Saving..";

	const content = textarea.value;
	if (content.trim() === "") return;
	const videoId = videoContainer.dataset.id;

	try {
		const response = await fetch(`/api/videos/${videoId}/comment`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		});
		const json = await response.json();

		if (response.status === 201) {
			const { newComment } = json;
			newComment.owner = {
				avatarUrl: loggedInUser.dataset.avatar,
				nickname: loggedInUser.dataset.nickname,
			};
			createFakeComment(newComment, commentList);
			commentCount.innerText = Number(commentCount.innerText) + 1;
			createToast("success", "Success to add comment.");
			textarea.value = "";
			cancelBtn.disabled = true;
			submitBtn.disabled = true;
		} else {
			createToast("error", json.errorMsg || "Failed to create comment.");
			submitBtn.disabled = false;
			submitBtn.innerText = "Comment";
		}
	} catch (err) {
		console.error("[ERROR] Comment Fetch Error: ", err);
		createToast("error", "Something went wrong. Please try again later.");
		submitBtn.disabled = false;
		submitBtn.innerText = "Comment";
	}
};

const handleCancel = async () => {
	const cancelOk = await createConfirm(
		"Are You Sure? All Changes will be discarded",
		"Cancel Comment",
		"Keep Edit",
	);
	if (!cancelOk) return;
	textarea.value = "";
	cancelBtn.disabled = true;
	submitBtn.disabled = true;
};

/************** Edit Comment **************/

const handleEdit = async (e) => {
	const li = e.target.closest("li");
	const commentMain = li.querySelector(".comment--main");
	const commentButtons = li.querySelector(".comment--edit-buttons");
	const commentarea = li.querySelector(".comment--content");
	const oldContent = commentarea.innerText;

	commentMain.classList.add("hidden");
	commentButtons.classList.add("hidden");

	if (li.querySelector(".comment--add-new")) return;
	const { formDiv, form, textarea, cancelBtn, submitBtn } = createCommentForm(oldContent, li);

	const handleEditInput = (e) => {
		const { value } = e.target;
		if (value.trim() === "") {
			submitBtn.disabled = true;
			return;
		}
		if (value.trim() === oldContent) {
			submitBtn.disabled = true;
		} else {
			submitBtn.disabled = false;
		}
	};

	const handleEditCancel = async () => {
		const cancelOk = await createConfirm(
			"Are You Sure? All Changes will be discarded",
			"Cancel Edit",
			"Keep Edit",
		);
		if (!cancelOk) return;
		formDiv.remove();
		commentMain.classList.remove("hidden");
		commentButtons.classList.remove("hidden");
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		submitBtn.disabled = true;
		submitBtn.innerText = "Saving..";
		const newContent = textarea.value;
		if (newContent.trim() === "") return;
		if (newContent.trim() === oldContent) return;
		const commentId = li.dataset.id;

		try {
			const response = await fetch(`/api/videos/comment/${commentId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ newContent }),
			});
			const json = await response.json();

			if (response.status === 200) {
				commentMain.classList.remove("hidden");
				commentButtons.classList.remove("hidden");
				commentarea.innerText = newContent;
				formDiv.remove();
				createToast("success", "Success to add comment.");
			} else {
				createToast("error", json.errorMsg || "Failed to create comment.");
				submitBtn.disabled = false;
				submitBtn.innerText = "Edit";
			}
		} catch (err) {
			console.error("[ERROR] Comment Fetch Error: ", err);
			createToast("error", "Something went wrong. Please try again later.");
			submitBtn.disabled = false;
			submitBtn.innerText = "Edit";
		}
	};

	textarea.addEventListener("input", handleEditInput);
	textarea.addEventListener("keydown", async (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			await handleEditCancel();
		}
	});
	cancelBtn.addEventListener("click", handleEditCancel);
	form.addEventListener("submit", handleEditSubmit);
};

/************** Delete Comment **************/

const handleDelete = async (e) => {
	const ok = await createConfirm("Are You Sure? This action cannot be undone.", "Delete");
	if (!ok) return;

	const commentLi = e.target.closest("li");
	const commentId = commentLi.dataset.id;

	try {
		const response = await fetch(`/api/videos/comment/${commentId}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const { errorMsg } = await response.json();
			throw new Error(errorMsg || "Failed to Delete Comment.");
		}

		commentLi.remove();
		commentCount.innerText = Number(commentCount.innerText) - 1;
		createToast("success", "Success to delete comment.");
	} catch (err) {
		console.error("[ERROR] Delete Comment Error: ", err);
		createToast("error", err.message || "Something went wrong. Please try again later.");
	}
};

/************** Collapse/Expand Comments **************/

commentItems.forEach((li) => {
	const content = li.querySelector(".comment--content");
	const expandBtn = li.querySelector(".comment--expand");

	if (content.scrollHeight > content.clientHeight) {
		expandBtn.classList.remove("hidden");
	}

	expandBtn.addEventListener("click", () => {
		content.classList.toggle("collapsed");
		if (content.classList.contains("collapsed")) {
			expandBtn.innerText = "Read More";
		} else {
			expandBtn.innerText = "Collapse";
		}
	});
});

/************** Event Listeners **************/

textarea?.addEventListener("input", handleInput);
textarea?.addEventListener("keydown", async (e) => {
	if (e.key === "Escape") {
		e.preventDefault();
		await handleCancel();
	}
});
commentForm?.addEventListener("submit", handleSubmit);
cancelBtn?.addEventListener("click", handleCancel);
commentList.addEventListener("click", async (e) => {
	const clickBtn = e.target.closest("button");
	if (!clickBtn) return;
	if (clickBtn.classList.contains("deleteBtn")) {
		await handleDelete(e);
	}
	if (clickBtn.classList.contains("editBtn")) {
		await handleEdit(e);
	}
});

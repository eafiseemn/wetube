import { createConfirm, createFakeComment, createToast } from "./util";

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
	const content = textarea.value;
	if (content.trim() === "") return;
	const videoId = videoContainer.dataset.id;

	try {
		const response = await fetch(`/api/videos/${videoId}/comment`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		});
		const { newComment } = await response.json();

		if (response.status === 201) {
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
		}
	} catch (err) {
		console.error("[ERROR] Comment Fetch Error: ", err);
		createToast("error", "Something went wrong. Please try again later.");
	}
};

const handleCancel = async () => {
	const cancelOk = await createConfirm(
		"Are You Sure? All Changes will be discarded",
		"Cancel Edit",
		"Keep Edit",
	);
	if (!cancelOk) return;
	textarea.value = "";
	cancelBtn.disabled = true;
	submitBtn.disabled = true;
};

/************** Delete Comment **************/

const handleDelete = async (e) => {
	if (!e.target.closest("button")?.classList.contains("deleteBtn")) return;

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
commentForm?.addEventListener("submit", handleSubmit);
cancelBtn?.addEventListener("click", handleCancel);
commentList.addEventListener("click", handleDelete);

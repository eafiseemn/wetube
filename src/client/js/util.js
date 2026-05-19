export const createToast = (type, message) => {
	const toast = document.createElement("div");
	toast.role = "alert";
	toast.classList.add("toast", type);

	const messageDiv = document.createElement("div");
	messageDiv.className = "toast-message";
	const img = document.createElement("img");
	img.src = `/assets/${type}.svg`;
	const messageContent = document.createElement("strong");
	messageContent.id = "message";
	messageContent.innerText = message;
	messageDiv.appendChild(img);
	messageDiv.appendChild(messageContent);

	const toastProgress = document.createElement("div");
	toastProgress.className = "toast-progress";
	const toastBackground = document.createElement("div");
	toastProgress.className = "toast-progress-background";

	toast.appendChild(messageDiv);
	toast.appendChild(toastProgress);
	toast.appendChild(toastBackground);

	document.body.appendChild(toast);

	setTimeout(() => {
		document.body.removeChild(toast);
	}, 60000);
};

export const createFakeComment = (comment, parent) => {
	const li = document.createElement("li");
	li.dataset.id = comment._id;

	const img = document.createElement("img");
	img.className = "comment--user-avatar";
	img.src = comment.owner.avatarUrl.startsWith("http")
		? comment.owner.avatarUrl
		: `/${comment.owner.avatarUrl}`;
	img.alt = `${comment.owner.nickname}'s Avatar`;

	const main = document.createElement("div");
	main.className = "comment--main";

	const metaInfo = document.createElement("div");
	metaInfo.className = "comment--meta-info";

	const userNickname = document.createElement("span");
	userNickname.className = "comment--user-nickname";
	userNickname.innerText = comment.owner.nickname;

	const dateSpan = document.createElement("span");
	dateSpan.className = "comment--date";
	dateSpan.innerText = comment.formattedDate;

	const content = document.createElement("p");
	content.className = "comment--content";
	content.innerText = comment.content;

	const deleteBtn = document.createElement("button");
	deleteBtn.type = "button";
	deleteBtn.className = "deleteBtn";

	const deleteIcon = document.createElement("img");
	deleteIcon.src = "/assets/delete.svg";
	deleteIcon.alt = "Delete";

	metaInfo.appendChild(userNickname);
	metaInfo.appendChild(dateSpan);
	deleteBtn.appendChild(deleteIcon);
	main.appendChild(metaInfo);
	main.appendChild(content);
	li.appendChild(img);
	li.appendChild(main);
	li.appendChild(deleteBtn);

	parent.prepend(li);
};

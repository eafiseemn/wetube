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
	toastBackground.className = "toast-progress-background";

	toast.appendChild(messageDiv);
	toast.appendChild(toastProgress);
	toast.appendChild(toastBackground);

	document.body.appendChild(toast);

	let timeoutId;
	const startTimer = () => {
		timeoutId = setTimeout(() => {
			toast.remove();
		}, 6000);
	};
	const pauseTimer = () => clearTimeout(timeoutId);
	toast.addEventListener("mouseover", pauseTimer);
	toast.addEventListener("mouseleave", startTimer);
};

export const createConfirm = (message, okText, closeText = "Cancel") => {
	return new Promise((resolve) => {
		const dialog = document.createElement("dialog");
		dialog.className = "confirm-modal";

		const span = document.createElement("span");
		span.innerText = message;
		span.className = "confirm-message";

		const buttonGroups = document.createElement("div");
		buttonGroups.className = "confirm-modal-buttons";
		const closeBtn = document.createElement("button");
		closeBtn.className = "closeBtn";
		closeBtn.innerText = closeText;
		const confirmBtn = document.createElement("button");
		confirmBtn.className = "confirmBtn";
		confirmBtn.innerText = okText;
		buttonGroups.appendChild(closeBtn);
		buttonGroups.appendChild(confirmBtn);

		dialog.appendChild(span);
		dialog.appendChild(buttonGroups);

		document.body.appendChild(dialog);
		dialog.showModal();

		closeBtn.addEventListener("click", () => {
			dialog.close();
			resolve(false);
		});
		confirmBtn.addEventListener("click", () => {
			dialog.close();
			resolve(true);
		});

		dialog.addEventListener("close", () => dialog.remove());
	});
};

export const createFakeComment = (comment, parent) => {
	const li = document.createElement("li");
	li.dataset.id = comment._id;

	const img = document.createElement("img");
	img.className = "comment--user-avatar";
	img.src = comment.owner.avatarUrl;
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

	const buttonGroups = document.createElement("div");
	buttonGroups.className = "comment--edit-buttons";

	const editBtn = document.createElement("button");
	editBtn.type = "button";
	editBtn.className = "editBtn";

	const editIcon = document.createElement("img");
	editIcon.src = "/assets/edit.svg";
	editIcon.alt = "Edit";

	const deleteBtn = document.createElement("button");
	deleteBtn.type = "button";
	deleteBtn.className = "deleteBtn";

	const deleteIcon = document.createElement("img");
	deleteIcon.src = "/assets/delete.svg";
	deleteIcon.alt = "Delete";

	metaInfo.appendChild(userNickname);
	metaInfo.appendChild(dateSpan);
	editBtn.appendChild(editIcon);
	deleteBtn.appendChild(deleteIcon);
	buttonGroups.appendChild(editBtn);
	buttonGroups.appendChild(deleteBtn);
	main.appendChild(metaInfo);
	main.appendChild(content);
	li.appendChild(img);
	li.appendChild(main);
	li.appendChild(buttonGroups);

	parent.prepend(li);
};

export const createCommentForm = (oldContent, parent) => {
	const formDiv = document.createElement("div");
	formDiv.className = "comment--add-new";
	const form = document.createElement("form");
	form.className = "comment--add-form";
	const textarea = document.createElement("textarea");
	textarea.id = "comment";
	textarea.name = "comment";
	textarea.value = oldContent;

	const buttonGroups = document.createElement("div");
	buttonGroups.className = "comment--add-buttons";
	const cancelBtn = document.createElement("button");
	cancelBtn.className = "cancelBtn";
	cancelBtn.innerText = "Cancel";
	cancelBtn.disabled = false;
	cancelBtn.type = "button";
	const submitBtn = document.createElement("button");
	submitBtn.className = "submitBtn";
	submitBtn.innerText = "Edit";
	submitBtn.disabled = true;
	submitBtn.type = "submit";

	parent.appendChild(formDiv);
	formDiv.appendChild(form);
	form.appendChild(textarea);
	form.appendChild(buttonGroups);
	buttonGroups.appendChild(cancelBtn);
	buttonGroups.appendChild(submitBtn);

	return { formDiv, form, textarea, cancelBtn, submitBtn };
};

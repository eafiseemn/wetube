const showPreviewBtn = document.getElementById("show-preview");
const videoPreview = document.getElementById("video-preview");
const video = document.getElementById("preview");
const recordBtn = document.getElementById("recordBtn");
const recordIcon = recordBtn.querySelector(".record-inner");
const stopBtn = document.getElementById("stopBtn");
const pauseBtn = document.getElementById("pauseBtn");
const pauseIcon = pauseBtn.querySelector(".pauseIcon");
const resumeIcon = pauseBtn.querySelector(".resumeIcon");
const downloadBtn = document.getElementById("downloadBtn");
const downloadIcon = downloadBtn.querySelector("img");
const spinner = downloadBtn.querySelector(".spinner");
const restartBtn = document.getElementById("restartBtn");

let stream;
let recorder;
let videoUrl;

const showBtn = (button) => button.classList.remove("hidden");
const hideBtn = (button) => button.classList.add("hidden");

const initPreview = async () => {
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
			video: true,
		});
		hideBtn(showPreviewBtn);
		showBtn(videoPreview);
		video.src = null;
		video.srcObject = stream;
		video.play();
	} catch (err) {
		console.error("[ERROR] Media devices access error: ", err.name);
		switch (err.name) {
			case "NotAllowedError":
				alert("Please allow access to your camera and microphone to start recording.");
				break;
			case "NotFoundError":
				alert("Could not find a camera or microphone on this device.");
				break;
			case "NotReadableError":
				alert(
					"Your camera or microphone is already in use by another application. Please close other apps and try again.",
				);
				break;
			default:
				alert("Something went wrong while accessing your media devices. Please try again.");
		}
	}
};

const startRecord = (stream) => {
	const types = [
		"video/mp4;codecs=avc1",
		"video/webm;codecs=vp9",
		"video/webm;codecs=vp8",
		"video/webm",
	];
	let selectedType = "";
	for (const type of types) {
		if (MediaRecorder.isTypeSupported(type)) {
			selectedType = type;
			break;
		}
	}
	if (selectedType) {
		recorder = new MediaRecorder(stream, { mimeType: selectedType });
	} else {
		console.error("[ERROR] Media recorder codec type issue");
		alert("No supported video codec found");
		return;
	}

	recorder.ondataavailable = (e) => {
		videoUrl = URL.createObjectURL(e.data);
		video.srcObject = null;
		video.src = videoUrl;
		video.loop = true;
		video.play();
	};
	recorder.start();
};

const endRecord = () => {
	if (recorder && recorder.state !== "inactive") {
		recorder.stop();
	}
};

const pauseRecord = () => {
	if (recorder && recorder.state !== "inactive") {
		recorder.pause();
	}
};

const resumeRecord = () => {
	if (recorder && recorder.state === "paused") {
		recorder.resume();
	}
};

const handleStart = () => {
	hideBtn(recordBtn);
	showBtn(stopBtn);
	showBtn(pauseBtn);
	recordBtn.removeEventListener("click", handleStart);
	stopBtn.addEventListener("click", handleStop);
	pauseBtn.addEventListener("click", handlePause);
	startRecord(stream);
};

const handleStop = () => {
	hideBtn(stopBtn);
	hideBtn(pauseBtn);
	showBtn(downloadBtn);
	showBtn(restartBtn);
	stopBtn.removeEventListener("click", handleStop);
	pauseBtn.removeEventListener("click", handlePause);
	downloadBtn.addEventListener("click", handleDownload);
	restartBtn.addEventListener("click", handleRestart);
	endRecord();
};

const handlePause = () => {
	hideBtn(pauseIcon);
	showBtn(resumeIcon);
	pauseBtn.removeEventListener("click", handlePause);
	pauseBtn.addEventListener("click", handleResume);
	pauseRecord();
};

const handleResume = () => {
	hideBtn(resumeIcon);
	showBtn(pauseIcon);
	pauseBtn.removeEventListener("click", handleResume);
	pauseBtn.addEventListener("click", handlePause);
	resumeRecord();
};

const downloadFile = (fileUrl, fileName) => {
	const downloadLink = document.createElement("a");
	downloadLink.href = fileUrl;
	const d = new Date();
	const today =
		d.getFullYear().toString().slice(-2) +
		(d.getMonth() + 1).toString().padStart(2, "0") +
		d.getDate().toString().padStart(2, "0");
	downloadLink.download = `${fileName}_${today}.mp4`;
	document.body.appendChild(downloadLink);
	downloadLink.click();
};

const handleDownload = () => {
	// start spinner
	downloadBtn.removeEventListener("click", handleDownload);
	hideBtn(downloadIcon);
	showBtn(spinner);
	downloadBtn.disabled = true;

	// download video & thumbnail
	downloadFile(videoUrl, "wetube_recording");

	// reset button
	showBtn(downloadIcon);
	hideBtn(spinner);
	downloadBtn.addEventListener("click", handleDownload);
	downloadBtn.disabled = false;
};

const handleRestart = () => {
	hideBtn(downloadBtn);
	hideBtn(restartBtn);
	showBtn(recordBtn);
	stream = null;
	recorder = null;
	videoUrl = null;
	initPreview();
	downloadBtn.removeEventListener("click", handleDownload);
	restartBtn.removeEventListener("click", handleRestart);
	recordBtn.addEventListener("click", handleStart);
};

showPreviewBtn.addEventListener("click", initPreview);
recordBtn.addEventListener("click", handleStart);

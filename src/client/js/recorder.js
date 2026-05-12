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
const restartBtn = document.getElementById("restartBtn");

let stream;
let recorder;
let videoUrl;

const initPreview = async () => {
	stream = await navigator.mediaDevices.getUserMedia({
		audio: true,
		video: true,
	});
	showPreviewBtn.classList.add("hidden");
	videoPreview.classList.remove("hidden");
	video.srcObject = stream;
	video.play();
};

const startRecord = (stream) => {
	recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
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
	recordBtn.classList.add("hidden");
	stopBtn.classList.remove("hidden");
	pauseBtn.classList.remove("hidden");
	recordBtn.removeEventListener("click", handleStart);
	stopBtn.addEventListener("click", handleStop);
	pauseBtn.addEventListener("click", handlePause);
	startRecord(stream);
};

const handleStop = () => {
	stopBtn.classList.add("hidden");
	pauseBtn.classList.add("hidden");
	downloadBtn.classList.remove("hidden");
	restartBtn.classList.remove("hidden");
	stopBtn.removeEventListener("click", handleStop);
	pauseBtn.removeEventListener("click", handlePause);
	downloadBtn.addEventListener("click", handleDownload);
	restartBtn.addEventListener("click", handleRestart);
	endRecord();
};

const handlePause = () => {
	pauseIcon.classList.add("hidden");
	resumeIcon.classList.remove("hidden");
	pauseBtn.removeEventListener("click", handlePause);
	pauseBtn.addEventListener("click", handleResume);
	pauseRecord();
};

const handleResume = () => {
	pauseIcon.classList.remove("hidden");
	resumeIcon.classList.add("hidden");
	pauseBtn.removeEventListener("click", handleResume);
	pauseBtn.addEventListener("click", handlePause);
	resumeRecord();
};

const handleDownload = () => {
	const downloadLink = document.createElement("a");
	downloadLink.href = videoUrl;
	const d = new Date();
	const today =
		d.getFullYear().toString().slice(-2) +
		(d.getMonth() + 1).toString().padStart(2, "0") +
		d.getDate().toString().padStart(2, "0");
	downloadLink.download = `wetube_recording_${today}.mp4`;
	document.body.appendChild(downloadLink);
	downloadLink.click();
};

const handleRestart = () => {
	downloadBtn.classList.add("hidden");
	restartBtn.classList.add("hidden");
	recordBtn.classList.remove("hidden");
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

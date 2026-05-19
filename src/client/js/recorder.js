import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { createToast } from "./util";

const showPreviewBtn = document.getElementById("show-preview");
const videoPreview = document.getElementById("video-preview");
const video = document.getElementById("preview");
const recordBtn = document.getElementById("recordBtn");
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
let videoBlob;
let videoUrl;
let chunks;

const types = [
	"video/mp4;codecs=avc1",
	"video/mp4",
	"video/webm;codecs=vp9",
	"video/webm;codecs=vp8",
	"video/webm",
];
let selectedType = "";

const ffmpeg = new FFmpeg();
const files = {
	input: "recording.webm",
	output: "output.mp4",
	transcoded: "transcoded.mp4",
	thumbnail: "thumbnail.jpg",
};

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
				createToast(
					"error",
					"Please allow access to your camera and microphone to start recording.",
				);
				break;
			case "NotFoundError":
				createToast("error", "Could not find a camera or microphone on this device.");
				break;
			case "NotReadableError":
				createToast(
					"error",
					"Your camera or microphone is already in use by another application. Please close other apps and try again.",
				);
				break;
			default:
				createToast(
					"error",
					"Something went wrong while accessing your media devices. Please try again.",
				);
		}
	}
};

const startRecord = (stream) => {
	chunks = [];
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
		createToast("error", "No supported video codec found");
		return;
	}

	recorder.ondataavailable = (e) => {
		if (e.data.size > 0) chunks.push(e.data);
	};

	recorder.onstop = () => {
		videoBlob = new Blob(chunks, {
			type: selectedType,
		});
		videoUrl = URL.createObjectURL(videoBlob);
		video.srcObject = null;
		video.src = videoUrl;
		video.loop = true;
		video.play();

		downloadBtn.disabled = false;
	};
	recorder.start();
};

const endRecord = () => {
	if (recorder?.state !== "inactive") {
		recorder.stop();
	}
};

const pauseRecord = () => {
	if (recorder?.state === "recording") {
		recorder.pause();
	}
};

const resumeRecord = () => {
	if (recorder?.state === "paused") {
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
	downloadBtn.disabled = true;
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

const downloadFile = (fileUrl, fileType) => {
	const downloadLink = document.createElement("a");
	downloadLink.href = fileUrl;
	const d = new Date();
	const today =
		d.getFullYear().toString().slice(-2) +
		(d.getMonth() + 1).toString().padStart(2, "0") +
		d.getDate().toString().padStart(2, "0");
	switch (fileType) {
		case "mp4":
			downloadLink.download = `wetube_recording_${today}.mp4`;
			break;
		case "jpg":
			downloadLink.download = `wetube_thumbnail_${today}.jpg`;
			break;
		default:
			console.error("[ERROR] Download File Type Error");
			break;
	}
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
};

const ffmpegLoad = async () => {
	const baseUrl = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
	ffmpeg.on("log", ({ message }) => {
		console.log(message);
	});
	await ffmpeg.load({
		coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
		wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm"),
	});
};

const transcodeVideo = async (webmBlob) => {
	if (!ffmpeg.loaded) await ffmpegLoad();
	await ffmpeg.writeFile(files.input, await fetchFile(webmBlob));
	await ffmpeg.exec(["-i", files.input, files.output]);
	const mp4Data = await ffmpeg.readFile(files.output);
	const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });
	const mp4Url = URL.createObjectURL(mp4Blob);
	return {
		blob: mp4Blob,
		url: mp4Url,
	};
};

const extractThumbnail = async (mp4Blob) => {
	if (!ffmpeg.loaded) await ffmpegLoad();
	await ffmpeg.writeFile(files.transcoded, await fetchFile(mp4Blob));
	await ffmpeg.exec([
		"-i",
		files.transcoded,
		"-ss",
		"00:00:01",
		"-frames:v",
		"1",
		"-update",
		"1",
		files.thumbnail,
	]);
	const thumbData = await ffmpeg.readFile(files.thumbnail);
	const thumbBlob = new Blob([thumbData.buffer], { type: "image/jpg" });
	const thumbUrl = URL.createObjectURL(thumbBlob);
	return thumbUrl;
};

const handleDownload = async () => {
	// start spinner
	downloadBtn.removeEventListener("click", handleDownload);
	hideBtn(downloadIcon);
	showBtn(spinner);
	downloadBtn.disabled = true;

	// download video & thumbnail
	let finalVideoBlob = videoBlob;
	let finalVideoUrl = videoUrl;
	let thumbUrl;
	try {
		await ffmpegLoad();

		if (!selectedType.includes("mp4")) {
			const transcoded = await transcodeVideo(videoBlob);
			finalVideoBlob = transcoded.blob;
			finalVideoUrl = transcoded.url;
			await ffmpeg.deleteFile(files.input);
			await ffmpeg.deleteFile(files.output);
		}
		thumbUrl = await extractThumbnail(finalVideoBlob);

		downloadFile(finalVideoUrl, "mp4");
		downloadFile(thumbUrl, "jpg");
	} catch (err) {
		console.error("[ERROR] FFMPEG Video Processing Failed: ", err);
		createToast("error", "Video processing failed. Please try again.");
	} finally {
		// ffmpeg & object url cleanup
		try {
			await ffmpeg.deleteFile(files.transcoded);
			await ffmpeg.deleteFile(files.thumbnail);
		} catch (cleanupErr) {
			console.error("[ERROR] FFMPEG File Delete Error: ", cleanupErr);
		}
		if (finalVideoUrl !== videoUrl) {
			URL.revokeObjectURL(finalVideoUrl);
		}
		if (thumbUrl) URL.revokeObjectURL(thumbUrl);

		// UI restore
		showBtn(downloadIcon);
		hideBtn(spinner);
		downloadBtn.addEventListener("click", handleDownload);
		downloadBtn.disabled = false;
	}
};

const handleRestart = () => {
	hideBtn(downloadBtn);
	hideBtn(restartBtn);
	showBtn(recordBtn);
	stream?.getTracks().forEach((track) => track.stop());
	recorder = null;
	if (videoUrl) {
		URL.revokeObjectURL(videoUrl);
	}
	videoUrl = null;
	initPreview();
	downloadBtn.removeEventListener("click", handleDownload);
	restartBtn.removeEventListener("click", handleRestart);
	recordBtn.addEventListener("click", handleStart);
};

showPreviewBtn.addEventListener("click", initPreview);
recordBtn.addEventListener("click", handleStart);
window.addEventListener("beforeunload", () => {
	stream?.getTracks().forEach((track) => track.stop());
});

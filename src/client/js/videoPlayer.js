/************** DOM Elements **************/
const video = document.querySelector("video");
const videoContainer = document.getElementById("video-container");
const videoController = document.getElementById("video-controller");
const playBtn = document.getElementById("play");
const playIcon = playBtn.querySelector("img");
const muteBtn = document.getElementById("mute");
const muteIcon = muteBtn.querySelector("img");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("img");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const volumeRange = document.getElementById("volume");

/************** Video Controller **************/
let controlsTimeout;

const handleMouseMove = () => {
	if (controlsTimeout) {
		clearTimeout(controlsTimeout);
		controlsTimeout = null;
	}
	videoController.classList.remove("hide");
	controlsTimeout = setTimeout(() => {
		videoController.classList.add("hide");
	}, 3000);
};

/************** Play/Pause **************/
const initialPlayBtnSetting = () => {
	if (video.paused) {
		playIcon.src = "/assets/play.svg";
		playIcon.alt = "Play";
		playBtn.classList.add("paused");
	} else {
		playIcon.src = "/assets/pause.svg";
		playIcon.alt = "Pause";
		playBtn.classList.remove("paused");
	}
};

initialPlayBtnSetting();

let clickTimer;

const handlePlayClick = () => {
	if (clickTimer) {
		clearTimeout(clickTimer);
		clickTimer = null;
		handleFullScreenClick();
	} else {
		clickTimer = setTimeout(() => {
			if (video.paused) {
				playIcon.src = "/assets/pause.svg";
				playIcon.alt = "Pause";
				video.play();
				playBtn.classList.remove("paused");
			} else {
				playIcon.src = "/assets/play.svg";
				playIcon.alt = "Play";
				video.pause();
				playBtn.classList.add("paused");
			}
			clickTimer = null;
		}, 200);
	}
};

/************** Volume Control **************/
const VOLUME_KEY = "wetube_preferred_volume";
let volumeSetting = localStorage.getItem(VOLUME_KEY) || 0.5;

const updateVolumeColor = (value) => {
	const volume = value * 100;
	volumeRange.style.background = `linear-gradient(to top, #CC0000 0%, #CC0000 ${volume}%, rgba(255, 255, 255, 0.3) ${volume}%, rgba(255, 255, 255, 0.3) 100%)`;
	volumeRange.style.backgroundSize = "4px 80%";
	volumeRange.style.backgroundRepeat = "no-repeat";
	volumeRange.style.backgroundPosition = "center";
};

const initialVolumeSetting = () => {
	video.volume = volumeSetting;
	volumeRange.value = volumeSetting;
	updateVolumeColor(volumeSetting);
	if (volumeSetting === "0") {
		muteIcon.src = "/assets/mute.svg";
		muteIcon.alt = "Unmute";
	}
};

initialVolumeSetting();

const handleMuteClick = (e) => {
	if (e.target === volumeRange) return;
	if (video.muted) {
		muteIcon.src = "/assets/volume.svg";
		muteIcon.alt = "Mute";
		video.muted = false;
		volumeRange.value = volumeSetting;
		updateVolumeColor(volumeSetting);
	} else {
		muteIcon.src = "/assets/mute.svg";
		muteIcon.alt = "Unmute";
		video.muted = true;
		volumeRange.value = 0;
		updateVolumeColor(0);
	}
};

const handleVolumeChange = (e) => {
	const { value } = e.target;
	localStorage.setItem(VOLUME_KEY, value);
	video.volume = value;
	updateVolumeColor(value);
	if (value === "0") {
		muteIcon.src = "/assets/mute.svg";
		muteIcon.alt = "Unmute";
		video.muted = true;
	} else {
		muteIcon.src = "/assets/volume.svg";
		muteIcon.alt = "Mute";
		video.muted = false;
	}
};

/************** Full Screen **************/
const handleFullScreenClick = () => {
	if (document.fullscreenElement) {
		fullScreenIcon.src = "/assets/expand.svg";
		fullScreenIcon.alt = "Enter Fullscreen";
		document.exitFullscreen();
	} else {
		fullScreenIcon.src = "/assets/collapse.svg";
		fullScreenIcon.alt = "Exit Fullscreen";
		videoContainer.requestFullscreen();
	}
};

const handleFullScreenEscape = () => {
	if (document.fullscreenElement) return;
	fullScreenIcon.src = "/assets/expand.svg";
	fullScreenIcon.alt = "Enter Fullscreen";
};

const handleFullScreenPlay = (e) => {
	if (!document.fullscreenElement) return;
	if (e.key === " ") {
		e.preventDefault();
		handlePlayClick();
	}
};

/************** Time tracker **************/
const formatTime = (seconds) => {
	if (seconds > 3600) {
		return new Date(seconds * 1000).toISOString().substring(11, 19);
	} else {
		return new Date(seconds * 1000).toISOString().substring(14, 19);
	}
};

const handleLoadedMetadata = () => {
	const videoDuration = Math.floor(video.duration);
	totalTime.innerText = formatTime(videoDuration);
	timeline.max = videoDuration;
};

const updateTimelineColor = (value) => {
	const max = timeline.max || 100;
	const progress = (value / max) * 100;

	timeline.style.background = `linear-gradient(to right, #CC0000 0%, #CC0000 ${progress}%, rgba(255, 255, 255, 0.3) ${progress}%, rgba(255, 255, 255, 0.3) 100%)`;
	timeline.style.backgroundSize = "100% 4px";
	timeline.style.backgroundRepeat = "no-repeat";
	timeline.style.backgroundPosition = "center";
};

updateTimelineColor(0);

const handleTimeUpdate = () => {
	const videoTime = Math.floor(video.currentTime);
	currentTime.innerText = formatTime(videoTime);
	timeline.value = videoTime;
	updateTimelineColor(videoTime);
};

const handleTimelineChange = (e) => {
	const { value } = e.target;
	video.currentTime = value;
	updateTimelineColor(value);
};

/************** View Count **************/
const handleEnded = () => {
	const videoId = videoContainer.dataset.id;
	fetch(`/api/videos/${videoId}/view`, { method: "POST" });
};

/************** EventListeners **************/
videoContainer.addEventListener("mousemove", handleMouseMove);
playBtn.addEventListener("click", handlePlayClick);
video.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
fullScreenBtn.addEventListener("click", handleFullScreenClick);
document.addEventListener("fullscreenchange", handleFullScreenEscape);
document.addEventListener("keydown", handleFullScreenPlay);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
video.addEventListener("ended", handleEnded);

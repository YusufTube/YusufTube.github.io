// videoScript.js (Firebase version)
import { db } from "./FireBase.js";
import { collection, doc, getDoc, setDoc, updateDoc, increment, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Elements
const player = document.getElementById("videoPlayer");
const glow = document.getElementById("glowPlayer");
const videoList = document.getElementById("videoList");
const title = document.getElementById("mainTitle");
const viewDisplay = document.getElementById("viewCountDisplay");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeCount = document.getElementById("likeCount");
const dislikeCount = document.getElementById("dislikeCount");
const saveBtn = document.getElementById("saveBtn");
const searchInput = document.querySelector(".search-bar input");
const voiceBtn = document.getElementById("voiceBtn");
const canvas = document.getElementById("colorSampler");
const ctx = canvas.getContext("2d");

let activeKey = "";
let currentAction = null;

// ===== FIREBASE HELPERS =====
async function getVideoStats(videoId) {
    const docRef = doc(db, "videos", videoId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    await setDoc(docRef, { views:0, likes:0, dislikes:0 });
    return { views:0, likes:0, dislikes:0 };
}

async function updateLikeDislike(videoId, action, previousAction) {
    const docRef = doc(db, "videos", videoId);
    const updates = {};
    if (action === "like") updates.likes = increment(1);
    if (action === "dislike") updates.dislikes = increment(1);
    if (previousAction === "like" && action !== "like") updates.likes = increment(-1);
    if (previousAction === "dislike" && action !== "dislike") updates.dislikes = increment(-1);
    await updateDoc(docRef, updates);
}

async function incrementViews(videoId) {
    const docRef = doc(db, "videos", videoId);
    await updateDoc(docRef, { views: increment(1) });
}

// ===== LOAD VIDEO LIST =====
async function loadVideoList() {
    const querySnapshot = await getDocs(collection(db, "videos"));
    querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        addVideo(data.path, docSnap.id);
    });
}
loadVideoList();

// ===== ADD VIDEO CARD =====
function addVideo(path, key) {
    const file = path.split("/").pop();
    const name = file.replace(".mp4","").replace(/_/g," ");
    key = key || "ys_" + file;

    const card = document.createElement("div");
    card.className = "preview-card";
    card.dataset.path = path;

    const thumb = document.createElement("div");
    thumb.className = "preview-thumbnail";

    const vid = document.createElement("video");
    vid.src = path;
    vid.muted = true;
    vid.loop = true;

    card.onmouseenter = () => vid.play();
    card.onmouseleave = () => { vid.pause(); vid.currentTime = 0; };

    const info = document.createElement("div");
    const t = document.createElement("div");
    t.className = "preview-title";
    t.innerText = name;

    const views = document.createElement("div");
    views.className = "preview-views";
    views.innerText = "0 views";

    card.onclick = () => loadVideo(path, key, views);

    thumb.appendChild(vid);
    info.appendChild(t);
    info.appendChild(views);
    card.appendChild(thumb);
    card.appendChild(info);
    videoList.appendChild(card);
}

// ===== LOAD VIDEO =====
async function loadVideo(path, key, sidebarViewEl) {
    player.src = path;
    glow.src = path;
    title.innerText = path.split("/").pop().replace(".mp4","");
    activeKey = key;

    const stats = await getVideoStats(key);
    likeCount.innerText = stats.likes || 0;
    dislikeCount.innerText = stats.dislikes || 0;
    viewDisplay.innerText = stats.views + " views";
    currentAction = stats.action || null;

    likeBtn.classList.toggle("active-btn", currentAction === "like");
    dislikeBtn.classList.toggle("active-btn", currentAction === "dislike");

    if (sidebarViewEl) sidebarViewEl.innerText = stats.views + " views";
}

// ===== LIKE/DISLIKE =====
likeBtn.addEventListener("click", async () => {
    if (!activeKey) return;
    const prev = currentAction;
    currentAction = currentAction === "like" ? null : "like";
    await updateLikeDislike(activeKey, currentAction, prev);
    loadVideo(player.src, activeKey);
});

dislikeBtn.addEventListener("click", async () => {
    if (!activeKey) return;
    const prev = currentAction;
    currentAction = currentAction === "dislike" ? null : "dislike";
    await updateLikeDislike(activeKey, currentAction, prev);
    loadVideo(player.src, activeKey);
});

// ===== SAVE BUTTON =====
saveBtn.addEventListener("click", () => {
    if (!player.src) return;
    const link = document.createElement("a");
    link.href = player.src;
    link.download = player.src.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// ===== SEARCH =====
searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    videoList.querySelectorAll(".preview-card").forEach(card => {
        const titleText = card.querySelector(".preview-title").innerText.toLowerCase();
        card.style.display = titleText.includes(filter) ? "flex" : "none";
    });
});

// ===== VOICE SEARCH =====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && voiceBtn) {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    voiceBtn.addEventListener("click", () => {
        recognition.start();
        voiceBtn.classList.add("listening");
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        const filter = transcript.toLowerCase();
        videoList.querySelectorAll(".preview-card").forEach(card => {
            const titleText = card.querySelector(".preview-title").innerText.toLowerCase();
            card.style.display = titleText.includes(filter) ? "flex" : "none";
        });
    };

    recognition.onend = () => voiceBtn.classList.remove("listening");
}

// ===== VIDEO GLOW EFFECT =====
function updateGlow() {
    if (player.paused || player.ended) return requestAnimationFrame(updateGlow);

    canvas.width = 40; canvas.height = 40;
    ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0,0,canvas.width,canvas.height).data;

    let r=0,g=0,b=0,count=0;
    for(let i=0;i<frame.length;i+=4){
        r+=frame[i]; g+=frame[i+1]; b+=frame[i+2]; count++;
    }
    r=Math.floor(r/count); g=Math.floor(g/count); b=Math.floor(b/count);
    const glowColor = `rgba(${r},${g},${b},0.6)`;
    document.querySelector(".video-wrapper").style.boxShadow = `0 0 60px ${glowColor},0 0 120px ${glowColor}`;
    requestAnimationFrame(updateGlow);
}

player.addEventListener("play", () => { updateGlow(); glow.play(); });
player.addEventListener("pause", () => { glow.pause(); });
player.addEventListener("seeking", () => { glow.currentTime = player.currentTime; });
player.addEventListener("seeked", () => { glow.currentTime = player

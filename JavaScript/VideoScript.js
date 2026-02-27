import { db } from "./FireBase.js";
import { collection, doc, getDoc, setDoc, updateDoc, increment, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Elements
const player = document.getElementById("videoPlayer");
const glow = document.getElementById("glowPlayer");
const videoList = document.getElementById("videoList");
const title = document.getElementById("mainTitle");
const viewDisplay = document.getElementById("viewCount");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeCount = document.getElementById("likeCount");
const dislikeCount = document.getElementById("dislikeCount");
const saveBtn = document.getElementById("saveBtn");
const searchInput = document.getElementById("searchInput");
const voiceBtn = document.getElementById("voiceBtn");
const canvas = document.getElementById("colorSampler");
const ctx = canvas.getContext("2d");

let activeKey = "";
let currentAction = null;

// ===== FIREBASE HELPERS =====
async function initVideoDoc(videoId, path) {
    const docRef = doc(db, "videos", videoId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        await setDoc(docRef, { views:0, likes:0, dislikes:0, path, action: null });
    }
}

function listenVideoStats(videoId) {
    const docRef = doc(db, "videos", videoId);
    return onSnapshot(docRef, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        likeCount.innerText = data.likes;
        dislikeCount.innerText = data.dislikes;
        viewDisplay.innerText = data.views + " views";
        currentAction = data.action || null;
        likeBtn.classList.toggle("active-btn", currentAction === "like");
        dislikeBtn.classList.toggle("active-btn", currentAction === "dislike");
    });
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
    card.dataset.key = key;

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
    views.id = `views_${key}`;
    views.innerText = "0 views";

    card.onclick = async () => loadVideo(path, key, views);

    thumb.appendChild(vid);
    info.appendChild(t);
    info.appendChild(views);
    card.appendChild(thumb);
    card.appendChild(info);
    videoList.appendChild(card);
}

// ===== LOAD VIDEO =====
let unsubscribe = null;
async function loadVideo(path, key, sidebarViewEl) {
    if (unsubscribe) unsubscribe(); // remove previous listener

    await initVideoDoc(key, path);

    player.src = path;
    glow.src = path;
    title.innerText = path.split("/").pop().replace(".mp4","");
    activeKey = key;

    unsubscribe = listenVideoStats(key);

    // Increment view on first play
    player.onplay = async () => {
        const docRef = doc(db, "videos", key);
        await updateDoc(docRef, { views: increment(1) });
        if (sidebarViewEl) sidebarViewEl.innerText = (parseInt(sidebarViewEl.innerText)||0)+1 + " views";
    };
}

// ===== LIKE/DISLIKE =====
likeBtn.addEventListener("click", async () => {
    if (!activeKey) return;
    const docRef = doc(db, "videos", activeKey);
    const prevAction = currentAction;
    currentAction = currentAction === "like" ? null : "like";

    await updateDoc(docRef, {
        likes: increment(currentAction === "like" ? 1 : -1),
        dislikes: prevAction === "dislike" && currentAction === "like" ? increment(-1) : undefined,
        action: currentAction
    });
});

dislikeBtn.addEventListener("click", async () => {
    if (!activeKey) return;
    const docRef = doc(db, "videos", activeKey);
    const prevAction = currentAction;
    currentAction = currentAction === "dislike" ? null : "dislike";

    await updateDoc(docRef, {
        dislikes: increment(currentAction === "dislike" ? 1 : -1),
        likes: prevAction === "like" && currentAction === "dislike" ? increment(-1) : undefined,
        action: currentAction
    });
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

// ===== GLOW EFFECT =====
function updateGlow() {
    if (player.paused || player.ended) return requestAnimationFrame(updateGlow);
    canvas.width = 40; canvas.height = 40;
    ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let r=0,g=0,b=0,count=0;
    for(let i=0;i<frame.length;i+=4){ r+=frame[i]; g+=frame[i+1]; b+=frame[i+2]; count++; }
    r=Math.floor(r/count); g=Math.floor(g/count); b=Math.floor(b/count);
    const glowColor = `rgba(${r},${g},${b},0.6)`;
    document.querySelector(".video-wrapper").style.boxShadow = `0 0 60px ${glowColor},0 0 120px ${glowColor}`;
    requestAnimationFrame(updateGlow);
}

player.addEventListener("play", () => { updateGlow(); glow.play(); });
player.addEventListener("pause", () => glow.pause());
player.addEventListener("seeking", () => glow.currentTime = player.currentTime);
player.addEventListener("seeked", () => glow.currentTime = player.currentTime);
player.addEventListener("ratechange", () => glow.playbackRate = player.playbackRate);

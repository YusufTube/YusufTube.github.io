import { getDatabase, ref, get, set, update, child } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";
import { app } from "./FireBase.js";

const db = getDatabase(app);

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
const searchInput = document.getElementById("searchInput");
const voiceBtn = document.getElementById("voiceBtn");

let activeKey = "";

// Firebase helpers
async function getVideoStats(videoId) {
    const snapshot = await get(child(ref(db), `videos/${videoId}`));
    return snapshot.exists() ? snapshot.val() : { views: 0, likes: 0, dislikes: 0, action: null, viewed: false };
}

async function saveVideoStats(videoId, stats) {
    await set(ref(db, `videos/${videoId}`), stats);
}

function updateLikeDislikeUI(stats) {
    likeCount.innerText = stats.likes || 0;
    dislikeCount.innerText = stats.dislikes || 0;
    likeBtn.classList.toggle("active-btn", stats.action === "like");
    dislikeBtn.classList.toggle("active-btn", stats.action === "dislike");
}

// Load video
async function loadVideo(path, key, sidebarViewEl) {
    player.src = path;
    glow.src = path;
    title.innerText = path.split("/").pop().replace(".mp4", "");
    activeKey = key;

    const stats = await getVideoStats(key);
    updateLikeDislikeUI(stats);
    viewDisplay.innerText = stats.views + " views";
    if (sidebarViewEl) sidebarViewEl.innerText = stats.views + " views";
}

// Like/Dislike buttons
likeBtn.addEventListener("click", async () => {
    if (!activeKey) return;
    const stats = await getVideoStats(activeKey);
    if (stats.action === "like") { stats.likes--; stats.action = null; }
    else { if(stats.action==="dislike") stats.dislikes--; stats.likes++; stats.action="like"; }
    await saveVideoStats(activeKey, stats);
    updateLikeDislikeUI(stats);
});

dislikeBtn.addEventListener("click", async () => {
    if (!activeKey) return;
    const stats = await getVideoStats(activeKey);
    if (stats.action === "dislike") { stats.dislikes--; stats.action = null; }
    else { if(stats.action==="like") stats.likes--; stats.dislikes++; stats.action="dislike"; }
    await saveVideoStats(activeKey, stats);
    updateLikeDislikeUI(stats);
});

// Save button
saveBtn.addEventListener("click", () => {
    if (!player.src) return;
    const link = document.createElement("a");
    link.href = player.src;
    link.download = player.src.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Video list from GitHub
const videoPaths = [
    "https://raw.githubusercontent.com/YusufTube/YusufTubeAssets/main/video1.mp4",
    "https://raw.githubusercontent.com/YusufTube/YusufTubeAssets/main/video2.mp4",
    "https://raw.githubusercontent.com/YusufTube/YusufTubeAssets/main/video3.mp4"
    // add all videos similarly
];

function addVideo(path) {
    const file = path.split("/").pop();
    const name = file.replace(".mp4","").replace(/_/g," ");
    const key = "ys_" + file;

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
    card.onmouseleave = () => { vid.pause(); vid.currentTime=0; };

    const info = document.createElement("div");
    const t = document.createElement("div");
    t.className = "preview-title";
    t.innerText = name;

    const views = document.createElement("div");
    views.className = "preview-views";
    views.innerText = "0 views";

    card.onclick = () => loadVideo(path,key,views);

    thumb.appendChild(vid);
    info.appendChild(t);
    info.appendChild(views);
    card.appendChild(thumb);
    card.appendChild(info);
    videoList.appendChild(card);
}

videoPaths.forEach(addVideo);

// Auto-load first video
if(videoList.firstChild) videoList.firstChild.click();

// Search
searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    videoList.querySelectorAll(".preview-card").forEach(card => {
        const title = card.querySelector(".preview-title").innerText.toLowerCase();
        card.style.display = title.includes(filter) ? "flex" : "none";
    });
});

// ===== VOICE SEARCH =====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if(SpeechRecognition && voiceBtn){
    const recognition = new SpeechRecognition();
    recognition.lang="en-US";
    recognition.continuous=false;

    voiceBtn.addEventListener("click", ()=>{
        recognition.start();
        voiceBtn.classList.add("listening");
    });

    recognition.onresult = (event)=>{
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;

        const filter = transcript.toLowerCase();
        videoList.querySelectorAll(".preview-card").forEach(card=>{
            const title = card.querySelector(".preview-title").innerText.toLowerCase();
            card.style.display = title.includes(filter) ? "flex" : "none";
        });
    }

    recognition.onend = ()=>{ voiceBtn.classList.remove("listening"); }
}

// ===== GLOW EFFECT & SYNC =====
const canvas = document.getElementById("colorSampler");
const ctx = canvas.getContext("2d");

function updateGlow() {
    if(player.paused || player.ended) return requestAnimationFrame(updateGlow);

    canvas.width=40; canvas.height=40;
    ctx.drawImage(player,0,0,canvas.width,canvas.height);
    const frame = ctx.getImageData(0,0,canvas.width,canvas.height).data;

    let r=0,g=0,b=0,count=0;
    for(let i=0;i<frame.length;i+=4){ r+=frame[i]; g+=frame[i+1]; b+=frame[i+2]; count++; }
    r=Math.floor(r/count); g=Math.floor(g/count); b=Math.floor(b/count);

    const glowColor = `rgba(${r},${g},${b},0.6)`;
    document.querySelector(".video-wrapper").style.boxShadow=`0 0 60px ${glowColor}, 0 0 120px ${glowColor}`;

    requestAnimationFrame(updateGlow);
}

player.addEventListener("play", ()=>{ updateGlow(); glow.play(); });
player.addEventListener("pause", ()=>{ glow.pause(); });
player.addEventListener("seeking", ()=>{ glow.currentTime=player.currentTime; });
player.addEventListener("seeked", ()=>{ glow.currentTime=player.currentTime; });
player.addEventListener("ratechange", ()=>{ glow.playbackRate=player.playbackRate; });

// ===== VIEWS & RANDOM NEXT VIDEO =====
player.addEventListener("ended", async ()=>{
    if(!activeKey) return;

    const stats = await getVideoStats(activeKey);
    if(!stats.viewed){ stats.views++; stats.viewed=true; await saveVideoStats(activeKey,stats); viewDisplay.innerText = stats.views + " views"; }

    // Update sidebar views
    const sidebarEl = Array.from(videoList.children)
        .find(c=>c.dataset.path===player.src)
        ?.querySelector(".preview-views");
    if(sidebarEl) sidebarEl.innerText = stats.views + " views";

    // Random next video
    const randomIndex = Math.floor(Math.random() * videoPaths.length);
    const randomPath = videoPaths[randomIndex];
    const randomFile = randomPath.split("/").pop();
    const randomKey = "ys_" + randomFile;

    loadVideo(randomPath, randomKey);
    player.play();
});

// Safety resync glow
setInterval(()=>{ if(!player.paused && Math.abs(glow.currentTime - player.currentTime) > 0.2) glow.currentTime = player.currentTime; },1000);

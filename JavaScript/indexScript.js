// ==========================
// FIREBASE IMPORTS
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// ==========================
// FIREBASE CONFIG
// ==========================
const firebaseConfig = {
    apiKey: "AIzaSyDAr2KgoAyhkxGUm5FmuexzLmm_XyiQQ0c",
    authDomain: "yusuftube-63599.firebaseapp.com",
    projectId: "yusuftube-63599",
    storageBucket: "yusuftube-63599.firebasestorage.app",
    messagingSenderId: "9588442108",
    appId: "1:9588442108:web:065d421a1652d75a392879"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================
// ELEMENTS
// ==========================
const videoGrid = document.getElementById("videoGrid");

// ==========================
// GITHUB VIDEO BASE PATH
// ==========================

// CHANGE THIS TO YOUR ACTUAL REPO RAW LINK
const GITHUB_BASE =
"https://yusuftube.github.io/Videos/";

// ==========================
// VIDEO LIST (STATIC)
// ==========================
const videos = [
    "video1/ronaldo drinking meme 1 hour.mp4",
    "video2/diddy heil epstein.mp4",
    "video3/metro man arm swing 1 hour.mp4",
    "video4/Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster).mp4",
    "video5/All Hallows Eve.mp4",
    "video6/1-800 bbnos.mp4",
    "video7/1 hour of Shreksophone.mp4",
    "video8/f25 key 1 hour.mp4",
    "video9/100 Gün Minecraft ama Her Gün FARKLI MOBA Dönüşüyorum... (part 1).mp4",
    "video10/100 Gün Minecraft ama Her Gün FARKLI MOBA Dönüşüyorum... (part 2).mp4",
    "video11/Minecraft'ı Bitiriyorum ama 4 Avcıya Karşı.mp4",
    "video12/Minecraft Manhunt ama 2 NETHERITE TANK'a Karşı....mp4",
    "video13/Minecraft Manhunt ama Çimene DOKUNAMIYORUZ....mp4",
    "video14/Berkay Inan - Aptal Kedi (çok resmi lyric video).mp4"
];

// ==========================
// CREATE VIDEO CARD
// ==========================
async function addHomeVideo(path) {

    const fullPath = GITHUB_BASE + path;
    const fileName = path.split('/').pop();
    const cleanName = fileName
        .replace('.mp4','')
        .replace(/_/g,' ');

    const videoId = fileName.replace(".mp4", "");

    const card = document.createElement("div");
    card.className = "video-card";

    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    const previewVideo = document.createElement("video");
    previewVideo.src = fullPath;
    previewVideo.muted = true;
    previewVideo.loop = true;
    previewVideo.playsInline = true;

    thumbnail.appendChild(previewVideo);

    const info = document.createElement("div");
    info.className = "video-info";

    const titleDiv = document.createElement("div");
    titleDiv.className = "video-title";
    titleDiv.innerText = cleanName;

    const viewsDiv = document.createElement("div");
    viewsDiv.className = "video-views";
    viewsDiv.innerText = "Loading...";

    info.appendChild(titleDiv);
    info.appendChild(viewsDiv);

    card.appendChild(thumbnail);
    card.appendChild(info);

    videoGrid.appendChild(card);

    // Hover preview
    card.addEventListener("mouseenter", () => {
        previewVideo.play();
    });

    card.addEventListener("mouseleave", () => {
        previewVideo.pause();
        previewVideo.currentTime = 0;
    });

    // Click → increment views in Firebase
    card.onclick = async () => {

        const videoRef = doc(db, "videos", videoId);
        const snap = await getDoc(videoRef);

        if (snap.exists()) {
            await updateDoc(videoRef, {
                views: increment(1)
            });
        } else {
            await setDoc(videoRef, {
                views: 1
            });
        }

        window.location.href =
            "Htmls/video.html?video=" + encodeURIComponent(fullPath);
    };

    // Load views from Firebase
    const videoRef = doc(db, "videos", videoId);
    const snap = await getDoc(videoRef);

    if (snap.exists()) {
        viewsDiv.innerText = snap.data().views + " views";
    } else {
        viewsDiv.innerText = "0 views";
    }
}

// ==========================
// INIT
// ==========================
videos.forEach(addHomeVideo);

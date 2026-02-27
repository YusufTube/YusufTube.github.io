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
    increment,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

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
const auth = getAuth(app);

// ==========================
// ELEMENTS
// ==========================
const videoGrid = document.getElementById("videoGrid");
const searchInput = document.getElementById("searchInput");
const autocompleteList = document.getElementById("autocomplete-list");
const searchBtn = document.getElementById("searchBtn");

// ==========================
// GITHUB VIDEO BASE PATH
// ==========================
const GITHUB_BASE = "https://yusuftube.github.io/Videos/";

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
// AUTOCOMPLETE & SEARCH
// ==========================
let currentFocus = -1;

// Get user past searches
async function getUserPastSearches() {
    if (!auth.currentUser) return [];
    const uid = auth.currentUser.uid;
    const userDoc = doc(db, "users", uid);
    const snap = await getDoc(userDoc);
    if (snap.exists() && snap.data().searches) return snap.data().searches;
    return [];
}

function getVideoNames() {
    return videos.map(v => v.split('/').pop().replace('.mp4','').replace(/_/g,' '));
}

async function showAutocomplete() {
    currentFocus = -1; // reset keyboard focus
    const input = searchInput.value.toLowerCase();
    autocompleteList.innerHTML = '';
    if (!input) return;

    const pastSearches = await getUserPastSearches();
    const videoNames = getVideoNames();

    const suggestions = [...new Set([...pastSearches, ...videoNames])]
        .filter(item => item.toLowerCase().includes(input));

    suggestions.forEach(s => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.textContent = s;
        div.addEventListener('click', () => {
            searchInput.value = s;
            autocompleteList.innerHTML = '';
            performSearch(s);
        });
        autocompleteList.appendChild(div);
    });
}

async function performSearch(query) {
    if (!query) return;
    if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDoc = doc(db, "users", uid);
        await updateDoc(userDoc, { searches: arrayUnion(query) });
    }
    console.log("Search performed for:", query);
}

searchInput.addEventListener('input', showAutocomplete);
searchBtn.addEventListener('click', () => performSearch(searchInput.value));

// Keyboard navigation
searchInput.addEventListener("keydown", function(e) {
    const items = autocompleteList.getElementsByClassName("autocomplete-item");
    if (!items) return;

    if (e.key === "ArrowDown") {
        currentFocus++;
        addActive(items);
        e.preventDefault();
    } else if (e.key === "ArrowUp") {
        currentFocus--;
        addActive(items);
        e.preventDefault();
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocus > -1 && items[currentFocus]) {
            items[currentFocus].click();
        } else {
            performSearch(searchInput.value);
            autocompleteList.innerHTML = '';
        }
    } else if (e.key === "Escape") {
        autocompleteList.innerHTML = '';
    }
});

function addActive(items) {
    if (!items) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");
}

function removeActive(items) {
    Array.from(items).forEach(item => item.classList.remove("autocomplete-active"));
}

// Close autocomplete when clicking outside
document.addEventListener("click", function(e) {
    if (e.target !== searchInput) autocompleteList.innerHTML = '';
});

// ==========================
// CREATE VIDEO CARDS
// ==========================
async function addHomeVideo(path) {
    const fullPath = GITHUB_BASE + path;
    const fileName = path.split('/').pop();
    const cleanName = fileName.replace('.mp4','').replace(/_/g,' ');
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

    card.addEventListener("mouseenter", () => previewVideo.play());
    card.addEventListener("mouseleave", () => {
        previewVideo.pause();
        previewVideo.currentTime = 0;
    });

    card.onclick = async () => {
        const videoRef = doc(db, "videos", videoId);
        const snap = await getDoc(videoRef);

        if (snap.exists()) {
            await updateDoc(videoRef, { views: increment(1) });
        } else {
            await setDoc(videoRef, { views: 1 });
        }

        window.location.href = "Htmls/video.html?video=" + encodeURIComponent(fullPath);
    };

    const videoRef = doc(db, "videos", videoId);
    const snap = await getDoc(videoRef);
    if (snap.exists()) viewsDiv.innerText = snap.data().views + " views";
    else viewsDiv.innerText = "0 views";
}

// ==========================
// INIT
// ==========================
videos.forEach(addHomeVideo);

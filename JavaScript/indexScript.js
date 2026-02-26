// =============================
// ELEMENTS
// =============================
const videoGrid = document.getElementById("videoGrid");
const searchInput = document.getElementById("searchInput");
const voiceBtn = document.getElementById("voiceBtn");

// =============================
// INDEXED DB SETUP
// =============================
let db;
const request = indexedDB.open("YusufTubeDB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;

    if (!db.objectStoreNames.contains("videos")) {
        const store = db.createObjectStore("videos", { keyPath: "id" });
        store.createIndex("title", "title", { unique: false });
    }
};

request.onsuccess = (e) => {
    db = e.target.result;
    initVideos();
};

request.onerror = (e) => {
    console.error("DB error:", e.target.errorCode);
};

// =============================
// GET VIDEO STATS
// =============================
function getVideoStats(videoId, callback) {
    if (!db) {
        callback({ views: 0 });
        return;
    }

    const tx = db.transaction(["videos"], "readonly");
    const store = tx.objectStore("videos");
    const req = store.get(videoId);

    req.onsuccess = () => {
        callback(req.result || { views: 0 });
    };

    req.onerror = () => {
        callback({ views: 0 });
    };
}

// =============================
// CREATE VIDEO CARD
// =============================
function addHomeVideo(path) {
    const fileName = path.split('/').pop();
    const cleanName = fileName
        .replace('.mp4','')
        .replace(/_/g,' ');

    const key = "ys_" + fileName;

    const card = document.createElement("div");
    card.className = "video-card";

    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    const previewVideo = document.createElement("video");
    previewVideo.src = path;
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
    viewsDiv.innerText = "0 views";

    info.appendChild(titleDiv);
    info.appendChild(viewsDiv);

    card.appendChild(thumbnail);
    card.appendChild(info);

    // Hover preview
    card.addEventListener("mouseenter", () => {
        previewVideo.play();
    });

    card.addEventListener("mouseleave", () => {
        previewVideo.pause();
        previewVideo.currentTime = 0;
    });

    // IMPORTANT FIX (Htmls folder)
    card.onclick = () => {
        window.location.href =
            "Htmls/video.html?video=" + encodeURIComponent(path);
    };

    videoGrid.appendChild(card);

    // Load real views
    getVideoStats(key, (stats) => {
        viewsDiv.innerText = (stats.views || 0) + " views";
    });
}

// =============================
// INITIALIZE VIDEOS
// =============================
function initVideos() {
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

    videos.forEach(addHomeVideo);
}

// =============================
// SEARCH FILTER
// =============================
function filterVideos(query) {
    query = query.toLowerCase();

    const cards = document.querySelectorAll(".video-card");

    cards.forEach(card => {
        const title = card
            .querySelector(".video-title")
            .innerText
            .toLowerCase();

        card.style.display = title.includes(query)
            ? "block"
            : "none";
    });
}

searchInput.addEventListener("input", function() {
    filterVideos(this.value);
});

// =============================
// VOICE SEARCH FIXED
// =============================
const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

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
        filterVideos(transcript);
    };

    recognition.onend = () => {
        voiceBtn.classList.remove("listening");
    };

} else if (voiceBtn) {
    voiceBtn.style.display = "none";
}
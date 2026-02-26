const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const videoGrid = document.getElementById("videoGrid");
const resultsTitle = document.getElementById("resultsTitle");

/* ===== VIDEO LIST ===== */
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

/* ===== INDEXED DB SETUP (for views) ===== */
let db;
const request = indexedDB.open("YusufTubeDB", 1);

request.onsuccess = (e) => {
    db = e.target.result;
    initSearch();
};

function getVideoStats(videoId, callback) {
    if (!db) return callback({ views: 0 });

    const tx = db.transaction(["videos"], "readonly");
    const store = tx.objectStore("videos");
    const req = store.get(videoId);

    req.onsuccess = () => callback(req.result || { views: 0 });
    req.onerror = () => callback({ views: 0 });
}

/* ===== GET QUERY ===== */
function initSearch() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (query) {
        searchInput.value = query;
        resultsTitle.innerText = "Results for: " + query;
        showResults(query);
    }
}

searchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (q !== "") {
        window.location.href = "search.html?q=" + encodeURIComponent(q);
    }
});

/* ===== SHOW RESULTS ===== */
function showResults(searchText) {
    videoGrid.innerHTML = "";
    const lowerSearch = searchText.toLowerCase();

    const filtered = videos.filter(path => {
        const fileName = path.split('/').pop();
        const cleanName = fileName.replace('.mp4','').replace(/_/g,' ');
        return cleanName.toLowerCase().includes(lowerSearch);
    });

    if (filtered.length === 0) {
        videoGrid.innerHTML = "<p style='color:#FFD84D'>No videos found.</p>";
        return;
    }

    filtered.forEach(path => {
        const fileName = path.split('/').pop();
        const cleanName = fileName.replace('.mp4','').replace(/_/g,' ');
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
        titleDiv.innerText = cleanName;

        const viewsDiv = document.createElement("div");
        viewsDiv.style.color = "#FFD84D";
        viewsDiv.style.fontSize = "14px";
        viewsDiv.style.marginTop = "6px";
        viewsDiv.innerText = "0 views";

        info.appendChild(titleDiv);
        info.appendChild(viewsDiv);

        card.appendChild(thumbnail);
        card.appendChild(info);

        card.addEventListener("mouseenter", () => previewVideo.play());
        card.addEventListener("mouseleave", () => {
            previewVideo.pause();
            previewVideo.currentTime = 0;
        });

        card.onclick = () => {
            window.location.href = "video.html?video=" + encodeURIComponent(path);
        };

        videoGrid.appendChild(card);

        /* Fetch real views */
        getVideoStats(key, (stats) => {
            viewsDiv.innerText = (stats.views || 0) + " views";
        });
    });
}
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const videoGrid = document.getElementById("videoGrid");
const resultsTitle = document.getElementById("resultsTitle");

// ==========================
// VIDEO LIST
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
// INIT SEARCH
// ==========================
function initSearch() {

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (!query) return;

    searchInput.value = query;
    resultsTitle.innerText = "Results for: " + query;

    showResults(query);
}

initSearch();

// ==========================
// SEARCH BUTTON
// ==========================
searchBtn.addEventListener("click", () => {

    const q = searchInput.value.trim();

    if (q !== "") {
        window.location.href = "search.html?q=" + encodeURIComponent(q);
    }

});

// ==========================
// SHOW RESULTS
// ==========================
function showResults(text) {

    videoGrid.innerHTML = "";

    const search = text.toLowerCase();

    const filtered = videos.filter(path => {

        const fileName = path.split("/").pop();
        const cleanName = fileName.replace(".mp4", "").replace(/_/g, " ");

        return cleanName.toLowerCase().includes(search);

    });

    if (filtered.length === 0) {
        videoGrid.innerHTML =
            "<p style='color:#FFD84D'>No videos found.</p>";
        return;
    }

    filtered.forEach(path => {

        const fileName = path.split("/").pop();
        const cleanName = fileName.replace(".mp4", "").replace(/_/g, " ");

        const card = document.createElement("div");
        card.className = "video-card";

        const thumbnail = document.createElement("div");
        thumbnail.className = "thumbnail";

        const video = document.createElement("video");
        video.src = "../Videos/" + path;
        video.muted = true;
        video.loop = true;

        thumbnail.appendChild(video);

        const info = document.createElement("div");
        info.className = "video-info";
        info.innerText = cleanName;

        card.appendChild(thumbnail);
        card.appendChild(info);

        videoGrid.appendChild(card);

        card.addEventListener("mouseenter", () => video.play());
        card.addEventListener("mouseleave", () => {
            video.pause();
            video.currentTime = 0;
        });

        card.onclick = () => {
            window.location.href =
                "video.html?video=" + encodeURIComponent("../Videos/" + path);
        };

    });

}

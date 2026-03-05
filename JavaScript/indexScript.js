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
// SEARCH FUNCTION
// ==========================
function performSearch(query) {
    const q = query.trim();
    if (q === "") return;

    window.location.href = "Htmls/search.html?q=" + encodeURIComponent(q);
}

// search button
searchBtn.addEventListener("click", () => {
    performSearch(searchInput.value);
});

// enter key
searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        performSearch(searchInput.value);
    }
});

// ==========================
// AUTOCOMPLETE
// ==========================
function getVideoNames() {
    return videos.map(v =>
        v.split("/").pop().replace(".mp4", "").replace(/_/g, " ")
    );
}

searchInput.addEventListener("input", showAutocomplete);

function showAutocomplete() {

    const input = searchInput.value.toLowerCase();
    autocompleteList.innerHTML = "";

    if (!input) return;

    const names = getVideoNames();

    const results = names.filter(name =>
        name.toLowerCase().includes(input)
    );

    results.forEach(name => {

        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.innerText = name;

        div.onclick = () => {
            searchInput.value = name;
            performSearch(name);
        };

        autocompleteList.appendChild(div);

    });

}

// close autocomplete when clicking outside
document.addEventListener("click", function (e) {
    if (e.target !== searchInput) {
        autocompleteList.innerHTML = "";
    }
});

// ==========================
// VIDEO CARDS
// ==========================
function addHomeVideo(path) {

    const fullPath = GITHUB_BASE + path;
    const fileName = path.split("/").pop();
    const cleanName = fileName.replace(".mp4", "").replace(/_/g, " ");

    const card = document.createElement("div");
    card.className = "video-card";

    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    const video = document.createElement("video");
    video.src = fullPath;
    video.muted = true;
    video.loop = true;

    thumbnail.appendChild(video);

    const info = document.createElement("div");
    info.className = "video-info";

    const title = document.createElement("div");
    title.className = "video-title";
    title.innerText = cleanName;

    info.appendChild(title);

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
            "Htmls/video.html?video=" + encodeURIComponent(fullPath);
    };
}

// init
videos.forEach(addHomeVideo);

// Script per gestione pagine, video, filtri, cookie banner

// Variabili globali per memorizzare dati
let videos = [];
let filteredVideos = [];
let playlists = [];
let currentPlaylist = 'uploads';
let currentSort = 'date-desc';

// Canale Youtube da cui prendere dati (esempio)
const CHANNEL_ID = "UC1vXKEle3Mr2af6R5bp7mcg";
const API_KEY = "YOUR_YOUTUBE_API_KEY"; // Qui devi mettere la tua API key Youtube

// Funzione per mostrare una pagina (sezione) e nascondere le altre
function showPage(pageId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        if(section.id === pageId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
    // Scorri su in alto
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Funzione per creare elementi video
function createVideoCard(video) {
    const card = document.createElement('div');
    card.classList.add('video-card');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `Guarda video: ${video.title}`);

    card.innerHTML = `
        <img src="${video.thumbnail}" alt="Miniatura video: ${video.title}" class="video-thumbnail" />
        <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <p class="video-date">${new Date(video.publishedAt).toLocaleDateString('it-IT')}</p>
        </div>
    `;
    card.addEventListener('click', () => {
        playVideo(video.videoId);
    });
    card.addEventListener('keypress', e => {
        if(e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playVideo(video.videoId);
        }
    });
    return card;
}

// Funzione per riprodurre il video
function playVideo(videoId) {
    const playerContainer = document.getElementById('main-video-player');
    const placeholder = document.getElementById('player-placeholder');
    playerContainer.innerHTML = `
        <iframe width="100%" height="480" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    `;
    placeholder.classList.add('hidden');
    playerContainer.classList.remove('hidden');
}

// Funzione per ordinare video
function sortVideos(videos, criterion) {
    let sorted = [...videos];
    switch(criterion) {
        case 'date-desc':
            sorted.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            break;
        case 'date-asc':
            sorted.sort((a,b) => new Date(a.publishedAt) - new Date(b.publishedAt));
            break;
        case 'title-asc':
            sorted.sort((a,b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a,b) => b.title.localeCompare(a.title));
            break;
    }
    return sorted;
}

// Funzione per applicare filtro e ordinamento e aggiornare la galleria
function updateVideoGallery() {
    let filtered = currentPlaylist === 'uploads' ? videos : videos.filter(v => v.playlistId === currentPlaylist);
    filtered = sortVideos(filtered, currentSort);
    filteredVideos = filtered;

    const gallery = document.getElementById('video-gallery');
    gallery.innerHTML = '';

    if(filtered.length === 0) {
        gallery.innerHTML = `<p class="text-center text-slate-300">Nessun video disponibile per questo filtro.</p>`;
        return;
    }

    filtered.forEach(video => {
        const card = createVideoCard(video);
        gallery.appendChild(card);
    });
}

// Funzione per creare i filtri (playlist)
function createFilters() {
    const filtersContainer = document.getElementById('genre-filters');
    filtersContainer.innerHTML = '';

    // Bottone Tutti
    const allBtn = document.createElement('button');
    allBtn.textContent = 'Tutti';
    allBtn.classList.add('filter-button', 'active');
    allBtn.dataset.playlistId = 'uploads';
    allBtn.addEventListener('click', () => {
        currentPlaylist = 'uploads';
        setActiveFilter(allBtn);
        updateVideoGallery();
    });
    filtersContainer.appendChild(allBtn);

    // Aggiunge bottoni per ogni playlist (escluso "uploads")
    playlists.forEach(pl => {
        if(pl.id !== 'uploads') {
            const btn = document.createElement('button');
            btn.textContent = pl.title;
            btn.classList.add('filter-button');
            btn.dataset.playlistId = pl.id;
            btn.addEventListener('click', () => {
                currentPlaylist = pl.id;
                setActiveFilter(btn);
                updateVideoGallery();
            });
            filtersContainer.appendChild(btn);
        }
    });
}

// Funzione per evidenziare filtro attivo
function setActiveFilter(activeBtn) {
    const buttons = document.querySelectorAll('#genre-filters .filter-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Funzione per caricare dati da YouTube API (simulata qui)
async function fetchVideos() {
    try {
        // Simuliamo dati video statici per esempio (in pratica chiameresti API)
        videos = [
            {
                videoId: "dQw4w9WgXcQ",
                title: "Sample Video 1",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                publishedAt: "2023-01-01T12:00:00Z",
                playlistId: "uploads"
            },
            {
                videoId: "kJQP7kiw5Fk",
                title: "Sample Video 2",
                thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
                publishedAt: "2023-02-15T15:30:00Z",
                playlistId: "playlist1"
            }
        ];
        playlists = [
            { id: 'uploads', title: 'Tutti' },
            { id: 'playlist1', title: 'Pop' }
        ];
        createFilters();
        updateVideoGallery();
    } catch(error) {
        document.getElementById('error-message').classList.remove('hidden');
        console.error('Errore caricamento video:', error);
    }
}

// Ordinamento change listener
document.getElementById('sort-by').addEventListener('change', (e) => {
    currentSort = e.target.value;
    updateVideoGallery();
});

// Inizializzazione pagina
window.addEventListener('DOMContentLoaded', () => {
    fetchVideos();
});

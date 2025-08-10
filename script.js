// Funzione per mostrare la sezione desiderata (Home, Articoli, etc.)
function showPage(pageId) {
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(section => {
    if(section.id === pageId) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });

  // Nascondi messaggio errore quando cambio pagina
  const errorMsg = document.getElementById('error-message');
  if (errorMsg) errorMsg.classList.add('hidden');
}

// Esempio dati video, da sostituire con dati reali / API YouTube
const videos = [
  {
    id: 'xT5d8gYREcM',
    title: 'La canzone del sole - Basi Karaoke',
    playlistId: 'uploads',
    genre: 'Pop'
  },
  {
    id: '0KsPE81ZRMc',
    title: 'Volare - Basi Karaoke',
    playlistId: 'uploads',
    genre: 'Classica'
  },
  // Aggiungi altri video qui...
];

// Selettore del contenitore video
const gallery = document.getElementById('video-gallery');
const mainPlayer = document.getElementById('main-video-player');
const playerPlaceholder = document.getElementById('player-placeholder');

// Funzione per caricare video nella galleria
function loadVideos(filter = 'uploads') {
  gallery.innerHTML = '';
  let filteredVideos = filter === 'uploads' ? videos : videos.filter(v => v.genre === filter);
  if(filteredVideos.length === 0){
    gallery.innerHTML = `<p class="text-center text-slate-400">Nessun video disponibile per questo filtro.</p>`;
    return;
  }
  filteredVideos.forEach(video => {
    const videoDiv = document.createElement('div');
    videoDiv.className = 'video-card cursor-pointer rounded-xl overflow-hidden shadow-lg bg-slate-700 hover:scale-105 transform transition-transform duration-300';
    videoDiv.innerHTML = `
      <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="${video.title}" class="w-full aspect-video" />
      <div class="p-4">
        <h3 class="text-white font-semibold text-lg">${video.title}</h3>
      </div>
    `;
    videoDiv.onclick = () => playVideo(video.id);
    gallery.appendChild(videoDiv);
  });
}

// Funzione per caricare il video nel lettore
function playVideo(videoId) {
  mainPlayer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allowfullscreen allow="autoplay"></iframe>`;
  mainPlayer.classList.remove('hidden');
  playerPlaceholder.style.display = 'none';
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// Filtri genere dinamici (da adattare a dati reali)
const genreFilters = document.getElementById('genre-filters');
const genres = ['Pop', 'Classica', 'Rock', 'Jazz']; // esempio

function createGenreFilters(){
  genres.forEach(genre => {
    const btn = document.createElement('button');
    btn.className = 'filter-button';
    btn.textContent = genre;
    btn.dataset.playlistId = genre;
    btn.onclick = () => {
      document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadVideos(genre);
    }
    genreFilters.appendChild(btn);
  });
}

// Attiva filtro "Tutti" di default
document.querySelector('.filter-button[data-playlist-id="uploads"]').onclick = () => {
  document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-button[data-playlist-id="uploads"]').classList.add('active');
  loadVideos('uploads');
};

// Inizializzazione
window.onload = () => {
  showPage('home');
  createGenreFilters();
  loadVideos();
};

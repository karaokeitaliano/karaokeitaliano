document.addEventListener('DOMContentLoaded', () => {
  // --- COSTANTI E SELETTORI ---
  const apiKey = 'AIzaSyCDCsEZ_BHN6fSCvAbNkd9Gx-FV84f9_wI';
  const channelId = 'UC09bE-qRBo72IIQ54Xaf-EA';

  const videoGallery = document.getElementById('video-gallery');
  const errorMessage = document.getElementById('error-message');
  const channelLink = document.getElementById('channel-link');
  const channelTitle = document.getElementById('channel-title');
  const channelInfoSection = document.getElementById('channel-info');
  const profilePicContainer = document.getElementById('profile-pic-container');
  const channelDescription = document.getElementById('channel-description');
  const mainVideoPlayer = document.getElementById('main-video-player');
  const playerPlaceholder = document.getElementById('player-placeholder');
  const genreFiltersContainer = document.getElementById('genre-filters');
  const sortBySelect = document.getElementById('sort-by');
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookiesButton = document.getElementById('accept-cookies');
  const aiOutputContainer = document.getElementById('ai-output');
  const generateIntroBtn = document.getElementById('generate-intro-btn');
  const summarizeLyricsBtn = document.getElementById('summarize-lyrics-btn');

  let allVideos = [];
  let uploadsPlaylistId = '';

  // --- FUNZIONE NAVIGAZIONE OTTIMIZZATA ---
  window.showPage = (pageId) => {
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.toggle('hidden-section', section.id !== pageId);
    });

    // Caricamenti specifici per pagina
    if (pageId === 'home') {
      init();  // ricarica home per aggiornare contenuti
    } else if (pageId === 'articles-section') {
      generateArticles();
    }
  };

  // --- FUNZIONE PER MOSTRARE VIDEO PRINCIPALE CON LA LAZY LOADING ---
  const loadMainVideo = (videoId) => {
    if (playerPlaceholder) playerPlaceholder.style.display = 'none';
    if (mainVideoPlayer) {
      mainVideoPlayer.style.display = 'block';
      // Inseriamo iframe solo quando serve
      mainVideoPlayer.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>`;
    }
  };

  // --- RENDER VIDEO CON THUMBNAIL E CLICK LAZY LOAD ---
  const renderVideos = (videos) => {
    if (!videoGallery) return;
    videoGallery.innerHTML = '';

    if (videos.length === 0) {
      videoGallery.innerHTML = '<p class="text-center text-slate-400 col-span-full">Nessun video trovato.</p>';
      return;
    }

    videos.forEach(item => {
      const videoId = item.snippet.resourceId.videoId;
      const title = item.snippet.title;
      const thumbnailUrl = item.snippet.thumbnails?.medium?.url || 'https://placehold.co/320x180/2b3a4a/fff?text=N/A';

      const videoCard = document.createElement('div');
      videoCard.className = 'bg-slate-800 p-4 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300 video-card';
      videoCard.dataset.videoId = videoId;

      videoCard.innerHTML = `
        <img src="${thumbnailUrl}" alt="${title}" class="rounded-lg mb-4 w-full" loading="lazy" />
        <h3 class="text-xl font-semibold text-slate-100">${title}</h3>
      `;

      videoGallery.appendChild(videoCard);
    });

    // Event delegation per video click
    videoGallery.onclick = (e) => {
      let target = e.target;
      while (target && !target.classList.contains('video-card')) {
        target = target.parentElement;
      }
      if (target && target.dataset.videoId) {
        loadMainVideo(target.dataset.videoId);
      }
    };
  };

  // --- ORDINAMENTO VIDEO ---
  const sortVideos = () => {
    if (!sortBySelect || allVideos.length === 0) return;

    const sortBy = sortBySelect.value;
    let sortedVideos = [...allVideos];

    switch (sortBy) {
      case 'date-desc':
        sortedVideos.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
        break;
      case 'date-asc':
        sortedVideos.sort((a, b) => new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt));
        break;
      case 'title-asc':
        sortedVideos.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title));
        break;
      case 'title-desc':
        sortedVideos.sort((a, b) => b.snippet.title.localeCompare(a.snippet.title));
        break;
    }

    renderVideos(sortedVideos);
    if (sortedVideos.length > 0) loadMainVideo(sortedVideos[0].snippet.resourceId.videoId);
  };

  // --- FILTRO VIDEO PER PLAYLIST ---
  const filterVideos = async (playlistId) => {
    if (!genreFiltersContainer) return;

    // Toggle active button
    genreFiltersContainer.querySelectorAll('.filter-button').forEach(button => {
      button.classList.toggle('active', button.dataset.playlistId === playlistId);
    });

    // Carica video playlist
    if (playlistId === 'uploads') {
      await fetchVideosByPlaylist(uploadsPlaylistId);
    } else {
      await fetchVideosByPlaylist(playlistId);
    }

    sortVideos();
  };

  // --- FETCH CANALE E AGGIORNA INFO ---
  const fetchChannelInfo = async () => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&key=${apiKey}&part=snippet,brandingSettings,contentDetails`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (!data.items || data.items.length === 0) throw new Error('Channel info not found');

      const channel = data.items[0];
      const channelName = channel.snippet.title;
      const profilePicUrl = channel.snippet.thumbnails.high.url;
      const bannerUrl = channel.brandingSettings?.image?.bannerImageUrl || '';
      const descriptionText = 'Qui puoi trovare tutti i miei video e richiedere le tue basi personalizzate!';

      if (channelTitle) {
        channelTitle.textContent = channelName;
        channelTitle.classList.remove('shimmer-bg', 'w-1-2', 'h-12');
      }
      if (profilePicContainer) {
        profilePicContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = profilePicUrl;
        img.alt = 'Profile Picture';
        img.className = 'rounded-full w-28 h-28 mx-auto mb-4 border-4 border-blue-400 shadow-lg';
        profilePicContainer.appendChild(img);
      }
      if (channelInfoSection && bannerUrl) {
        channelInfoSection.style.backgroundImage = `url(${bannerUrl})`;
      }
      if (channelDescription) {
        channelDescription.textContent = descriptionText;
      }
      if (channelLink) {
        channelLink.href = `https://www.youtube.com/channel/${channelId}`;
      }

      return channel.contentDetails.relatedPlaylists.uploads;
    } catch (error) {
      console.error('Errore nel recupero delle informazioni del canale:', error);
      if (errorMessage) {
        errorMessage.textContent = "Errore: La chiave API potrebbe non essere valida o avere restrizioni. Controlla le impostazioni nella Google Developers Console.";
        errorMessage.style.display = 'block';
      }
      throw error;
    }
  };

  // --- FETCH PLAYLIST ---
  const fetchPlaylists = async () => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlists?channelId=${channelId}&key=${apiKey}&part=snippet,contentDetails&maxResults=50`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const popularPlaylists = data.items
        .sort((a, b) => (b.contentDetails?.itemCount || 0) - (a.contentDetails?.itemCount || 0))
        .slice(0, 5);

      if (genreFiltersContainer) {
        genreFiltersContainer.innerHTML = '<button class="filter-button active" data-playlist-id="uploads">Tutti</button>';
        popularPlaylists.forEach(playlist => {
          const button = document.createElement('button');
          button.className = 'filter-button';
          button.textContent = playlist.snippet.title;
          button.dataset.playlistId = playlist.id;
          genreFiltersContainer.appendChild(button);
        });
      }
    } catch (error) {
      console.error('Errore nel recupero delle playlist:', error);
    }
  };

  // --- FETCH VIDEO PER PLAYLIST ---
  const fetchVideosByPlaylist = async (playlistId) => {
    if (!playlistId) return;
    try {
      const videos = [];
      let nextPageToken = '';
      do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${apiKey}&part=snippet&maxResults=50&pageToken=${nextPageToken}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        videos.push(...data.items);
        nextPageToken = data.nextPageToken || '';
      } while (nextPageToken);

      allVideos = videos;
      renderVideos(allVideos);
      if (allVideos.length > 0) loadMainVideo(allVideos[0].snippet.resourceId.videoId);
    } catch (error) {
      console.error('Errore nel recupero dei video:', error);
    }
  };

  // --- INIZIALIZZAZIONE ---
  const init = async () => {
    try {
      uploadsPlaylistId = await fetchChannelInfo();
      await fetchPlaylists();
      await fetchVideosByPlaylist(uploadsPlaylistId);
    } catch (error) {
      // Già gestito negli catch specifici
    }
  };

  // --- EVENTI ---
  if (sortBySelect) {
    sortBySelect.addEventListener('change', () => sortVideos());
  }

  if (genreFiltersContainer) {
    genreFiltersContainer.addEventListener('click', async (e) => {
      if (e.target.classList.contains('filter-button')) {
        const playlistId = e.target.dataset.playlistId;
        if (playlistId) {
          await filterVideos(playlistId);
        }
      }
    });
  }

  // --- BANNER COOKIE ---
  try {
    if (!localStorage.getItem('cookieConsent')) {
      cookieBanner.style.display = 'flex';
    }
  } catch (e) {
    console.warn("LocalStorage non disponibile", e);
  }

  if (acceptCookiesButton) {
    acceptCookiesButton.addEventListener('click', () => {
      try {
        localStorage.setItem('cookieConsent', 'true');
      } catch (e) {
        console.warn("Impossibile salvare consenso cookie", e);
      }
      cookieBanner.style.display = 'none';
    });
  }

  // --- FUNZIONI AI (placeholder) ---
  if (generateIntroBtn) {
    generateIntroBtn.addEventListener('click', () => {
      aiOutputContainer.textContent = 'Generazione intro in corso...';
      setTimeout(() => {
        aiOutputContainer.textContent = 'Intro generata! (simulazione)';
      }, 2000);
    });
  }
  if (summarizeLyricsBtn) {
    summarizeLyricsBtn.addEventListener('click', () => {
      aiOutputContainer.textContent = 'Riassunto testi in corso...';
      setTimeout(() => {
        aiOutputContainer.textContent = 'Riassunto completato! (simulazione)';
      }, 2000);
    });
  }

  // --- AVVIO ---
  init();
});

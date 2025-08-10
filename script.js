// This file contains all the JavaScript logic for the Karaoke Italiano website.

document.addEventListener('DOMContentLoaded', () => {
    // API keys and Channel ID
    const apiKey = 'AIzaSyCDCsEZ_BHN6fSCvAbNkd9Gx-FV84f9_wI';
    const channelId = 'UC09bE-qRBo72IIQ54Xaf-EA';
    
    // DOM Elements
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
    const pageContent = document.getElementById('page-content');
    
    let allVideos = [];
    let uploadsPlaylistId = '';

    // Function to show a specific page
    window.showPage = (pageId) => {
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
            if (pageId === 'home') {
                fetchVideosAndPlaylistInfo();
            } else if (pageId === 'articles-section') {
                generateArticles();
            }
        }
    };

    // Function to call the Gemini API
    async function geminiCall(prompt) {
        const geminiKey = ''; // Leave this as-is for Gemini to provide the key.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiKey}`;
        const chatHistory = [{
            role: "user",
            parts: [{ text: prompt }]
        }];
        const payload = {
            contents: chatHistory,
        };

        let response = null;
        let result = null;
        for (let i = 0; i < 5; i++) { // Exponential backoff with 5 retries
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (response.ok) {
                    result = await response.json();
                    break;
                } else if (response.status === 429 || response.status === 500) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                throw error;
            }
        }

        if (result && result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Errore: la risposta dell'API Gemini è vuota o mal formattata.");
            return "Mi dispiace, non sono riuscito a generare una risposta.";
        }
    }

    // Function to generate and display articles
    const generateArticles = async () => {
        const articlesContainer = document.getElementById('articles-container');
        if (!articlesContainer) return;

        articlesContainer.innerHTML = `
            <div class="bg-slate-800 p-8 rounded-xl shadow-lg text-center text-slate-400">
                Generazione articoli in corso...
            </div>
        `;

        try {
            const articleTitles = [
                'Guida per principianti al Karaoke',
                'I benefici del Karaoke per la salute',
                'Come scegliere la base strumentale perfetta'
            ];

            const generatedArticles = await Promise.all(
                articleTitles.map(async (title) => {
                    const prompt = `Genera un articolo sul karaoke con il titolo "${title}". Sii amichevole, conciso, e usa un tono positivo. L'articolo dovrebbe essere formattato in HTML con tag <p> e <h3> e avere massimo 200 parole.`;
                    const content = await geminiCall(prompt);
                    return { title, content };
                })
            );

            articlesContainer.innerHTML = '';
            generatedArticles.forEach(article => {
                const articleHtml = `
                    <div class="bg-slate-800 p-4 rounded-xl shadow-lg">
                        <h3>${article.title}</h3>
                        <p>${article.content}</p>
                    </div>
                `;
                articlesContainer.innerHTML += articleHtml;
            });

        } catch (error) {
            console.error("Errore durante la generazione degli articoli:", error);
            articlesContainer.innerHTML = `<p class="text-center text-red-500">
                Si è verificato un errore durante la generazione degli articoli. Riprova più tardi.
            </p>`;
        }
    };

    // Function to update channel info
    const updateChannelInfo = (channelName, profilePicUrl, bannerUrl, descriptionText) => {
        const privacyChannelNameSpan = document.getElementById('privacy-channel-name');
        const navbarBrand = document.querySelector('.navbar-brand');
        const footerCopyright = document.querySelector('footer p:first-of-type');
        
        if (channelTitle) {
            channelTitle.textContent = channelName;
            channelTitle.classList.remove('shimmer-bg', 'w-1-2', 'h-12');
        }
        if (navbarBrand) {
            navbarBrand.textContent = channelName;
        }
        if (footerCopyright) {
            footerCopyright.textContent = `© 2025 ${channelName}. Tutti i diritti riservati.`;
        }
        if (profilePicContainer) {
            const profilePic = document.createElement('img');
            profilePic.src = profilePicUrl;
            profilePic.alt = 'Profile Picture';
            profilePic.className = 'rounded-full w-28 h-28 mx-auto mb-4 border-4 border-blue-400 shadow-lg';
            profilePicContainer.innerHTML = '';
            profilePicContainer.appendChild(profilePic);
        }
        
        if (channelInfoSection) {
            channelInfoSection.style.backgroundImage = 'url(' + bannerUrl + ')';
        }
        if (channelDescription) {
            channelDescription.textContent = descriptionText;
        }
        if (channelLink) {
            channelLink.href = 'https://www.youtube.com/channel/' + channelId;
        }
        if (privacyChannelNameSpan) {
            privacyChannelNameSpan.textContent = channelName;
        }
    };

    // Function to fetch channel info
    const fetchChannelInfo = async () => {
        const url = 'https://www.googleapis.com/youtube/v3/channels?id=' + channelId + '&key=' + apiKey + '&part=snippet,brandingSettings,contentDetails';
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                throw new Error('Channel information not found.');
            }
            
            const channelName = data.items[0].snippet.title;
            const profilePicUrl = data.items[0].snippet.thumbnails.high.url;
            const bannerUrl = data.items[0].brandingSettings.image.bannerImageUrl;
            const descriptionText = 'Qui puoi trovare tutti i miei video e richiedere le tue basi personalizzate!';

            updateChannelInfo(channelName, profilePicUrl, bannerUrl, descriptionText);
            
            return data.items[0].contentDetails.relatedPlaylists.uploads;
        } catch (error) {
            console.error("Errore nel recupero delle informazioni del canale:", error);
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                 errorMessage.textContent = "Errore: La chiave API potrebbe non essere valida o avere restrizioni. Controlla le impostazioni nella Google Developers Console.";
                 errorMessage.style.display = 'block';
            }
            throw error;
        }
    };
    
    // Function to fetch playlists
    const fetchPlaylists = async () => {
        const url = 'https://www.googleapis.com/youtube/v3/playlists?channelId=' + channelId + '&key=' + apiKey + '&part=snippet,contentDetails&maxResults=50';
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            const data = await response.json();
            
            const popularPlaylists = data.items
                .sort((a, b) => (b.contentDetails?.itemCount || 0) - (a.contentDetails?.itemCount || 0))
                .slice(0, 5);

            if (genreFiltersContainer) {
                genreFiltersContainer.innerHTML = '<button class="filter-button active" data-playlist-id="uploads">Tutti</button>';
                popularPlaylists.forEach(playlist => {
                    const playlistName = playlist.snippet.title;
                    const playlistId = playlist.id;
                    const button = document.createElement('button');
                    button.className = 'filter-button';
                    button.textContent = playlistName;
                    button.dataset.playlistId = playlistId;
                    genreFiltersContainer.appendChild(button);
                });
            }
        } catch (error) {
            console.error("Errore nel recupero delle playlist:", error);
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                 errorMessage.textContent = "Errore: La chiave API potrebbe non essere valida o avere restrizioni. Controlla le impostazioni nella Google Developers Console.";
                 errorMessage.style.display = 'block';
            }
            throw error;
        }
    };

    // Function to fetch videos by playlist
    const fetchVideosByPlaylist = async (playlistId) => {
         if (videoGallery) {
             videoGallery.innerHTML = `
                <div class="shimmer-bg p-4 rounded-xl shadow-lg h-64"></div>
                <div class="shimmer-bg p-4 rounded-xl shadow-lg h-64 hidden sm-block"></div>
                <div class="shimmer-bg p-4 rounded-xl shadow-lg h-64 hidden lg-block"></div>
            `;
         }
        
        const maxResults = 50; 
        const uploadsUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?playlistId=' + playlistId + '&key=' + apiKey + '&part=snippet&maxResults=' + maxResults;
        
        try {
            const videosResponse = await fetch(uploadsUrl);
            if (!videosResponse.ok) {
                throw new Error('HTTP error! status: ' + videosResponse.status);
            }
            const videosData = await videosResponse.json();

            if (!videosData.items || videosData.items.length === 0) {
                if (videoGallery) {
                     videoGallery.innerHTML = '<p class="text-center text-slate-400 col-span-full">Nessun video trovato per questa playlist.</p>';
                }
                allVideos = [];
                return;
            }

            allVideos = videosData.items;
            const firstVideoId = allVideos[0].snippet.resourceId.videoId;
            loadMainVideo(firstVideoId);
            renderVideos(allVideos);
        } catch (error) {
            console.error("Errore nel recupero dei video della playlist:", error);
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                if (error.message.includes('400')) {
                    errorMessage.textContent = 'Errore: la chiave API non è valida o la playlist non è accessibile. Controlla le tue credenziali e le restrizioni.';
                    errorMessage.style.display = 'block';
                } else {
                    errorMessage.textContent = 'Si è verificato un errore generico. Riprova più tardi.';
                    errorMessage.style.display = 'block';
                }
            }
            throw error;
        }
    };
    
    // Function to render videos in the gallery
    const renderVideos = (videosToRender) => {
        if (!videoGallery) return;
        videoGallery.innerHTML = '';
        if (videosToRender.length === 0) {
            videoGallery.innerHTML = '<p class="text-center text-slate-400 col-span-full">Nessun video trovato.</p>';
        } else {
            videosToRender.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const title = item.snippet.title;
                const thumbnailUrl = item.snippet.thumbnails?.medium?.url || 'https://placehold.co/320x180/2b3a4a/fff?text=N/A';

                const videoCard = 
                    '<div class="bg-slate-800 p-4 rounded-xl shadow-lg transform hover-scale-105 transition-transform duration-300 cursor-pointer video-card" data-video-id="' + videoId + '">' +
                        '<img src="' + thumbnailUrl + '" alt="' + title + '" class="rounded-lg mb-4 w-full">' +
                        '<h3 class="text-xl font-semibold text-slate-100">' + title + '</h3>' +
                    '</div>';
                videoGallery.innerHTML += videoCard;
            });
            
            document.querySelectorAll('.video-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const videoId = e.currentTarget.dataset.videoId;
                    loadMainVideo(videoId);
                });
            });
        }
    };

    // Function to sort videos
    const sortVideos = () => {
        const sortBy = document.getElementById('sort-by')?.value;
        if (!sortBy || !allVideos.length) return;

        let sortedVideos = [...allVideos]; // crea una copia dell'array

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
        
        if(sortedVideos.length > 0) {
            loadMainVideo(sortedVideos[0].snippet.resourceId.videoId);
        }
    };

    // Function to filter videos
    const filterVideos = async (playlistId) => {
        const buttons = document.querySelectorAll('.filter-button');
        buttons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.playlistId === playlistId) {
                button.classList.add('active');
            }
        });

        if (playlistId === 'uploads') {
            await fetchVideosByPlaylist(uploadsPlaylistId);
        } else {
            await fetchVideosByPlaylist(playlistId);
        }
        
        sortVideos();
    };

    // Function to load the main video
    const loadMainVideo = (videoId) => {
        if (document.getElementById('player-placeholder')) document.getElementById('player-placeholder').style.display = 'none';
        const mainVideoPlayer = document.getElementById('main-video-player');
        if (mainVideoPlayer) {
            mainVideoPlayer.style.display = 'block';
            mainVideoPlayer.innerHTML = 
                '<iframe src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        }
    };
    
    // Function to check cookie consent
    const checkCookieConsent = () => {
        const cookieBanner = document.getElementById('cookie-banner');
        if (cookieBanner && localStorage.getItem('cookieAccepted') !== 'true') {
            cookieBanner.style.display = 'flex';
        }
    };

    // Main initialization function
    const fetchVideosAndPlaylistInfo = async () => {
        try {
            uploadsPlaylistId = await fetchChannelInfo();
            if (uploadsPlaylistId) {
                await fetchPlaylists();
                await fetchVideosByPlaylist(uploadsPlaylistId);
                
                const genreFiltersContainer = document.getElementById('genre-filters');
                if (genreFiltersContainer) {
                    genreFiltersContainer.addEventListener('click', (e) => {
                        if (e.target.classList.contains('filter-button')) {
                            filterVideos(e.target.dataset.playlistId);
                        }
                    });
                }

                const sortBySelect = document.getElementById('sort-by');
                if (sortBySelect) {
                    sortBySelect.addEventListener('change', sortVideos);
                }
            }
        } catch (error) {
            console.error("Errore nell'inizializzazione dell'app:", error);
        }

        checkCookieConsent();

        const acceptCookiesButton = document.getElementById('accept-cookies');
        const cookieBanner = document.getElementById('cookie-banner');
        if(acceptCookiesButton) {
          acceptCookiesButton.addEventListener('click', () => {
            localStorage.setItem('cookieAccepted', 'true');
            if (cookieBanner) cookieBanner.style.display = 'none';
          });
        }
    };

    // Inizializzazione del contenuto quando il DOM è pronto
    const init = async () => {
        const allPageSections = document.querySelectorAll('.page-section');
        allPageSections.forEach(section => {
            section.style.display = 'none';
        });
        const homeSection = document.getElementById('home');
        if (homeSection) homeSection.style.display = 'block';

        fetchVideosAndPlaylistInfo();
    }
    
    init();

});

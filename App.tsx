
import React, { useState, useEffect, useMemo } from 'react';
import { Video, ChannelInfo, SortOrder } from './types';
import { fetchChannelVideos, fetchChannelInfo, YouTubeApiError } from './services/youtubeService';
import { enrichVideosWithAI, generateArticles, GeneratedArticle } from './services/aiService';
import VideoCard from './components/VideoCard';
import VideoModal from './components/VideoModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

type ActivePage = 'home' | 'articles' | 'contact' | 'privacy' | 'terms';
const ITEMS_PER_PAGE = 24;

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [videos, setVideos] = useState<Video[]>([]);
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [articles, setArticles] = useState<GeneratedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti i Generi');
  const [selectedDecade, setSelectedDecade] = useState('Tutti i Decenni');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);

  const init = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const videosData = await fetchChannelVideos();
      setVideos(videosData);
      setIsLoading(false);

      const channelData = await fetchChannelInfo();
      setChannel(channelData);

      if (videosData.length > 0) {
        setIsAiProcessing(true);
        try {
          const enriched = await enrichVideosWithAI(videosData);
          setVideos(enriched);
        } catch (aiErr) {
          console.warn("Arricchimento intelligente limitato dalla quota", aiErr);
        } finally {
          setIsAiProcessing(false);
        }
      }
    } catch (err) {
      setError(err instanceof YouTubeApiError ? err.message : "Errore connessione YouTube.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (activePage === 'articles' && articles.length === 0) {
      const loadArticles = async () => {
        setIsLoadingArticles(true);
        try {
          const data = await generateArticles();
          setArticles(data);
        } catch (err) {
          console.error("Errore nel caricamento del magazine:", err);
        } finally {
          setIsLoadingArticles(false);
        }
      };
      loadArticles();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, articles.length]);

  const genres = useMemo(() => {
    const set = new Set<string>(['Tutti i Generi']);
    videos.forEach(v => { if (v.aiCategory) set.add(v.aiCategory); });
    return Array.from(set);
  }, [videos]);

  const decades = ["Tutti i Decenni", "Anni 60", "Anni 70", "Anni 80", "Anni 90", "2000+", "Recenti"];

  const filteredVideos = useMemo(() => {
    let result = [...videos].filter(v => {
      const text = `${v.title} ${v.artist || ''} ${v.description}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesGenre = selectedCategory === 'Tutti i Generi' || v.aiCategory === selectedCategory;
      
      let matchesDecade = true;
      if (selectedDecade !== "Tutti i Decenni") {
        const d = selectedDecade.toLowerCase();
        if (d === "recenti") matchesDecade = new Date(v.publishedAt).getFullYear() >= 2023;
        else matchesDecade = text.includes(d.replace("anni ", ""));
      }

      return matchesSearch && matchesGenre && matchesDecade;
    });

    result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (sortOrder === 'oldest') return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      if (sortOrder === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });
    return result;
  }, [videos, searchTerm, selectedCategory, selectedDecade, sortOrder]);

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVideos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVideos, currentPage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#05070a] text-slate-200 selection:bg-red-600/30">
      <div className="atmosphere"></div>
      
      {/* HEADER & NAVBAR */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActivePage('home')}>
          {channel?.thumbnail ? (
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src={channel.thumbnail} alt="Logo" className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-red-600/50 shadow-lg" />
            </div>
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold italic shadow-lg shadow-red-600/20">K</div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{channel?.title || 'Karaoke Italiano'}</h1>
            <p className="text-[8px] font-bold text-red-500 uppercase tracking-[0.3em] mt-1">Database Ufficiale</p>
          </div>
        </div>
        <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <button onClick={() => setActivePage('home')} className={`transition-all ${activePage === 'home' ? 'text-white scale-110' : 'hover:text-red-500'}`}>Archivio</button>
          <button onClick={() => setActivePage('articles')} className={`transition-all ${activePage === 'articles' ? 'text-white scale-110' : 'hover:text-red-500'}`}>Magazine</button>
          <button onClick={() => setActivePage('contact')} className={`transition-all ${activePage === 'contact' ? 'text-white scale-110' : 'hover:text-red-500'}`}>Richiedi</button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 py-12">
        {activePage === 'home' && (
          <div className="space-y-20 animate-fade">
            {/* HERO SECTION - EDITORIAL STYLE */}
            <section className="relative glass rounded-[4rem] p-12 md:p-24 text-center space-y-10 border-white/5 overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=2070" 
                  alt="Music Studio" 
                  className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05070a]/60 to-[#05070a]"></div>
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-black uppercase tracking-[0.4em] text-red-500 animate-pulse">
                    Live Database
                  </span>
                  <h2 className="text-5xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
                    Il tuo palco <br/><span className="text-red-600 text-glow">personale</span>
                  </h2>
                </div>
                
                <p className="text-slate-400 max-w-2xl mx-auto font-medium text-sm md:text-xl leading-relaxed">
                  Migliaia di basi karaoke professionali HD pronte per essere cantate. <br/>
                  <span className="text-slate-500 italic">Trova il brano perfetto per la tua voce.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto pt-8">
                  <div className="relative flex-grow w-full group/search">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-3xl blur opacity-10 group-focus-within/search:opacity-30 transition-opacity"></div>
                    <input 
                      type="text" 
                      placeholder="Cerca Titolo, Artista o Genere..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="relative w-full bg-slate-900/80 border border-white/10 rounded-2xl px-16 py-6 text-sm md:text-base focus:ring-2 focus:ring-red-600/50 outline-none transition-all backdrop-blur-2xl text-white placeholder:text-slate-600"
                    />
                    <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="relative w-full sm:w-auto bg-slate-900/80 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300 px-10 py-6 rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors backdrop-blur-2xl outline-none"
                  >
                    <option value="newest">Più recenti</option>
                    <option value="alphabetical">A-Z</option>
                    <option value="oldest">Meno recenti</option>
                  </select>
                </div>
              </div>
            </section>

            {/* FILTRI - MINIMALIST STYLE */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Esplora Generi</span>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
              </div>
              <div className="flex flex-wrap gap-3">
                {genres.map(g => (
                  <button 
                    key={g} 
                    onClick={() => setSelectedCategory(g)} 
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                      selectedCategory === g 
                        ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/20 -translate-y-1' 
                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* GRIGLIA VIDEO */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Database: {filteredVideos.length} risultati</span>
                {isAiProcessing && <span className="text-[9px] font-black uppercase text-red-500 animate-pulse flex items-center gap-2">Analisi intelligente attiva...</span>}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="glass h-80 rounded-[2rem] animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedVideos.map(v => <VideoCard key={v.id} video={v} onClick={setSelectedVideo} />)}
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-10">
                  <button disabled={currentPage === 1} onClick={() => {setCurrentPage(currentPage-1); window.scrollTo({top: 600, behavior:'smooth'})}} className="px-5 py-3 glass rounded-xl text-[10px] font-black uppercase disabled:opacity-20">Indietro</button>
                  <span className="text-xs font-bold text-slate-500 px-4">Pagina {currentPage} di {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => {setCurrentPage(currentPage+1); window.scrollTo({top: 600, behavior:'smooth'})}} className="px-5 py-3 glass rounded-xl text-[10px] font-black uppercase disabled:opacity-20">Avanti</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activePage === 'articles' && (
          <section className="max-w-4xl mx-auto space-y-12 animate-fade">
            <h2 className="text-5xl font-black italic text-center uppercase tracking-tighter text-white">Karaoke <span className="text-red-600">Magazine</span></h2>
            {isLoadingArticles ? (
              <div className="space-y-8">
                {[1, 2].map(i => <div key={i} className="glass h-64 rounded-[2rem] animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-12">
                {articles.map((art, i) => (
                  <article key={i} className="glass rounded-[3rem] p-10 md:p-16 space-y-8 hover:border-red-600/30 transition-all border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                    <h3 className="text-3xl md:text-4xl font-black italic text-white leading-tight">{art.title}</h3>
                    <div className="text-slate-400 text-lg leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: art.content }}></div>
                    <div className="pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span className="text-red-600">Rubrica Tecnica KI</span>
                      <span>Lettura: 3 min</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activePage === 'contact' && (
          <section className="max-w-2xl mx-auto space-y-12 animate-fade">
             <div className="text-center space-y-4">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Richiedi un <span className="text-red-600">Brano</span></h2>
                <p className="text-slate-400">Inserisci i dettagli del brano che vorresti cantare. Lo aggiungeremo il prima possibile!</p>
             </div>
             <form action="https://formspree.io/f/mwpqapvp" method="POST" className="glass p-10 rounded-[3rem] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome</label>
                    <input name="Nome" placeholder="Il tuo nome" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-red-600/50" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                    <input name="Email" type="email" placeholder="la-tua@email.com" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-red-600/50" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Cosa vuoi cantare?</label>
                  <textarea name="Messaggio" rows={4} placeholder="Esempio: Vasco Rossi - Albachiara (Versione Live)" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm resize-none outline-none focus:border-red-600/50" required />
                </div>
                <button type="submit" className="w-full py-5 bg-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 shadow-2xl shadow-red-600/20 transition-all transform hover:-translate-y-1">Invia la richiesta ora</button>
             </form>
          </section>
        )}

        {activePage === 'privacy' && <PrivacyPolicy />}

        {activePage === 'terms' && <TermsOfService />}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/5 bg-black/80 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-red-600 font-black text-2xl italic tracking-tighter">KI</span>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Karaoke Italiano</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-loose">
              Il database ufficiale per le tue serate musicali. <br/>Creato per chi ama cantare.
            </p>
          </div>
          
          <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex flex-col gap-4 items-center md:items-start">
              <span className="text-slate-600">Navigazione</span>
              <button onClick={() => setActivePage('home')} className="hover:text-red-500">Archivio</button>
              <button onClick={() => setActivePage('articles')} className="hover:text-red-500">Magazine</button>
              <button onClick={() => setActivePage('contact')} className="hover:text-red-500">Richiedi</button>
            </div>
            <div className="flex flex-col gap-4 items-center md:items-start">
              <span className="text-slate-600">Legale</span>
              <button onClick={() => setActivePage('privacy')} className="hover:text-red-500">Privacy Policy</button>
              <button onClick={() => setActivePage('terms')} className="hover:text-red-500">Termini</button>
            </div>
          </div>

          <div className="text-center md:text-right space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Copyright</span>
            <p className="text-[10px] font-bold text-slate-500">© 2025 Portale Ufficiale Karaoke Italiano. <br/>Tutti i diritti riservati ai rispettivi autori.</p>
          </div>
        </div>
      </footer>

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default App;

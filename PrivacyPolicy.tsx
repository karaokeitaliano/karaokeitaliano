
import React, { useState, useRef } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { Video } from '../types';

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const [playbackRate, setPlaybackRate] = useState(1);
  const playerRef = useRef<YouTubePlayer | null>(null);

  if (!video) return null;

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
  };

  const changeSpeed = (delta: number) => {
    if (!playerRef.current) return;
    const newRate = Math.max(0.25, Math.min(2, playbackRate + delta));
    const roundedRate = Math.round(newRate * 100) / 100;
    setPlaybackRate(roundedRate);
    playerRef.current.setPlaybackRate(roundedRate);
  };

  const resetSpeed = () => {
    if (!playerRef.current) return;
    setPlaybackRate(1);
    playerRef.current.setPlaybackRate(1);
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl transition-all">
      <div className="atmosphere"></div>
      <div className="glass w-full max-w-6xl max-h-[95vh] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-500 border-white/10 relative">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter truncate max-w-md md:max-w-3xl text-white">{video.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white group"
          >
            <svg className="group-hover:rotate-90 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="overflow-y-auto p-0 space-y-0 max-h-[calc(95vh-88px)] custom-scrollbar">
          {/* YouTube Player */}
          <div className="aspect-video w-full bg-black shadow-2xl relative group/player">
            <YouTube 
              videoId={video.id} 
              opts={opts} 
              onReady={onPlayerReady}
              className="w-full h-full"
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 pointer-events-none border-b-4 border-red-600/20"></div>
          </div>

          <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* CONTROLLI PRO */}
              <section className="glass p-8 rounded-[3rem] border-red-600/20 bg-gradient-to-br from-red-600/10 via-transparent to-transparent relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                  <svg width="200" height="200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-600/30">
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Controlli Performance</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Ottimizza la base per la tua voce</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-start gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block ml-1">Velocità Riproduzione</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => changeSpeed(-0.05)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-600/50 transition-all text-white text-xl font-black"
                      >
                        -
                      </button>
                      <div className="px-8 py-3 bg-slate-900/80 border border-white/10 rounded-2xl min-w-[100px] text-center shadow-inner">
                        <span className="text-lg font-black text-red-500 tracking-tighter">{playbackRate.toFixed(2)}x</span>
                      </div>
                      <button 
                        onClick={() => changeSpeed(0.05)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-600/50 transition-all text-white text-xl font-black"
                      >
                        +
                      </button>
                      <button 
                        onClick={resetSpeed}
                        className="ml-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[300px] p-8 rounded-[2.5rem] bg-slate-900/60 border border-blue-500/20 space-y-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <svg width="80" height="80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Karaoke Pro Tip</h4>
                      </div>
                      <h3 className="text-base font-black text-white mb-2 uppercase italic tracking-tighter">Cambio Tonalità (Pitch)</h3>
                      <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                        Sblocca la funzione avanzata per cambiare tonalità installando questa estensione professionale.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-xl bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400 border border-blue-500/30">1</div>
                        <p className="text-[11px] text-slate-300 font-bold">Scarica l'estensione dal link qui sotto.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-xl bg-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400 border border-blue-500/30">2</div>
                        <p className="text-[11px] text-slate-300 font-bold">Usa il pannello dedicato per regolare il <strong>Pitch</strong>.</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <a 
                        href="https://chromewebstore.google.com/detail/pitch-shift-transpose-key/mnpdjalbnlhffmobepnoiphgjkiplbpf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 px-6 py-4 bg-blue-600 hover:bg-blue-700 border border-blue-400/30 rounded-2xl transition-all shadow-xl shadow-blue-600/30 group/btn"
                      >
                        <div className="flex items-center gap-4">
                          <svg className="text-white group-hover/btn:rotate-12 transition-transform" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Installa Pitch Shift</span>
                        </div>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24" className="opacity-50 group-hover/btn:opacity-100 transition-opacity"><path d="M9 18l6-6-6-6"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-px flex-1 bg-slate-800"></span>
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Descrizione Video</h3>
                  <span className="h-px flex-1 bg-slate-800"></span>
                </div>
                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm selection:bg-red-500/30">
                  {video.description || "Nessuna descrizione disponibile per questo video."}
                </p>
              </section>
              
              {video.aiSummary && (
                <section className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full text-white">
                    Sintesi AI
                  </div>
                  <p className="text-blue-100 italic leading-relaxed">
                    "{video.aiSummary}"
                  </p>
                </section>
              )}
            </div>
            
            <div className="space-y-8">
              <div className="glass p-6 rounded-2xl border-slate-800 space-y-6">
                <section>
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Metadati</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Pubblicato</span>
                      <span className="text-xs text-slate-200 font-mono">
                        {new Date(video.publishedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Categoria AI</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase border border-blue-500/30">
                        {video.aiCategory || 'Generale'}
                      </span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Azioni</h3>
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 group"
                  >
                    <svg className="group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                    APRI SU YOUTUBE
                  </a>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;

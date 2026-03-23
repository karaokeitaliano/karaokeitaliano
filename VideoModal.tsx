
import React from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div 
      onClick={() => onClick(video)}
      className="glass-card group rounded-[2.5rem] overflow-hidden cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-90"></div>
        
        {video.aiCategory && (
          <div className="absolute top-5 left-5">
            <span className="bg-red-600/90 text-[8px] uppercase tracking-[0.3em] font-black px-4 py-2 rounded-xl text-white shadow-2xl backdrop-blur-md border border-white/10">
              {video.aiCategory}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-red-600/10 backdrop-blur-[2px]">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(220,38,38,0.5)] transform scale-50 group-hover:scale-100 transition-all duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse"></span>
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {video.artist || 'Karaoke Italiano'}
            </h4>
          </div>
          <h3 className="text-xl font-black line-clamp-2 text-white group-hover:text-red-500 transition-colors leading-tight italic tracking-tighter uppercase">
            {video.title}
          </h3>
        </div>
        
        <p className="text-[11px] text-slate-400 line-clamp-2 font-medium leading-relaxed flex-grow italic opacity-70">
          {video.aiSummary || "Base musicale professionale in alta definizione. Canta ora con Karaoke Italiano!"}
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
              <svg className="text-red-600" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {new Date(video.publishedAt).toLocaleDateString('it-IT')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-green-500"></span>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">HD Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;


export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  tags?: string[];
  aiSummary?: string;
  aiCategory?: string; // Usato come Genere Musicale
  artist?: string;     // Estratto dall'IA
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  customUrl?: string;
}

export type SortOrder = 'newest' | 'oldest' | 'alphabetical';

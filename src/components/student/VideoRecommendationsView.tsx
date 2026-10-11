/**
 * Video Recommendations & YouTube Academic Library
 */

import React, { useState } from 'react';
import { User, LearningResource } from '../../types';
import { storageService } from '../../services/storageService';
import { RewardService } from '../../services/rewardService';
import confetti from 'canvas-confetti';
import {
  Lightbulb,
  Play,
  Search,
  ExternalLink,
  Clock,
  BookOpen,
  X,
  Sparkles,
  CheckCircle2,
  Check,
  Video,
  Award,
} from 'lucide-react';

interface VideoRecommendationsViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const VideoRecommendationsView: React.FC<VideoRecommendationsViewProps> = ({
  user,
  onNavigate,
}) => {
  const studentId = user.studentId || '101';
  const resources = storageService.getResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalVideo, setActiveModalVideo] = useState<LearningResource | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`watched_videos_${studentId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const categories = ['All', 'Computer Science', 'Mathematics', 'AI & Data Science'];

  const CURATED_THUMBNAILS: Record<string, string> = {
    res_quad_01: 'https://img.youtube.com/vi/IHZwWFHWa-w/hqdefault.jpg',
    res_quad_02: 'https://img.youtube.com/vi/6DYDCl-8vs0/hqdefault.jpg',
    res_bst_01: 'https://img.youtube.com/vi/gcULXE7ViZw/hqdefault.jpg',
    res_graph_01: 'https://img.youtube.com/vi/oDqjPvD54Ss/hqdefault.jpg',
    res_dp_01: 'https://img.youtube.com/vi/oBt53YbR9Kk/hqdefault.jpg',
    res_la_01: 'https://img.youtube.com/vi/Ip3X9LOh2dk/hqdefault.jpg',
    res_calc_01: 'https://img.youtube.com/vi/YG15m2VwSjA/hqdefault.jpg',
    res_ood_01: 'https://img.youtube.com/vi/pTB0EiLXUC8/hqdefault.jpg',
    res_rec_01: 'https://img.youtube.com/vi/mBNrRy2_hVs/hqdefault.jpg',
    res_ml_01: 'https://img.youtube.com/vi/Gv9_4yMHFhI/hqdefault.jpg',
    res_hash_01: 'https://img.youtube.com/vi/shs0KM3wKv8/hqdefault.jpg',
    res_nn_01: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
    res_metrics_01: 'https://img.youtube.com/vi/4jRBRDbJemM/hqdefault.jpg',
    res_sort_01: 'https://img.youtube.com/vi/SLauY6PpjW4/hqdefault.jpg',
  };

  const getEffectiveVideoId = (video: LearningResource): string => {
    if (video.id === 'res_quad_02' && (!video.youtubeVideoId || video.youtubeVideoId === '7K1sB05pE0A')) {
      return '6DYDCl-8vs0';
    }
    return video.youtubeVideoId || '6DYDCl-8vs0';
  };

  const getVideoThumbnail = (video: LearningResource): string => {
    if (video.id === 'res_quad_02') {
      return 'https://img.youtube.com/vi/6DYDCl-8vs0/hqdefault.jpg';
    }
    if (CURATED_THUMBNAILS[video.id]) return CURATED_THUMBNAILS[video.id];
    if (video.thumbnailUrl) return video.thumbnailUrl;
    const yId = getEffectiveVideoId(video);
    if (yId && yId !== '7K1sB05pE0A') {
      return `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80';
  };

  const handleToggleWatched = (video: LearningResource, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasWatched = !!watchedVideos[video.id];
    const nextState = { ...watchedVideos, [video.id]: !wasWatched };
    setWatchedVideos(nextState);
    try {
      localStorage.setItem(`watched_videos_${studentId}`, JSON.stringify(nextState));
    } catch (err) {
      // ignore
    }

    if (!wasWatched) {
      RewardService.awardCredits(studentId, 15, `Watched Tutorial: ${video.title}`);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    }
  };

  const filteredVideos = resources.filter(r => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.conceptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.channelName && r.channelName.toLowerCase().includes(searchTerm.toLowerCase()));

    const isMath =
      r.conceptName.includes('Calculus') ||
      r.conceptName.includes('Algebra') ||
      r.conceptName.includes('Quadratic') ||
      r.conceptName.includes('Discrete') ||
      r.conceptName.includes('Probability');

    const isAI =
      r.conceptName.includes('Supervised') ||
      r.conceptName.includes('Neural') ||
      r.conceptName.includes('Machine') ||
      r.conceptName.includes('Evaluation') ||
      r.conceptName.includes('PCA') ||
      r.conceptName.includes('NLP');

    const isCS =
      !isMath && !isAI;

    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Mathematics') return matchesSearch && isMath;
    if (selectedCategory === 'AI & Data Science') return matchesSearch && isAI;
    if (selectedCategory === 'Computer Science') return matchesSearch && isCS;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-indigo-400" />
            <span>Curated Academic Video Lessons</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            High-yield visual tutorials from verified channels (3Blue1Brown, Abdul Bari, MIT OCW, StatQuest, freeCodeCamp) mapped directly to your curriculum.
          </p>
        </div>
        <button
          onClick={() => onNavigate('weak_topics')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
        >
          <Sparkles className="h-4 w-4" />
          <span>View My Weak Topic Priorities</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tutorials, channels or topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map(video => {
          const isWatched = !!watchedVideos[video.id];

          return (
            <div
              key={video.id}
              className={`group flex flex-col justify-between rounded-2xl border bg-slate-900/70 overflow-hidden transition space-y-3 shadow-lg ${
                isWatched
                  ? 'border-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => setActiveModalVideo(video)}
                className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center cursor-pointer"
              >
                <img
                  src={getVideoThumbnail(video)}
                  alt={video.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const yId = getEffectiveVideoId(video);
                    if (yId && !target.src.includes('mqdefault.jpg') && target.src.includes('hqdefault.jpg')) {
                      target.src = `https://img.youtube.com/vi/${yId}/mqdefault.jpg`;
                    } else {
                      target.onerror = null;
                      target.src = CURATED_THUMBNAILS[video.id] || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80';
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl shadow-rose-600/50 hover:scale-110 transition">
                    <Play className="h-6 w-6 fill-white ml-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-white">
                  {video.durationMinutes}m
                </span>

                {isWatched && (
                  <span className="absolute top-2 left-2 rounded-full bg-emerald-500/90 text-slate-950 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow">
                    <Check className="h-3 w-3" /> Watched (+15 cr)
                  </span>
                )}
              </div>

              <div className="p-4 pt-0 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
                      {video.channelName || 'Academic Resource'}
                    </span>
                    <span className="text-slate-400 font-medium">{video.conceptName}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {video.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveModalVideo(video)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-indigo-400" />
                    <span>Watch in App</span>
                  </button>

                  <button
                    onClick={e => handleToggleWatched(video, e)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                      isWatched
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isWatched ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Award className="h-3 w-3 text-amber-400" />
                        <span>Mark Watched (+15 cr)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Modal Player */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">{activeModalVideo.title}</h3>
                <p className="text-xs text-slate-400">{activeModalVideo.channelName} · {activeModalVideo.conceptName}</p>
              </div>
              <button
                onClick={() => setActiveModalVideo(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Embedded Iframe */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${getEffectiveVideoId(activeModalVideo)}?autoplay=1`}
                title={activeModalVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Duration: ~{activeModalVideo.durationMinutes} mins</span>
              <a
                href={activeModalVideo.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>Watch directly on YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

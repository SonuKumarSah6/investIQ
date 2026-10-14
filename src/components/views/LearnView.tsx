import React, { useState } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Lesson } from '../../types';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle,
} from 'lucide-react';

interface LearnViewProps {
  onOpenLesson: (lesson: Lesson) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onOpenLesson }) => {
  const { lessons, completedLessons, quizScores } = useInvest();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Market Basics',
    'Fundamentals',
    'Vehicles & Instruments',
    'Risk & Strategy',
    'Mindset',
  ];

  const filteredLessons = lessons.filter((l) => {
    if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const completionPercent = Math.round((completedLessons.length / lessons.length) * 100);

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            InvestIQ Learning Academy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bite-sized modules tailored for Indian beginner investors with interactive quizzes
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-xs self-start sm:self-auto">
          <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>INDIAN FINANCIAL LITERACY SYLLABUS</span>
        </div>
      </div>

      {/* Progress Overview Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Curriculum Progress
            </span>
            <span className="text-xs text-slate-400 font-mono">
              · {completedLessons.length} of {lessons.length} Modules Completed
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {completionPercent === 100
              ? 'Outstanding! You have completed the curriculum.'
              : `${completionPercent}% Mastered — Keep expanding your knowledge!`}
          </h3>
          <div className="w-full sm:w-80 h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 self-stretch sm:self-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Total Quiz Questions</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {lessons.reduce((acc, l) => acc + l.quiz.length, 0)} Questions
            </div>
          </div>
          <div className="w-px h-10 bg-slate-800 hidden sm:block" />
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Knowledge Badges</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {completedLessons.length >= 5 ? 'Scholar Tier' : 'Novice Tier'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson, idx) => {
          const isDone = completedLessons.includes(lesson.id);
          const score = quizScores[lesson.id];

          return (
            <div
              key={lesson.id}
              className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all cursor-pointer group"
              onClick={() => onOpenLesson(lesson)}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      Module {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-[11px] font-semibold text-cyan-400">
                      {lesson.category}
                    </span>
                  </div>

                  {isDone ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {score !== undefined ? `${score}%` : 'Done'}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.readTime}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {lesson.subtitle}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  {lesson.quiz.length} Questions
                </span>
                <span className="font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  <span>{isDone ? 'Review Lesson' : 'Start Lesson'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Notice */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          InvestIQ educational content is intended solely for general financial literacy and academic practice. It does not constitute investment advice, stock recommendations, or financial advisory services.
        </p>
      </div>
    </div>
  );
};

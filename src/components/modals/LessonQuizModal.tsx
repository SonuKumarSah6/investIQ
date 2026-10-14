import React, { useState } from 'react';
import { Lesson } from '../../types';
import { useInvest } from '../../context/InvestContext';
import { X, CheckCircle, AlertTriangle, Lightbulb, BookOpen, Award, ArrowRight } from 'lucide-react';

interface LessonQuizModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LessonQuizModal: React.FC<LessonQuizModalProps> = ({
  lesson,
  isOpen,
  onClose,
}) => {
  const { completeLessonQuiz, completedLessons } = useInvest();
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  if (!isOpen || !lesson) return null;

  const isCompleted = completedLessons.includes(lesson.id);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleGradeQuiz = () => {
    setIsQuizSubmitted(true);
    let correctCount = 0;
    lesson.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const percent = Math.round((correctCount / lesson.quiz.length) * 100);
    completeLessonQuiz(lesson.id, percent);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-semibold">{lesson.category}</span>
                <span className="text-xs text-slate-500">· {lesson.readTime} read</span>
                {isCompleted && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">{lesson.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-6 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'content'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lesson Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Practice Quiz ({lesson.quiz.length} Questions)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
          {activeTab === 'content' ? (
            <div className="flex flex-col gap-5">
              {/* Key Takeaways Box */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Core Takeaways
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {lesson.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">·</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sections */}
              {lesson.sections.map((sec, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-white">{sec.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{sec.content}</p>
                  {sec.tip && (
                    <div className="mt-1 flex items-start gap-2 p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-cyan-200 text-xs">
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{sec.tip}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Ready for quiz button */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Ready to test your understanding?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors flex items-center gap-1.5"
                >
                  Start Quiz <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="text-xs text-slate-400">
                Answer each question below. Correct answers earn knowledge credits and help unlock achievements.
              </div>

              {lesson.quiz.map((q, qIndex) => {
                const userChoice = selectedAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-2 text-xs font-semibold text-white">
                      <span className="text-slate-400 font-mono">Q{qIndex + 1}.</span>
                      <span>{q.question}</span>
                    </div>

                    <div className="space-y-2 mt-1">
                      {q.options.map((opt, optIndex) => {
                        let btnStyle = 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-800';

                        if (isQuizSubmitted) {
                          if (optIndex === q.correctIndex) {
                            btnStyle = 'bg-emerald-950/60 border-emerald-600 text-emerald-200';
                          } else if (userChoice === optIndex) {
                            btnStyle = 'bg-rose-950/60 border-rose-600 text-rose-200';
                          }
                        } else if (userChoice === optIndex) {
                          btnStyle = 'bg-slate-700/80 border-slate-500 text-white shadow-sm';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            className={`w-full text-left p-3 text-xs rounded-xl border transition-colors flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isQuizSubmitted && optIndex === q.correctIndex && (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {isQuizSubmitted && userChoice === optIndex && optIndex !== q.correctIndex && (
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isQuizSubmitted && (
                      <div
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-950/30 border border-emerald-800/40 text-emerald-300'
                            : 'bg-rose-950/30 border border-rose-800/40 text-rose-300'
                        }`}
                      >
                        <div className="font-semibold mb-0.5">
                          {isCorrect ? 'Correct!' : 'Incorrect explanation:'}
                        </div>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit or Retry action */}
              <div className="pt-2 flex items-center justify-between">
                {isQuizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Retake Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={Object.keys(selectedAnswers).length < lesson.quiz.length}
                    onClick={handleGradeQuiz}
                    className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    Submit & Grade Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

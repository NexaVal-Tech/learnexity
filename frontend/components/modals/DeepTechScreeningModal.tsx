'use client';

import { useState } from 'react';
import { X, ArrowRight, Laptop, Code2, Wifi, MessageCircle } from 'lucide-react';

const BRAND = '#4A3AFF';
const WHATSAPP_NUMBER = '12762528415';
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm applying for a deep-tech course and I'd like to chat with your team before enrolling."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export interface DeepTechScreeningAnswers {
  has_laptop: boolean;
  has_programming_knowledge: boolean;
  reliable_internet: boolean;
}

interface Props {
  courseTitle: string;
  submitting?: boolean;
  onContinue: (answers: DeepTechScreeningAnswers) => void;
  onCancel: () => void;
}

type Answer = boolean | null;

const QUESTIONS: Array<{
  key: keyof DeepTechScreeningAnswers;
  icon: typeof Laptop;
  label: string;
  sub: string;
}> = [
  {
    key: 'has_laptop',
    icon: Laptop,
    label: 'Do you have your own laptop?',
    sub: "You'll need a personal laptop to code along in live sessions and complete sprints.",
  },
  {
    key: 'has_programming_knowledge',
    icon: Code2,
    label: 'Do you have foundational programming knowledge?',
    sub: 'Basic familiarity with any programming language or logic (even self-taught) is fine.',
  },
  {
    key: 'reliable_internet',
    icon: Wifi,
    label: 'Do you have reliable internet access?',
    sub: 'Deep-tech tracks include live mentorship sessions, so a stable connection matters.',
  },
];

export function DeepTechScreeningModal({ courseTitle, submitting, onContinue, onCancel }: Props) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [stage, setStage] = useState<'questions' | 'soft-gate'>('questions');

  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== null && answers[q.key] !== undefined);

  const handleAnswer = (key: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const buildAnswers = (): DeepTechScreeningAnswers => ({
    has_laptop: !!answers.has_laptop,
    has_programming_knowledge: !!answers.has_programming_knowledge,
    reliable_internet: !!answers.reliable_internet,
  });

  const handleSubmit = () => {
    if (!allAnswered) return;
    const finalAnswers = buildAnswers();
    const qualifies = finalAnswers.has_laptop && finalAnswers.has_programming_knowledge && finalAnswers.reliable_internet;

    if (qualifies) {
      onContinue(finalAnswers);
    } else {
      setStage('soft-gate');
    }
  };

  return (
    <div
      className="dts-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dts-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <style>{`
        .dts-overlay {
          position: fixed; inset: 0; background: var(--overlay); z-index: 90;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: dtsFade 0.2s ease both;
        }
        @keyframes dtsFade { from { opacity: 0; } to { opacity: 1; } }
        .dts-card {
          width: 100%; max-width: 32rem;
          background: var(--surface-elevated); border: 1px solid var(--border-subtle);
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
          padding: 2rem; position: relative;
          animation: dtsPop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
          max-height: 90vh; overflow-y: auto;
        }
        @keyframes dtsPop { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .dts-close {
          position: absolute; top: 1.1rem; right: 1.1rem; color: var(--text-muted);
          background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 999px;
          transition: color 0.2s, background 0.2s;
        }
        .dts-close:hover { color: var(--text-primary); background: var(--border-subtle); }
        .dts-title { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.4rem; line-height: 1.3; padding-right: 1.5rem; }
        .dts-sub { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.5rem; }
        .dts-q { margin-bottom: 1.25rem; }
        .dts-q-row { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
        .dts-q-icon {
          width: 2.25rem; height: 2.25rem; border-radius: 0.9rem 0.3rem 0.9rem 0.3rem; flex-shrink: 0;
          background: ${BRAND}22; display: flex; align-items: center; justify-content: center; color: ${BRAND};
        }
        .dts-q-label { font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.2rem; }
        .dts-q-sub { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; }
        .dts-choices { display: flex; gap: 0.6rem; margin-left: 3rem; }
        .dts-choice {
          flex: 1; padding: 0.55rem 0.5rem; border-radius: 0.9rem 0.3rem 0.9rem 0.3rem;
          border: 1.5px solid var(--border-subtle); background: var(--surface-alt);
          color: var(--text-secondary); font-size: 0.82rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s; text-align: center;
        }
        .dts-choice:hover { border-color: ${BRAND}66; background: ${BRAND}0f; }
        .dts-choice.selected-yes { border-color: #22c55e; background: rgba(34,197,94,0.12); color: #4ade80; }
        .dts-choice.selected-no { border-color: #f87171; background: rgba(248,113,113,0.12); color: #f87171; }
        .dts-btn-primary {
          width: 100%; background: ${BRAND}; color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 0.85rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.5rem;
          transition: box-shadow 0.25s, transform 0.2s;
        }
        .dts-btn-primary:hover:not(:disabled) { box-shadow: 0 8px 28px ${BRAND}55; transform: translateY(-1px); }
        .dts-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .dts-btn-whatsapp {
          width: 100%; background: #25D366; color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 0.85rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.5rem;
          text-decoration: none; transition: box-shadow 0.25s, transform 0.2s;
        }
        .dts-btn-whatsapp:hover { box-shadow: 0 8px 28px rgba(37,211,102,0.45); transform: translateY(-1px); }
        .dts-btn-ghost {
          width: 100%; margin-top: 0.6rem; background: transparent; color: var(--text-secondary);
          font-weight: 600; font-size: 0.85rem; padding: 0.75rem 1rem;
          border-radius: 2rem 0.75rem 2rem 0.75rem; border: 1px solid var(--border-subtle);
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .dts-btn-ghost:hover { background: var(--surface-alt); border-color: var(--border-strong); }
        .dts-note {
          font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 0.9rem; line-height: 1.5;
        }
        .dts-badge {
          display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700;
          color: #fbbf24; background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.3);
          padding: 0.3rem 0.7rem; border-radius: 999px; margin-bottom: 1rem;
        }
      `}</style>

      <div className="dts-card">
        <button type="button" className="dts-close" onClick={onCancel} aria-label="Close">
          <X size={18} aria-hidden="true" />
        </button>

        {stage === 'questions' ? (
          <>
            <h2 id="dts-title" className="dts-title">Quick screening for {courseTitle}</h2>
            <p className="dts-sub">
              This is a deep-tech track with live mentorship. Answer honestly, this won't stop you
              from enrolling, it just helps us support you better.
            </p>

            {QUESTIONS.map((q) => {
              const Icon = q.icon;
              const value = answers[q.key];
              return (
                <div className="dts-q" key={q.key}>
                  <div className="dts-q-row">
                    <div>
                      <div className="dts-q-label">{q.label}</div>
                      <div className="dts-q-sub">{q.sub}</div>
                    </div>
                  </div>
                  <div className="dts-choices">
                    <button
                      type="button"
                      className={`dts-choice ${value === true ? 'selected-yes' : ''}`}
                      onClick={() => handleAnswer(q.key, true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`dts-choice ${value === false ? 'selected-no' : ''}`}
                      onClick={() => handleAnswer(q.key, false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="dts-btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? 'Submitting…' : 'Continue'}
            </button>
          </>
        ) : (
          <>
            <span className="dts-badge"> Based on your answers</span>
            <h2 id="dts-title" className="dts-title">Let's chat before you dive in</h2>
            <p className="dts-sub">
              Deep-tech tracks move fast and involve live mentorship, so a few of your answers stood out.
              That's completely okay, our team can help you figure out the best way to get set up, or
              point you to a track that fits better. You can still enroll now if you'd rather get started
              right away.
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="dts-btn-whatsapp"
            >
              <MessageCircle size={16} aria-hidden="true" /> Chat with our team on WhatsApp
            </a>

            <button
              type="button"
              className="dts-btn-primary"
              onClick={() => onContinue(buildAnswers())}
              disabled={submitting}
            >
              {submitting ? 'Enrolling…' : 'Continue With Enrollment Anyway'}
            </button>

            <button type="button" className="dts-btn-ghost" onClick={() => setStage('questions')}>
              Go back and review my answers
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DeepTechScreeningModal;

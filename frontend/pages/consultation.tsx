'use client';

import Head from "next/head";
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, BookOpen, MessageSquare, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const BRAND = "#4A3AFF";

const CONSULTATION_TYPES = [
  { value: 'course_guidance', label: 'Course Guidance', desc: 'Help choosing the right course for your goals' },
  { value: 'career_advice', label: 'Career Advice', desc: 'Career path planning and industry insights' },
  { value: 'technical_support', label: 'Technical Support', desc: 'Help with technical challenges in your course' },
  { value: 'renewal', label: 'Renewal', desc: 'Discuss course renewal or extension options' },
  { value: 'general', label: 'General Inquiry', desc: 'Any other questions or discussions' },
];

const COURSES = [
  'Full Stack Web Development',
  'Data Science Fundamentals',
  'UI/UX Design Masterclass',
  'Mobile App Development',
  'Cloud Computing AWS',
  'Digital Marketing Strategy',
  'Machine Learning A-Z',
  'Cybersecurity Essentials',
  'Not enrolled yet',
  'Other',
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function ConsultationPage() {
  const { user } = useAuth();
  const today = new Date();

  const [step, setStep] = useState(1); // 1: details, 2: pick date/time, 3: confirm, 4: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [form, setForm] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    consultation_type: '',
    course: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, full_name: user.name || '', email: user.email || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (selectedDate) fetchBookedSlots(selectedDate);
  }, [selectedDate]);

  const fetchBookedSlots = async (date: string) => {
    try {
      const res = await api.get(`/api/consultations/booked-slots?date=${date}`);
      setBookedSlots(res.booked_slots || []);
    } catch { setBookedSlots([]); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.full_name || !form.email || !form.consultation_type) {
        setError('Please fill in all required fields.');
        return;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) { setError('Please enter a valid email address.'); return; }
    }
    if (step === 2) {
      if (!selectedDate || !selectedTime) { setError('Please select a date and time.'); return; }
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/consultations', {
        ...form,
        preferred_date: selectedDate,
        preferred_time: selectedTime,
      });
      setStep(4);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to book consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' });
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const isDateDisabled = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t || d.getDay() === 0 || d.getDay() === 6;
  };
  const formatDate = (day: number) => `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <>
      <Head>
        <title>Book a Free Consultation – Learnexity</title>
        <meta name="description" content="Book a free consultation with our team to get personalized guidance on your tech learning journey." />
      </Head>
      <AppLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap');

          .consult-page { font-family: 'DM Sans', sans-serif; }

          .consult-hero {
            background: linear-gradient(135deg, #0a0a0f 0%, #0f0d1f 50%, #0a0a0f 100%);
            position: relative;
            overflow: hidden;
          }
          .consult-hero::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(74,58,255,0.18) 0%, transparent 70%);
          }
          .consult-hero::after {
            content: '';
            position: absolute;
            top: -100px; right: -100px;
            width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(74,58,255,0.08) 0%, transparent 70%);
            border-radius: 50%;
          }

          .card-glass {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            backdrop-filter: blur(20px);
            border-radius: 2rem 0.75rem 2rem 0.75rem;
          }

          .step-indicator { display: flex; align-items: center; gap: 0; margin-bottom: 2.5rem; }
          .step-dot {
            width: 32px; height: 32px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.8rem; font-weight: 700;
            font-family: 'Syne', sans-serif;
            transition: all 0.3s ease;
            position: relative; z-index: 1;
          }
          .step-dot.done { background: ${BRAND}; color: white; }
          .step-dot.active { background: ${BRAND}; color: white; box-shadow: 0 0 0 4px rgba(74,58,255,0.2); }
          .step-dot.pending { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.1); }
          .step-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
          .step-line.done { background: ${BRAND}; }

          .field-label {
            font-size: 0.7rem; letter-spacing: 0.1em;
            text-transform: uppercase; color: rgba(255,255,255,0.4);
            margin-bottom: 0.5rem; display: block;
            font-family: 'Syne', sans-serif;
          }
          .field-input {
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            color: white;
            font-size: 0.9rem;
            font-family: 'DM Sans', sans-serif;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .field-input:focus { border-color: ${BRAND}; box-shadow: 0 0 0 3px rgba(74,58,255,0.15); }
          .field-input::placeholder { color: rgba(255,255,255,0.2); }
          .field-input option { background: #1a1a2e; }

          .type-card {
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 1rem 0.5rem 1rem 0.5rem;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            background: rgba(255,255,255,0.02);
          }
          .type-card:hover { border-color: rgba(74,58,255,0.4); background: rgba(74,58,255,0.05); }
          .type-card.selected { border-color: ${BRAND}; background: rgba(74,58,255,0.1); box-shadow: 0 0 0 1px ${BRAND}; }

          .calendar-wrap { user-select: none; }
          .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
          .cal-nav { width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
          .cal-nav:hover { background: rgba(74,58,255,0.2); border-color: ${BRAND}; color: white; }
          .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
          .cal-day-name { text-align: center; font-size: 0.7rem; color: rgba(255,255,255,0.3); padding: 4px 0; font-family: 'Syne', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
          .cal-day {
            aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
            border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer;
            transition: all 0.15s ease; color: rgba(255,255,255,0.7);
          }
          .cal-day:hover:not(.disabled):not(.empty) { background: rgba(74,58,255,0.2); color: white; }
          .cal-day.selected { background: ${BRAND}; color: white; font-weight: 700; }
          .cal-day.today:not(.selected) { border: 1px solid rgba(74,58,255,0.4); color: ${BRAND}; }
          .cal-day.disabled { opacity: 0.25; cursor: not-allowed; }
          .cal-day.empty { cursor: default; }

          .time-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          @media (min-width: 640px) { .time-grid { grid-template-columns: repeat(4, 1fr); } }
          .time-slot {
            padding: 0.5rem; border-radius: 0.5rem; text-align: center;
            font-size: 0.8rem; cursor: pointer; transition: all 0.15s;
            border: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.6);
            background: rgba(255,255,255,0.02);
          }
          .time-slot:hover:not(.booked) { border-color: ${BRAND}; color: white; background: rgba(74,58,255,0.1); }
          .time-slot.selected { background: ${BRAND}; color: white; border-color: ${BRAND}; font-weight: 600; }
          .time-slot.booked { opacity: 0.25; cursor: not-allowed; text-decoration: line-through; }

          .primary-btn {
            background: ${BRAND}; color: white; font-weight: 600;
            padding: 0.85rem 2rem; border-radius: 2rem 0.75rem 2rem 0.75rem;
            transition: all 0.3s ease; font-family: 'DM Sans', sans-serif;
            font-size: 0.9rem; letter-spacing: 0.02em;
          }
          .primary-btn:hover:not(:disabled) { background: #3628e0; box-shadow: 0 0 28px rgba(74,58,255,0.4); transform: translateY(-1px); }
          .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

          .ghost-btn {
            color: rgba(255,255,255,0.5); font-weight: 500;
            padding: 0.85rem 1.5rem; border-radius: 0.75rem;
            transition: all 0.2s ease; font-size: 0.9rem;
            border: 1px solid rgba(255,255,255,0.07);
          }
          .ghost-btn:hover { color: white; border-color: rgba(255,255,255,0.2); }

          .confirm-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.875rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .confirm-row:last-child { border-bottom: none; }

          .success-circle {
            width: 80px; height: 80px; border-radius: 50%;
            background: rgba(74,58,255,0.15); border: 2px solid ${BRAND};
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.5rem;
            animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          }
          @keyframes pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }

          .toast {
            position: fixed; top: 5.5rem; right: 1rem; z-index: 60;
            max-width: 22rem; animation: slideIn 0.3s ease both;
          }
          @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        `}</style>

        {error && (
          <div className="toast">
            <div className="flex items-center gap-3 p-4 rounded-xl shadow-2xl bg-red-600 text-white">
              <XCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="consult-hero consult-page pt-28 pb-16 px-4">
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: BRAND, fontFamily: 'Syne, sans-serif' }}>Free 30-Minute Session</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Book a Consultation
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Get personalized guidance from our team — whether you're just starting out or already enrolled.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="consult-page pb-20 px-4" style={{ background: '#0a0a0f' }}>
          <div className="max-w-6xl mx-auto -mt-6">
            <div className="card-glass p-8 md:p-10">

              {/* Step indicators */}
              {step < 4 && (
                <div className="step-indicator">
                  {[1, 2, 3].map((s, i) => (
                    <React.Fragment key={s}>
                      <div className={`step-dot ${step > s ? 'done' : step === s ? 'active' : 'pending'}`}>
                        {step > s ? '✓' : s}
                      </div>
                      {i < 2 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* ── Step 1: Details ── */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Your Details</h2>
                  <p className="text-sm text-gray-500 mb-6">Tell us a bit about yourself and what you need.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="field-label">Full Name *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input name="full_name" value={form.full_name} onChange={handleChange}
                          placeholder="John Doe" className="field-input pl-9" />
                      </div>
                    </div>
                    <div>
                      <label className="field-label">Email Address *</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                          placeholder="you@example.com" className="field-input pl-9" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="field-label">Phone (optional)</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input name="phone" value={form.phone} onChange={handleChange}
                          placeholder="+234 801 234 5678" className="field-input pl-9" />
                      </div>
                    </div>
                    <div>
                      <label className="field-label">Course (if any)</label>
                      <div className="relative">
                        <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select name="course" value={form.course} onChange={handleChange} className="field-input pl-9 appearance-none">
                          <option value="">Select a course…</option>
                          {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="field-label">Consultation Type *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CONSULTATION_TYPES.map(t => (
                        <div key={t.value}
                          className={`type-card ${form.consultation_type === t.value ? 'selected' : ''}`}
                          onClick={() => { setForm(p => ({ ...p, consultation_type: t.value })); setError(''); }}>
                          <p className="text-sm font-semibold text-white mb-0.5">{t.label}</p>
                          <p className="text-xs text-gray-500">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-7">
                    <label className="field-label">Message (optional)</label>
                    <div className="relative">
                      <MessageSquare size={14} className="absolute left-3 top-3.5 text-gray-500" />
                      <textarea name="message" value={form.message} onChange={handleChange}
                        placeholder="Tell us more about what you'd like to discuss…"
                        rows={3} className="field-input pl-9 resize-none" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={handleNext} className="primary-btn">
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Date & Time ── */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Pick a Date & Time</h2>
                  <p className="text-sm text-gray-500 mb-6">Choose a slot that works for you (Mon–Fri only).</p>

                  <div className="calendar-wrap mb-6">
                    <div className="cal-header">
                      <button className="cal-nav" onClick={prevMonth}><ChevronLeft size={14} /></button>
                      <span className="text-white font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>{monthName} {calYear}</span>
                      <button className="cal-nav" onClick={nextMonth}><ChevronRight size={14} /></button>
                    </div>
                    <div className="cal-grid mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="cal-day-name">{d}</div>
                      ))}
                    </div>
                    <div className="cal-grid">
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`e${i}`} className="cal-day empty" />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = formatDate(day);
                        const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                        const disabled = isDateDisabled(day);
                        return (
                          <div key={day}
                            className={`cal-day ${disabled ? 'disabled' : ''} ${selectedDate === dateStr ? 'selected' : ''} ${isToday && selectedDate !== dateStr ? 'today' : ''}`}
                            onClick={() => { if (!disabled) { setSelectedDate(dateStr); setSelectedTime(''); } }}>
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="mb-7">
                      <p className="field-label mb-3">Available Times — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                      <div className="time-grid">
                        {TIME_SLOTS.map(slot => (
                          <div key={slot}
                            className={`time-slot ${bookedSlots.includes(slot) ? 'booked' : ''} ${selectedTime === slot ? 'selected' : ''}`}
                            onClick={() => { if (!bookedSlots.includes(slot)) setSelectedTime(slot); }}>
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep(1)} className="ghost-btn">← Back</button>
                    <button onClick={handleNext} className="primary-btn">
                      Review Booking →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Confirm ── */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Confirm Booking</h2>
                  <p className="text-sm text-gray-500 mb-6">Please review your details before confirming.</p>

                  <div className="card-glass p-6 mb-7" style={{ borderRadius: '1.25rem 0.5rem 1.25rem 0.5rem' }}>
                    {[
                      ['Name', form.full_name],
                      ['Email', form.email],
                      ['Phone', form.phone || '—'],
                      ['Course', form.course || '—'],
                      ['Type', CONSULTATION_TYPES.find(t => t.value === form.consultation_type)?.label || '—'],
                      ['Date', new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                      ['Time', selectedTime],
                      ...(form.message ? [['Message', form.message] as [string, string]] : []),
                    ].map(([key, val]) => (
                      <div className="confirm-row" key={key}>
                        <span className="text-xs uppercase tracking-wider text-gray-500" style={{ fontFamily: 'Syne, sans-serif' }}>{key}</span>
                        <span className="text-sm text-white text-right max-w-xs">{val}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-600 mb-6 text-center">
                    A confirmation email will be sent to <span style={{ color: BRAND }}>{form.email}</span>
                  </p>

                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep(2)} className="ghost-btn">← Back</button>
                    <button onClick={handleSubmit} disabled={loading} className="primary-btn">
                      {loading ? 'Booking…' : 'Confirm Booking ✓'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Success ── */}
              {step === 4 && (
                <div className="text-center py-4">
                  <div className="success-circle">
                    <CheckCircle size={36} style={{ color: BRAND }} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Booking Confirmed!</h2>
                  <p className="text-gray-400 mb-2">Your consultation has been scheduled for:</p>
                  <p className="text-white font-semibold mb-1">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p style={{ color: BRAND }} className="font-bold text-lg mb-6">{selectedTime}</p>
                  <p className="text-sm text-gray-500 mb-8">
                    A confirmation has been sent to <span className="text-white">{form.email}</span>.<br />
                    Our team will follow up with a meeting link shortly.
                  </p>
                  <button
                    onClick={() => { setStep(1); setSelectedDate(''); setSelectedTime(''); setForm({ full_name: user?.name || '', email: user?.email || '', phone: '', consultation_type: '', course: '', message: '' }); }}
                    className="primary-btn mx-auto block"
                    style={{ maxWidth: '220px' }}>
                    Book Another
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
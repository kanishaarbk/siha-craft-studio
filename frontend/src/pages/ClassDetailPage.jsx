import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Video, Calendar, Clock, CheckCircle2, AlertCircle, FileText, Download, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function ClassDetailPage() {
  const { slug } = useParams();
  const [crochetClass, setCrochetClass] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/classes/${slug}/`)
      .then((res) => {
        setCrochetClass(res.data);
        const available = res.data.sessions?.find((s) => !s.is_past && !s.is_cancelled && s.available_seats > 0);
        if (available) {
          setSelectedSession(available);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBookSession = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to enroll in this workshop.');
      navigate(`/login?redirect=/classes/${slug}`);
      return;
    }

    if (!selectedSession) {
      toast.error('Please select an upcoming session slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/classes/book/session/', {
        session_id: selectedSession.id,
      });
      toast.success(res.data.message);
      navigate('/account/classes');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not complete enrollment.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-pastel-pink border-t-brand-burgundy animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-brand-chocolate">Loading workshop details...</p>
      </div>
    );
  }

  if (!crochetClass) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-heading text-3xl font-bold text-brand-burgundy">Class Not Found</h2>
        <Link to="/classes" className="btn-primary text-xs">Back to Classes</Link>
      </div>
    );
  }

  const sessions = crochetClass.sessions?.filter((s) => !s.is_past && !s.is_cancelled) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Details & Syllabus (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy text-xs font-bold uppercase tracking-wider">
              {crochetClass.skill_level_display || crochetClass.skill_level}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-burgundy leading-tight">
              {crochetClass.title}
            </h1>
            <p className="text-sm sm:text-base text-brand-chocolate/85 leading-relaxed">
              {crochetClass.description}
            </p>
          </div>

          {/* Instructor Bio Box */}
          <div className="p-6 rounded-3xl bg-white/80 border border-pastel-pink/70 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-pastel-peach text-brand-burgundy flex items-center justify-center shrink-0 border border-pastel-pink">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading text-base font-bold text-brand-burgundy">
                Instructor: {crochetClass.instructor_name}
              </h4>
              <p className="text-xs text-brand-chocolate/75 mt-1 leading-relaxed">
                {crochetClass.instructor_bio}
              </p>
            </div>
          </div>

          {/* Learning Outcomes & Materials Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card-pastel p-6 bg-white/90 space-y-3">
              <h4 className="font-heading text-base font-bold text-brand-burgundy flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> What You Will Learn
              </h4>
              <div className="text-xs text-brand-chocolate/80 whitespace-pre-line leading-relaxed">
                {crochetClass.learning_outcomes}
              </div>
            </div>

            <div className="card-pastel p-6 bg-white/90 space-y-3">
              <h4 className="font-heading text-base font-bold text-brand-burgundy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-burgundy" /> Required Materials
              </h4>
              <div className="text-xs text-brand-chocolate/80 whitespace-pre-line leading-relaxed">
                {crochetClass.required_materials}
              </div>
            </div>
          </div>

          {/* Class Resources Download Preview */}
          {crochetClass.resources && crochetClass.resources.length > 0 && (
            <div className="p-6 rounded-3xl bg-pastel-lavender/30 border border-pastel-pink/60 space-y-3">
              <h4 className="font-heading text-base font-bold text-brand-burgundy flex items-center gap-2">
                <FileText className="w-4 h-4" /> Downloadable Stitch Pattern & Resource Guide
              </h4>
              <p className="text-xs text-brand-chocolate/75">
                Enrolled students can download the step-by-step PDF chart patterns and video references directly from their student dashboard.
              </p>
              {crochetClass.resources.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-white flex items-center justify-between text-xs border border-pastel-pink/60">
                  <span className="font-medium text-brand-chocolate">{r.title}</span>
                  <span className="text-[10px] text-brand-burgundy font-bold bg-pastel-pink px-2.5 py-0.5 rounded-full">
                    Included with Enrollment
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Slot Picker & Enrollment Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-pastel p-6 sm:p-8 space-y-6 bg-white/95 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-pastel-pink/60">
              <div>
                <span className="text-xs text-brand-chocolate/60">Workshop Fee</span>
                <p className="font-heading text-3xl font-bold text-brand-burgundy">
                  {parseFloat(crochetClass.price) === 0 ? 'Complimentary' : `₹${crochetClass.price}`}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pastel-sage text-emerald-800">
                ⏱ {crochetClass.duration_minutes} Mins Live
              </span>
            </div>

            {/* Session Selectors */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-brand-burgundy uppercase tracking-wider block">
                Select an Upcoming Date & Time:
              </label>

              {sessions.length > 0 ? (
                <div className="space-y-2.5">
                  {sessions.map((sess) => {
                    const isSelected = selectedSession?.id === sess.id;
                    const isFull = sess.available_seats <= 0;

                    return (
                      <button
                        key={sess.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSession(sess)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-brand-burgundy bg-pastel-pink/50 text-brand-burgundy font-semibold shadow-sm'
                            : isFull
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed text-gray-500'
                            : 'border-pastel-pink/70 bg-white text-brand-chocolate hover:bg-pastel-peach/30'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold">
                            {new Date(sess.start_time).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] opacity-80">
                            {new Date(sess.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {new Date(sess.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {isFull ? 'Full' : `${sess.available_seats} spots left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-brand-chocolate/60 italic p-4 rounded-xl bg-pastel-cream text-center">
                  No upcoming session slots currently scheduled. Please check back soon or contact our studio.
                </p>
              )}
            </div>

            {/* Google Meet Platform Highlight */}
            <div className="p-3.5 rounded-xl bg-pastel-cream border border-pastel-pink/60 flex items-center gap-3 text-xs text-brand-chocolate">
              <Video className="w-5 h-5 text-brand-burgundy shrink-0" />
              <span>Conducted live over <strong>Google Meet</strong>. Confidential link unlocks immediately upon booking.</span>
            </div>

            {/* Booking CTA */}
            <button
              onClick={handleBookSession}
              disabled={bookingLoading || !selectedSession}
              className="btn-primary w-full py-3.5 text-sm gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{bookingLoading ? 'Enrolling...' : 'Confirm Class Seat'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

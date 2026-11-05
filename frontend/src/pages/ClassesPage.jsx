import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Video, Calendar, Clock, Award, ArrowRight, CheckCircle2, Scissors, Sparkles, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function ClassesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedLevel = searchParams.get('skill_level') || '';

  useEffect(() => {
    setLoading(true);
    const query = selectedLevel ? `?skill_level=${selectedLevel}` : '';
    Promise.all([
      api.get(`/classes/${query}`),
      api.get('/workshops/'),
    ])
      .then(([clsRes, wsRes]) => {
        setClasses(clsRes.data || []);
        setWorkshops(wsRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedLevel]);

  const levels = [
    { key: '', label: 'All Workshops' },
    { key: 'BEGINNER', label: 'Beginner Friendly' },
    { key: 'INTERMEDIATE', label: 'Intermediate Craft' },
    { key: 'ALL_LEVELS', label: 'All Skill Levels' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-pink text-brand-burgundy text-xs font-bold uppercase tracking-wider shadow-sm">
          <Video className="w-3.5 h-3.5" /> Interactive Video Masterclasses
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Learn the Meditative Art of Crochet
        </h1>
        <p className="text-sm sm:text-base text-brand-chocolate/80 leading-relaxed">
          Stitch alongside our master artisans in intimate, small-batch live sessions held via Google Meet. Receive individualized stitch feedback, downloadable pattern charts, and permanent video recordings.
        </p>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {levels.map((lvl) => (
            <button
              key={lvl.key}
              onClick={() => {
                if (lvl.key) setSearchParams({ skill_level: lvl.key });
                else setSearchParams({});
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedLevel === lvl.key
                  ? 'bg-brand-burgundy text-white font-semibold shadow-sm'
                  : 'bg-white/80 border border-pastel-pink text-brand-chocolate hover:bg-pastel-peach/40'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Google Meet Workshops Published by Atelier */}
      {workshops.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-pastel-pink/70 pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> Direct Access Sessions
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-burgundy mt-1">
                Live Google Meet Workshops
              </h2>
            </div>
            <span className="text-xs text-brand-chocolate/70">
              Join live from anywhere • Click link to join room
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map((ws) => (
              <div
                key={ws.id}
                className="card-pastel p-6 sm:p-7 bg-white/95 rounded-3xl border border-pastel-pink shadow-pastel hover:shadow-pastel-lg transition-all duration-300 flex flex-col justify-between gap-5 group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pastel-pink/80 text-brand-burgundy text-[11px] font-bold">
                      <Video className="w-3 h-3" /> Google Meet Live
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                      Open to Join
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-brand-burgundy leading-snug group-hover:text-brand-burgundy-dark transition-colors">
                    {ws.title}
                  </h3>

                  <p className="text-xs text-brand-chocolate/80 leading-relaxed">
                    {ws.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-chocolate/80 pt-2 border-t border-pastel-pink/40">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-brand-burgundy" />
                      {new Date(ws.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-brand-burgundy" />
                      {ws.time?.slice(0, 5)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={ws.google_meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full sm:w-auto text-xs py-2.5 px-5 gap-2 justify-center shadow-pastel"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Google Meet Session</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>

                  {ws.registration_link && (
                    <a
                      href={ws.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full sm:w-auto text-xs py-2.5 px-4 justify-center"
                    >
                      <span>Register Online</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((cls) => {
          const sessions = cls.sessions || [];
          const nextSession = sessions.find((s) => !s.is_past && !s.is_cancelled);

          return (
            <div
              key={cls.id}
              className="card-pastel overflow-hidden flex flex-col justify-between bg-white/95 group hover:-translate-y-1.5 transition-all duration-300"
            >
              <div>
                {/* Class Cover Image */}
                <div className="relative aspect-video overflow-hidden bg-pastel-peach/30">
                  <img
                    src={cls.cover_image_url || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'}
                    alt={cls.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-brand-burgundy text-[11px] font-bold shadow-sm border border-pastel-pink">
                      {cls.skill_level_display || cls.skill_level}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-brand-burgundy text-white text-xs font-bold shadow-sm">
                    {parseFloat(cls.price) === 0 ? 'Complimentary' : `₹${cls.price}`}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-brand-chocolate/70">
                    <Clock className="w-3.5 h-3.5 text-brand-burgundy" />
                    <span>{cls.duration_minutes} Mins Live Workshop</span>
                    <span>•</span>
                    <span>Instructor: {cls.instructor_name}</span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-brand-burgundy leading-snug">
                    <Link to={`/classes/${cls.slug}`}>
                      {cls.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-brand-chocolate/80 line-clamp-3 leading-relaxed">
                    {cls.description}
                  </p>

                  {/* Next session dates banner */}
                  {nextSession ? (
                    <div className="p-3 rounded-xl bg-pastel-cream border border-pastel-pink/60 text-xs text-brand-chocolate space-y-1">
                      <div className="flex items-center justify-between font-semibold text-brand-burgundy text-[11px]">
                        <span>Next Session:</span>
                        <span className="text-emerald-700">
                          {nextSession.available_seats} seats remaining
                        </span>
                      </div>
                      <p className="flex items-center gap-1.5 text-brand-chocolate/80">
                        <Calendar className="w-3.5 h-3.5 text-brand-burgundy shrink-0" />
                        <span>
                          {new Date(nextSession.start_time).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-brand-chocolate/60 italic">
                      New session schedule releasing shortly.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <Link
                  to={`/classes/${cls.slug}`}
                  className="btn-primary w-full text-xs justify-between group"
                >
                  <span>View Syllabus & Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Meet Workflow Explainer Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-pastel-cream border border-pastel-pink shadow-pastel space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-burgundy">Simple & Accessible</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-burgundy">
            How Our Google Meet Classes Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white/80 border border-pastel-pink/60 space-y-2">
            <div className="w-12 h-12 rounded-full bg-pastel-pink text-brand-burgundy flex items-center justify-center mx-auto font-heading font-bold text-lg">
              1
            </div>
            <h4 className="font-heading font-bold text-brand-burgundy">Reserve Your Seat</h4>
            <p className="text-xs text-brand-chocolate/75">
              Select an upcoming session slot. Complete instant registration or test payment to lock in your place.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 border border-pastel-pink/60 space-y-2">
            <div className="w-12 h-12 rounded-full bg-pastel-peach text-brand-burgundy flex items-center justify-center mx-auto font-heading font-bold text-lg">
              2
            </div>
            <h4 className="font-heading font-bold text-brand-burgundy">Unlock Google Meet</h4>
            <p className="text-xs text-brand-chocolate/75">
              Your confidential Google Meet link appears right inside your <strong>My Classes</strong> dashboard for seamless access.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 border border-pastel-pink/60 space-y-2">
            <div className="w-12 h-12 rounded-full bg-pastel-sage text-brand-burgundy flex items-center justify-center mx-auto font-heading font-bold text-lg">
              3
            </div>
            <h4 className="font-heading font-bold text-brand-burgundy">Stitch & Keep Resources</h4>
            <p className="text-xs text-brand-chocolate/75">
              Download the illustrated PDF stitch patterns and guides directly from your student portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

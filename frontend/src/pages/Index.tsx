import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const slides = [
  {
    title: 'Opus Agents',
    subtitle: 'Create, test and deploy AI agents through natural conversation or step-by-step configuration. No programming expertise required.',
    cta: { label: 'Get Started →', to: '/create-agent' },
    bg: 'bg-[#f7f7f4]',
    accent: 'text-[#f54e00]',
    icon: '🚀',
  },
  {
    title: 'Build AI Agents',
    subtitle: 'Configure your agent step-by-step or describe your needs in natural conversation, and we\'ll build a tailored AI agent for you.',
    cta: { label: 'Create Agent →', to: '/create-agent' },
    bg: 'bg-white',
    accent: 'text-[#f54e00]',
    icon: '🛠️',
  },
  {
    title: 'Test Your Agent',
    subtitle: 'Chat with your AI agent powered by live AI responses to see how it performs before deploying and sharing.',
    cta: { label: 'Test Agent →', to: '/test-agent' },
    bg: 'bg-[#fafaf7]',
    accent: 'text-[#1f8a65]',
    icon: '💬',
  },
  {
    title: 'Manage Your Agents',
    subtitle: 'View all your agents, deploy them, and share with your team or the world.',
    cta: { label: 'My Agents →', to: '/agents' },
    bg: 'bg-white',
    accent: 'text-[#f54e00]',
    icon: '📋',
  },
];

const Index: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 pt-12">
        <div
          className={`rounded-2xl p-12 shadow-lg border border-[#e6e5e0] ${slide.bg} transition-all duration-700 min-h-[420px] flex flex-col justify-center items-center text-center`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="text-6xl mb-4">{slide.icon}</div>
          <h1 className={`text-5xl font-extrabold mb-4 ${slide.accent}`}>
            {slide.title}
          </h1>
          <p className="text-lg text-[#5a5852] max-w-xl mb-8">
            {slide.subtitle}
          </p>
          <Link
            to={slide.cta.to}
            className="inline-block px-8 py-4 bg-[#f54e00] text-white font-medium rounded-lg hover:bg-[#d04200] transition-colors text-lg"
          >
            {slide.cta.label}
          </Link>

          {/* Navigation dots */}
          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === current ? 'bg-[#f54e00]' : 'bg-[#e6e5e0] hover:bg-[#d5d4cf]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Prev/Next arrows */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={prev}
              className="px-4 py-2 text-sm text-[#5a5852] hover:text-[#26251e] transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={next}
              className="px-4 py-2 text-sm text-[#5a5852] hover:text-[#26251e] transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
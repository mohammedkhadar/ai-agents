import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeConfig = {
    sm: { icon: 'w-6 h-6', text: 'text-sm', gap: 'gap-1.5' },
    md: { icon: 'w-8 h-8', text: 'text-lg', gap: 'gap-2' },
    lg: { icon: 'w-10 h-10', text: 'text-xl', gap: 'gap-2.5' },
  };

  const cfg = sizeConfig[size];

  return (
    <div className={`flex items-center ${cfg.gap}`}>
      <div className={`${cfg.icon} rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center relative overflow-hidden group`}>
        {/* Outer ring with neural node pattern */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          {/* Outer hexagon */}
          <polygon
            points="50,8 85,25 85,75 50,92 15,75 15,25"
            fill="none"
            stroke="url(#logo-gradient)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Inner nodes (neural network) */}
          <circle cx="35" cy="35" r="3" fill="url(#logo-gradient)" opacity="0.8" />
          <circle cx="65" cy="30" r="3" fill="url(#logo-gradient)" opacity="0.7" />
          <circle cx="50" cy="50" r="4" fill="url(#logo-gradient)" />
          <circle cx="30" cy="65" r="3" fill="url(#logo-gradient)" opacity="0.8" />
          <circle cx="70" cy="65" r="3" fill="url(#logo-gradient)" opacity="0.7" />
          {/* Connecting lines */}
          <line x1="35" y1="35" x2="50" y2="50" stroke="url(#logo-gradient)" strokeWidth="1.5" opacity="0.5" />
          <line x1="65" y1="30" x2="50" y2="50" stroke="url(#logo-gradient)" strokeWidth="1.5" opacity="0.5" />
          <line x1="30" y1="65" x2="50" y2="50" stroke="url(#logo-gradient)" strokeWidth="1.5" opacity="0.5" />
          <line x1="70" y1="65" x2="50" y2="50" stroke="url(#logo-gradient)" strokeWidth="1.5" opacity="0.5" />
        </svg>
        {/* Central "AI" text */}
        <span className="relative z-10 text-white font-bold text-xs tracking-tight">AI</span>
      </div>
      <span className={`font-bold text-gray-900 ${cfg.text}`}>Opus Agents</span>
    </div>
  );
};

export default Logo;

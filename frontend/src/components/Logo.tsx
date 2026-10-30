import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; showText?: boolean }> = ({ size = 'md', showText = true }) => {
  const sizeConfig = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', gap: 'gap-3' },
  };

  const cfg = sizeConfig[size];

  return (
    <div className={`flex items-center ${cfg.gap}`}>
      <div className={`${cfg.icon} rounded-xl bg-white flex items-center justify-center p-1`}>
        <img
          src="/logo.png"
          alt="Opus Agents logo"
          className="w-full h-full object-contain rounded"
        />
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${cfg.text}`}>Opus Agents</span>
      )}
    </div>
  );
};

export default Logo;

import React from 'react';

/**
 * Modern, unique, aesthetic logo for CareerConnect
 * Features interlocking vector nodes with vibrant glowing gradients.
 */
export const LogoSymbol = ({ size = 36, className = '' }) => {
  const width = size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-symbol-svg ${className}`}
      aria-label="CareerConnect Logo Emblem"
    >
      <defs>
        {/* Main vibrant gradient */}
        <linearGradient id="cc-grad-primary" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Secondary highlight gradient */}
        <linearGradient id="cc-grad-secondary" x1="48" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="cc-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="cc-bg-badge" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Rounded Container Box with subtle inner glow */}
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#cc-bg-badge)" stroke="url(#cc-grad-primary)" strokeWidth="1.5" strokeOpacity="0.4" />
      
      {/* Background radial highlight */}
      <circle cx="24" cy="24" r="16" fill="url(#cc-grad-primary)" opacity="0.15" filter="url(#cc-glow)" />

      {/* Outer infinity orbital path representing endless career growth */}
      <path
        d="M16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24C32 28.4183 28.4183 32 24 32"
        stroke="url(#cc-grad-primary)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      
      {/* Interlocking dynamic C-loop offset path */}
      <path
        d="M32 24C32 28.4183 28.4183 32 24 32C19.5817 32 16 28.4183 16 24C16 19.5817 19.5817 16 24 16"
        stroke="url(#cc-grad-secondary)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="18 12"
      />

      {/* Ascending Career Connection Nodes (Dots) */}
      <circle cx="16" cy="24" r="2.5" fill="#38BDF8" />
      <circle cx="24" cy="16" r="2.5" fill="#818CF8" />
      <circle cx="32" cy="24" r="3" fill="#C084FC" filter="url(#cc-glow)" />
      
      {/* Central Spark / Pointer */}
      <circle cx="24" cy="24" r="2" fill="#FFFFFF" />
    </svg>
  );
};

const Logo = ({ variant = 'full', size = 36, showSubtitle = true, className = '' }) => {
  if (variant === 'icon') {
    return <LogoSymbol size={size} className={className} />;
  }

  if (variant === 'hero') {
    return (
      <div className={`logo-hero-container ${className}`}>
        <div className="logo-hero-aura" />
        <LogoSymbol size={size} className="logo-hero-icon" />
      </div>
    );
  }

  return (
    <div className={`brand-logo-component ${className}`}>
      <LogoSymbol size={size} />
      <div className="brand-text-container">
        <span className="brand-title">
          Career<span className="brand-accent">Connect</span>
        </span>
        {showSubtitle && (
          <span className="brand-subtitle">Multi-Age Career Platform</span>
        )}
      </div>
    </div>
  );
};

export default Logo;

import React from 'react';

export type LogoVariant = 'icon' | 'horizontal' | 'stacked' | 'badge';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LogoTheme = 'dark' | 'light' | 'monochrome';

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: LogoTheme;
  showTagline?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

const sizeConfig: Record<LogoSize, {
  iconPx: number;
  iconContainerClass: string;
  textClass: string;
  taglineClass: string;
  badgeClass: string;
}> = {
  xs: {
    iconPx: 22,
    iconContainerClass: 'w-[22px] h-[22px] rounded-md',
    textClass: 'text-sm font-bold tracking-tight',
    taglineClass: 'text-[9px]',
    badgeClass: 'text-[8px] px-1.5 py-0.2',
  },
  sm: {
    iconPx: 28,
    iconContainerClass: 'w-7 h-7 rounded-lg',
    textClass: 'text-base font-bold tracking-tight',
    taglineClass: 'text-[10px]',
    badgeClass: 'text-[9px] px-1.5 py-0.5',
  },
  md: {
    iconPx: 38,
    iconContainerClass: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    textClass: 'text-lg sm:text-xl font-extrabold tracking-tight',
    taglineClass: 'text-[11px]',
    badgeClass: 'text-[10px] px-2 py-0.5',
  },
  lg: {
    iconPx: 52,
    iconContainerClass: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
    textClass: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    taglineClass: 'text-xs',
    badgeClass: 'text-xs px-2.5 py-1',
  },
  xl: {
    iconPx: 72,
    iconContainerClass: 'w-18 h-18 sm:w-20 sm:h-20 rounded-3xl',
    textClass: 'text-3xl sm:text-4xl font-black tracking-tight',
    taglineClass: 'text-sm',
    badgeClass: 'text-xs px-3 py-1',
  },
  '2xl': {
    iconPx: 96,
    iconContainerClass: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
    textClass: 'text-4xl sm:text-5xl font-black tracking-tight',
    taglineClass: 'text-base',
    badgeClass: 'text-sm px-3.5 py-1.5',
  },
};

/**
 * Universal Vector Logo Emblem for Open List
 * Features a retail listing tag + multi-line spec sheet + radiant AI starburst.
 */
export const LogoMark: React.FC<{ sizePx?: number; className?: string; isMonochrome?: boolean }> = ({
  sizePx = 40,
  className = '',
  isMonochrome = false,
}) => {
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${className}`}
      aria-label="Open List Logo Mark"
    >
      <defs>
        {!isMonochrome ? (
          <>
            <linearGradient id={`grad-bg-${uniqueId}`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id={`grad-spark-${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id={`grad-sheet-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0e7ff" />
            </linearGradient>
            <filter id={`shadow-${uniqueId}`} x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#4338ca" floodOpacity="0.3" />
            </filter>
          </>
        ) : (
          <linearGradient id={`grad-mono-${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
          </linearGradient>
        )}
      </defs>

      {/* Squircle Badge Background */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={isMonochrome ? `url(#grad-mono-${uniqueId})` : `url(#grad-bg-${uniqueId})`}
        filter={!isMonochrome ? `url(#shadow-${uniqueId})` : undefined}
      />

      {/* Crisp Inset Rim */}
      <rect
        x="2.75"
        y="2.75"
        width="42.5"
        height="42.5"
        rx="11.25"
        stroke={isMonochrome ? 'currentColor' : '#ffffff'}
        strokeOpacity={isMonochrome ? '0.2' : '0.25'}
        strokeWidth="1.5"
      />

      {/* Retail Listing Tag Body */}
      <path
        d="M14 16C14 13.7909 15.7909 12 18 12H27.5858C28.6466 12 29.664 12.4214 30.4142 13.1716L34.8284 17.5858C35.5786 18.336 36 19.3534 36 20.4142V32C36 34.2091 34.2091 36 32 36H18C15.7909 36 14 34.2091 14 32V16Z"
        fill={isMonochrome ? '#ffffff' : `url(#grad-sheet-${uniqueId})`}
        fillOpacity={isMonochrome ? '0.9' : '1'}
      />

      {/* Eyelet Hole on Tag */}
      <circle cx="21" cy="18" r="2.2" fill={isMonochrome ? 'currentColor' : '#7c3aed'} />
      <circle cx="21" cy="18" r="1.1" fill="#ffffff" />

      {/* Listing Lines (Spec list, bullet highlights) */}
      <rect x="18" y="23" width="13" height="2.2" rx="1.1" fill={isMonochrome ? 'currentColor' : '#6366f1'} />
      <rect x="18" y="27.5" width="10" height="2.2" rx="1.1" fill={isMonochrome ? 'currentColor' : '#818cf8'} fillOpacity={isMonochrome ? '0.6' : '1'} />
      <rect x="18" y="32" width="6" height="2" rx="1" fill={isMonochrome ? 'currentColor' : '#a5b4fc'} fillOpacity={isMonochrome ? '0.4' : '1'} />

      {/* Radiant 4-Point AI Sparkle Starburst */}
      <path
        d="M35 8C35 11.866 31.866 15 28 15C31.866 15 35 18.134 35 22C35 18.134 38.134 15 42 15C38.134 15 35 11.866 35 8Z"
        fill={isMonochrome ? '#ffffff' : `url(#grad-spark-${uniqueId})`}
      />
      <circle cx="35" cy="15" r="1" fill="#ffffff" />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'dark',
  showTagline = true,
  showBadge = false,
  badgeText = 'Open-Weight AI',
  className = '',
  onClick,
  title = 'Open List - AI Product Listing Generator',
}) => {
  const cfg = sizeConfig[size];
  const isLightMode = theme === 'light';
  const isMonochrome = theme === 'monochrome';

  // Text color styling based on theme
  const primaryTextColor = isLightMode
    ? 'text-white'
    : isMonochrome
    ? 'text-current'
    : 'text-slate-900';

  const secondaryTextColor = isLightMode
    ? 'text-indigo-200'
    : isMonochrome
    ? 'text-current opacity-70'
    : 'text-slate-500';

  const gradientWordmark = isMonochrome
    ? 'text-current'
    : isLightMode
    ? 'bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent';

  // Badge pill styling
  const badgeStyling = isLightMode
    ? 'bg-white/10 text-indigo-200 border-white/20'
    : 'bg-indigo-50 text-indigo-700 border-indigo-200/60';

  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        title={title}
        className={`inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer hover:opacity-95' : ''} ${className}`}
      >
        <LogoMark sizePx={cfg.iconPx} isMonochrome={isMonochrome} />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        title={title}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${
          isLightMode
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-white border-slate-200/80 text-slate-800 shadow-sm'
        } ${onClick ? 'cursor-pointer hover:bg-slate-50/80 transition-colors' : ''} ${className}`}
      >
        <LogoMark sizePx={20} isMonochrome={isMonochrome} />
        <span className="font-bold text-xs tracking-tight">Open List</span>
        {badgeText && (
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {badgeText}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        onClick={onClick}
        title={title}
        className={`flex flex-col items-center text-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <LogoMark sizePx={cfg.iconPx} isMonochrome={isMonochrome} />
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <span className={`${cfg.textClass} ${primaryTextColor}`}>Open</span>
            <span className={`${cfg.textClass} ${gradientWordmark}`}>List</span>
          </div>
          {showTagline && (
            <p className={`${cfg.taglineClass} ${secondaryTextColor} font-medium mt-0.5 tracking-wide uppercase`}>
              AI Listing Studio
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: 'horizontal'
  return (
    <div
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <LogoMark
        sizePx={cfg.iconPx}
        isMonochrome={isMonochrome}
        className={onClick ? 'group-hover:scale-105 transition-transform duration-200' : ''}
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className={`${cfg.textClass} ${primaryTextColor}`}>Open</span>
            <span className={`${cfg.textClass} ${gradientWordmark} ml-1`}>List</span>
          </div>
          {showBadge && (
            <span
              className={`font-semibold tracking-wide uppercase rounded-full border ${cfg.badgeClass} ${badgeStyling}`}
            >
              {badgeText}
            </span>
          )}
        </div>
        {showTagline && (
          <p className={`${cfg.taglineClass} ${secondaryTextColor} hidden sm:block font-medium`}>
            Ecommerce Listing Generator
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;

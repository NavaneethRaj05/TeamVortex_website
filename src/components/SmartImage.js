import React, { useState } from 'react';

/**
 * SmartImage - Handles external image URLs from any hosting service.
 * - Shows a skeleton while loading
 * - Shows a fallback on error with helpful message
 * - Uses loading="lazy" for performance
 * - Accepts any external URL (ibb.co direct links, imgur, drive, etc.)
 */
const SmartImage = ({
    src,
    alt = '',
    className = '',
    fallbackClassName = '',
    showErrorHint = false,
    style = {},
    onClick,
}) => {
    const [status, setStatus] = useState('loading'); // loading | loaded | error

    if (!src) {
        return (
            <div className={`bg-white/5 flex items-center justify-center ${fallbackClassName || className}`} style={style}>
                <span className="text-white/20 text-[10px] sm:text-xs">No image</span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full" style={style} onClick={onClick}>
            {/* Skeleton while loading */}
            {status === 'loading' && (
                <div className={`absolute inset-0 bg-white/5 animate-pulse rounded ${fallbackClassName}`} />
            )}

            {/* Error state */}
            {status === 'error' && (
                <div className={`absolute inset-0 bg-red-500/10 border border-red-500/20 rounded flex flex-col items-center justify-center gap-1 p-2 ${fallbackClassName}`}>
                    <span className="text-red-400 text-[10px] sm:text-xs font-medium text-center">Failed to load</span>
                    {showErrorHint && (
                        <span className="text-white/30 text-[9px] text-center leading-tight">
                            Use a direct image URL (.jpg/.png)
                        </span>
                    )}
                </div>
            )}

            <img
                src={src}
                alt={alt}
                className={`${className} ${status !== 'loaded' ? 'opacity-0 absolute inset-0' : 'opacity-100'} transition-opacity duration-300`}
                style={{ display: 'block' }}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
            />
        </div>
    );
};

export default SmartImage;

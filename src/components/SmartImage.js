import React, { useState, useEffect } from 'react';

/**
 * Attempts to convert a viewer/share URL into a direct image URL.
 * Handles ibb.co, imgur, postimages, Google Drive, and raw URLs.
 */
function resolveDirectUrl(url) {
    if (!url) return url;
    const u = url.trim();

    // Already a direct image URL
    if (/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(u)) return u;

    // ibb.co viewer → direct  e.g. https://ibb.co/abc123 → https://i.ibb.co/abc123
    if (/^https?:\/\/ibb\.co\//i.test(u)) {
        return u.replace(/^(https?:\/\/)ibb\.co\//i, '$1i.ibb.co/');
    }

    // imgur album/page → direct
    const imgurMatch = u.match(/^https?:\/\/(?:www\.)?imgur\.com\/(?:a\/)?([a-zA-Z0-9]+)(?:\?.*)?$/i);
    if (imgurMatch) {
        return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }

    // Google Drive share link → direct
    const driveMatch = u.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if (driveMatch) {
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }

    // Google Drive open link
    const driveOpenMatch = u.match(/drive\.google\.com\/open\?id=([^&]+)/i);
    if (driveOpenMatch) {
        return `https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}`;
    }

    // Dropbox share link → direct download
    if (/dropbox\.com\/s\//i.test(u)) {
        return u.replace(/\?dl=0$/, '?raw=1').replace(/dropbox\.com\/s\//, 'dl.dropboxusercontent.com/s/');
    }

    // Return as-is and let the browser try
    return u;
}

/**
 * SmartImage - Handles external image URLs from any hosting service.
 * - Auto-converts viewer URLs to direct image URLs
 * - Shows a skeleton while loading
 * - Shows a fallback on error with helpful message
 * - Accepts ibb.co, imgur, postimages, Google Drive, and any direct URL
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
    const [resolvedSrc, setResolvedSrc] = useState('');
    const [useCors, setUseCors] = useState(false);

    useEffect(() => {
        if (!src) { setStatus('error'); return; }
        const direct = resolveDirectUrl(src);
        setResolvedSrc(direct);
        setStatus('loading');
        setUseCors(false);
    }, [src]);

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
                            Try: ibb.co, imgur, or any direct .jpg/.png URL
                        </span>
                    )}
                </div>
            )}

            {resolvedSrc && (
                <img
                    src={resolvedSrc}
                    alt={alt}
                    className={`${className} ${status !== 'loaded' ? 'opacity-0 absolute inset-0' : 'opacity-100'} transition-opacity duration-300`}
                    style={{ display: 'block' }}
                    loading="eager"
                    decoding="async"
                    {...(useCors ? { crossOrigin: 'anonymous' } : {})}
                    onLoad={() => setStatus('loaded')}
                    onError={() => {
                        if (!useCors) {
                            // First attempt (no CORS) failed — try with crossOrigin to handle some hosts
                            setUseCors(true);
                            setStatus('loading');
                        } else {
                            setStatus('error');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default SmartImage;

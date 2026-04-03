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
                <div className={`absolute inset-0 bg-white/5 rounded flex flex-col items-center justify-center gap-1 p-2 ${fallbackClassName}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3l18 18M3.75 3.75h16.5a.75.75 0 01.75.75v15a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-15a.75.75 0 01.75-.75z" />
                    </svg>
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
                    loading="lazy"
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

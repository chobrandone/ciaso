'use client';

import Image from 'next/image';
import { useState } from 'react';
import Icon from './Icon';

/**
 * Click-to-play YouTube embed. Nothing loads from YouTube until the visitor presses play
 * (faster pages, and no third-party cookies before consent). Uses youtube-nocookie.com.
 */
export default function VideoEmbed({ id, title, short = false }: { id: string; title: string; short?: boolean }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`video-frame${short ? ' video-frame--short' : ''}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className="video-play" onClick={() => setPlaying(true)}>
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes={short ? '340px' : '(min-width: 900px) 60vw, 100vw'} />
          <span className="video-play__btn"><Icon name="play" /></span>
          <span className="video-play__label">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}

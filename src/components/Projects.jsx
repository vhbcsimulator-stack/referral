import React, { useState, useEffect, useRef } from 'react';
import { mainSupabase } from '../supabaseClient';

const PROJECTS = [
  { id: 'EBLF', name: 'EastWest Breeze Leisure Farm' },
  { id: 'MVLC', name: 'Mountain View Community' }
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState('EBLF');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'actual' | 'perspective' | 'videos'
  const [rawMedia, setRawMedia] = useState({
    actual: [],
    perspective: [],
    videos: []
  });
  const [loading, setLoading] = useState(true);

  // Lightbox / Modal states
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [activeVideoId, setActiveVideoId] = useState(null);

  // Custom Video Player States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const iframeRef = useRef(null);

  // Handle YouTube iframe messages for custom controls
  useEffect(() => {
    if (activeVideoId === null) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);
      setIsMuted(false);
      return;
    }

    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          const info = data.info;
          if (info.currentTime !== undefined) {
            setCurrentTime(info.currentTime);
          }
          if (info.duration !== undefined) {
            setDuration(info.duration);
          }
          if (info.playerState !== undefined) {
            setIsPlaying(info.playerState === 1 || info.playerState === 3); // 1 = playing, 3 = buffering
          }
        }
      } catch (err) {
        // ignore JSON parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeVideoId]);

  const handlePlayPause = () => {
    const func = isPlaying ? 'pauseVideo' : 'playVideo';
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func }),
      '*'
    );
    setIsPlaying(!isPlaying);
  };

  const handleMuteUnmute = () => {
    const func = isMuted ? 'unMute' : 'mute';
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func }),
      '*'
    );
    setIsMuted(!isMuted);
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
      '*'
    );
  };

  const formatTime = (sec) => {
    if (isNaN(sec) || sec === undefined) return '0:00';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper to extract YouTube ID
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchMedia() {
      setLoading(true);
      try {
        // Fetch actual images
        const { data: actualData, error: actualErr } = await mainSupabase
          .from('project_dev')
          .select()
          .eq('project_name', selectedProject);

        if (actualErr) throw actualErr;

        // Fetch perspective images
        const { data: perspectiveData, error: perspectiveErr } = await mainSupabase
          .from('future_dev')
          .select()
          .eq('project_name', selectedProject);

        if (perspectiveErr) throw perspectiveErr;

        // Fetch video links
        const { data: videoData, error: videoErr } = await mainSupabase
          .from('youtube_links')
          .select()
          .eq('project_name', selectedProject);

        if (videoErr) throw videoErr;

        if (isMounted) {
          // Map actual images URLs
          const actualItems = (actualData || [])
            .map((row, index) => ({
              id: `actual-${index}`,
              type: 'actual',
              title: `Actual Update ${index + 1}`,
              url: row.image_link || row.imageLink || row.image_url || row.image_URL
            }))
            .filter(item => item.url);

          // Map perspective images URLs
          const perspectiveItems = (perspectiveData || [])
            .map((row, index) => ({
              id: `perspective-${index}`,
              type: 'perspective',
              title: `Perspective Render ${index + 1}`,
              url: row.image_link || row.imageLink || row.image_url || row.image_URL
            }))
            .filter(item => item.url);

          // Map videos
          const videoItems = (videoData || [])
            .map(row => {
              const url = row.link || row.url || row.video_link || row.videoUrl;
              const videoId = getYoutubeId(url);
              return {
                id: `video-${row.id}`,
                type: 'video',
                title: row.title || 'Project Video',
                url,
                videoId
              };
            })
            .filter(v => v.videoId);

          setRawMedia({
            actual: actualItems,
            perspective: perspectiveItems,
            videos: videoItems
          });
        }
      } catch (err) {
        console.error('Error loading project media:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMedia();
    return () => {
      isMounted = false;
    };
  }, [selectedProject]);

  // Combine items for Bento Box
  const getFilteredItems = () => {
    const { actual, perspective, videos } = rawMedia;
    
    if (filterType === 'actual') return actual;
    if (filterType === 'perspective') return perspective;
    if (filterType === 'videos') return videos;
    
    // For 'all' - Interleave them nicely or group them (Videos -> Actual -> Perspective)
    return [...videos, ...actual, ...perspective];
  };

  const displayedItems = getFilteredItems();

  // Dynamic Bento sizing layout calculation
  const getBentoClass = (item, index) => {
    if (item.type === 'video') {
      // Videos are featured, make them wide or large
      return index === 0 ? 'bento-item-large' : 'bento-item-wide';
    }
    
    // Images: Create a varied, alternating pattern
    const patternIndex = index % 8;
    if (patternIndex === 1 || patternIndex === 5) {
      return 'bento-item-tall';
    }
    if (patternIndex === 3) {
      return 'bento-item-wide';
    }
    if (patternIndex === 6) {
      return 'bento-item-large';
    }
    return 'bento-item-standard';
  };

  // Lightbox handles only image items
  const handleItemClick = (item) => {
    if (item.type === 'video') {
      setActiveVideoId(item.videoId);
    } else {
      const imageItems = displayedItems.filter(x => x.type !== 'video');
      const indexInImages = imageItems.findIndex(x => x.id === item.id);
      setLightboxImages(imageItems.map(x => x.url));
      setLightboxIndex(indexInImages >= 0 ? indexInImages : 0);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxImages([]);
  };

  const navigateLightbox = (direction) => {
    if (lightboxIndex === null || lightboxImages.length === 0) return;
    const newIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    setLightboxIndex(newIndex);
  };

  const handleDownloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = imageUrl.split('/').pop() || 'project_media_image.jpg';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.warn('Direct download blocked, opening image in new tab:', e);
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="projects-page-container animate-fade-in">
      {/* Top Section with Dropdown */}
      <div className="projects-header-bar">
        <div className="projects-header-info">
          <h2 className="projects-title">Project Media Showcase</h2>
          <p className="projects-subtitle">Explore development updates and visual content in Bento style.</p>
        </div>
        <div className="projects-dropdown-container">
          <label htmlFor="project-select" className="projects-dropdown-label">Select Project</label>
          <div className="projects-select-wrapper">
            <select
              id="project-select"
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setFilterType('all'); // reset filter on project change
              }}
              className="projects-select-input"
            >
              {PROJECTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined select-arrow-icon">expand_more</span>
          </div>
        </div>
      </div>

      {/* Styled Bento Category Filter Pills */}
      <div className="projects-tabs-nav">
        <button
          onClick={() => setFilterType('all')}
          className={`projects-tab-btn ${filterType === 'all' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined btn-tab-icon">grid_view</span>
          <span>All Media</span>
        </button>
        <button
          onClick={() => setFilterType('actual')}
          className={`projects-tab-btn ${filterType === 'actual' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined btn-tab-icon">photo_camera</span>
          <span>Actual</span>
        </button>
        <button
          onClick={() => setFilterType('perspective')}
          className={`projects-tab-btn ${filterType === 'perspective' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined btn-tab-icon">architecture</span>
          <span>Perspective</span>
        </button>
        <button
          onClick={() => setFilterType('videos')}
          className={`projects-tab-btn ${filterType === 'videos' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined btn-tab-icon">video_library</span>
          <span>Videos</span>
        </button>
      </div>

      {/* Bento Grid Content */}
      <div className="projects-media-content">
        {loading ? (
          // Skeleton Loading Bento
          <div className="projects-bento-grid">
            <div className="skeleton-media-card animate-pulse bento-item-large"><div className="skeleton-image-square"></div></div>
            <div className="skeleton-media-card animate-pulse bento-item-standard"><div className="skeleton-image-square"></div></div>
            <div className="skeleton-media-card animate-pulse bento-item-tall"><div className="skeleton-image-square"></div></div>
            <div className="skeleton-media-card animate-pulse bento-item-wide"><div className="skeleton-image-square"></div></div>
            <div className="skeleton-media-card animate-pulse bento-item-standard"><div className="skeleton-image-square"></div></div>
          </div>
        ) : (
          displayedItems.length > 0 ? (
            <div className="projects-bento-grid">
              {displayedItems.map((item, index) => {
                const bentoSizeClass = getBentoClass(item, index);
                
                if (item.type === 'video') {
                  return (
                    <div
                      key={item.id}
                      className={`media-bento-card video-card ${bentoSizeClass}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                        alt={item.title}
                        loading="lazy"
                        className="bento-media-img"
                      />
                      <div className="bento-play-overlay">
                        <div className="play-button-circle">
                          <span className="material-symbols-outlined play-icon">play_arrow</span>
                        </div>
                      </div>
                      
                      {/* Floating Category Badge */}
                      <div className="bento-badge video-badge">
                        <span className="material-symbols-outlined badge-icon">smart_display</span>
                        <span>Video</span>
                      </div>

                      {/* Glassmorphic Description Bar */}
                      <div className="bento-description-bar">
                        <h4 className="bento-card-title">{item.title}</h4>
                      </div>
                    </div>
                  );
                } else {
                  // Image (Actual or Perspective)
                  const isActual = item.type === 'actual';
                  return (
                    <div
                      key={item.id}
                      className={`media-bento-card image-card ${bentoSizeClass}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        loading="lazy"
                        className="bento-media-img"
                      />
                      <div className="bento-hover-overlay">
                        <span className="material-symbols-outlined overlay-zoom-icon">fullscreen</span>
                        <span className="overlay-text">View Image</span>
                      </div>

                      {/* Floating Category Badge */}
                      <div className={`bento-badge ${isActual ? 'actual-badge' : 'perspective-badge'}`}>
                        <span className="material-symbols-outlined badge-icon">
                          {isActual ? 'photo_camera' : 'architecture'}
                        </span>
                        <span>{isActual ? 'Actual' : 'Perspective'}</span>
                      </div>

                      {/* Glassmorphic Description Bar */}
                      <div className="bento-description-bar">
                        <h4 className="bento-card-title">{item.title}</h4>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="media-empty-state">
              <span className="material-symbols-outlined empty-state-icon">grid_view</span>
              <h3>No Media Available</h3>
              <p>There is no visual media matching this filter for the selected project.</p>
            </div>
          )
        )}
      </div>

      {/* Lightbox Modal for Images */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <div className="projects-lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-glass-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-control-btn close-btn" onClick={closeLightbox} aria-label="Close Lightbox">
              <span className="material-symbols-outlined">close</span>
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button className="lightbox-nav-btn prev-btn" onClick={() => navigateLightbox(-1)} aria-label="Previous Image">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="lightbox-nav-btn next-btn" onClick={() => navigateLightbox(1)} aria-label="Next Image">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </>
            )}

            <div className="lightbox-image-viewport">
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Lightbox Zoom ${lightboxIndex + 1}`}
                className="lightbox-main-img"
              />
            </div>

            <div className="lightbox-footer-bar">
              <span className="lightbox-counter-text">
                Image {lightboxIndex + 1} of {lightboxImages.length}
              </span>
              <button
                className="lightbox-download-action-btn"
                onClick={() => handleDownloadImage(lightboxImages[lightboxIndex])}
              >
                <span className="material-symbols-outlined">download</span>
                <span>Save Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Video Modal */}
      {activeVideoId !== null && (
        <div className="projects-video-modal-overlay" onClick={() => setActiveVideoId(null)}>
          <div className="video-modal-player-box" onClick={(e) => e.stopPropagation()}>
            {/* Custom Header Bar inside Modal */}
            <div className="video-modal-header">
              <h3 className="video-modal-title">
                {rawMedia.videos.find(v => v.videoId === activeVideoId)?.title || 'VHBC Media Player'}
              </h3>
              <button
                className="video-modal-close-btn"
                onClick={() => setActiveVideoId(null)}
                aria-label="Close Video Player"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Video container */}
            <div className="video-iframe-aspect-container">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&controls=0&enablejsapi=1&modestbranding=1&iv_load_policy=3&disablekb=1`}
                title="VHBC Media Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>

              {/* Invisible overlay blocker */}
              <div className="video-iframe-click-blocker" onClick={handlePlayPause}></div>
            </div>

            {/* Custom controls bar */}
            <div className="video-custom-controls">
              <div className="video-controls-row">
                <button
                  className="video-control-btn play-pause-btn"
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <span className="material-symbols-outlined">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <span className="video-time-text">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <input
                  type="range"
                  className="video-progress-slider"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeekChange}
                />

                <button
                  className="video-control-btn mute-btn"
                  onClick={handleMuteUnmute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="material-symbols-outlined">
                    {isMuted ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

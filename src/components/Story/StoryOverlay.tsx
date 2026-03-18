import React, { useState, useEffect, useRef } from 'react';
import { Story as StoryType, StorySlide } from '../../types';
import trackEvent from '../../core/trackEvent';

interface StoryOverlayProps {
  stories: StoryType[];
  activeStoryIndex: number;
  dataId: string;
  viewedStories: string[];
  setViewedStories: React.Dispatch<React.SetStateAction<string[]>>;
  onNextStory: () => void;
  onPrevStory: () => void;
  onClose: () => void;
}

export const StoryOverlay: React.FC<StoryOverlayProps> = ({
  stories,
  activeStoryIndex,
  dataId,
  viewedStories,
  setViewedStories,
  onNextStory,
  onPrevStory,
  onClose,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const progressTimerRef = useRef<any>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const clickStartTimeRef = useRef<number>(0);

  const currentStory = stories[activeStoryIndex];
  const currentSlide = currentStory?.slides[activeSlideIndex];

  useEffect(() => {
    setActiveSlideIndex(0);
    setProgress(0);
    setVideoLoaded(false);
    setIsPaused(false);
  }, [activeStoryIndex]);

  useEffect(() => {
    if (currentStory && currentSlide) {
      const slideTime = currentStory.styling?.slideShowTime || 5;
      const isVideo = !!currentSlide.video;

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }

      if (isPaused) {
        if (activeVideoRef.current) activeVideoRef.current.pause();
        return;
      } else {
        if (activeVideoRef.current) activeVideoRef.current.play().catch(() => {});
      }

      if (isVideo && !videoLoaded) {
        return;
      }

      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextSlide();
            return 100;
          }
          return prev + (100 / (slideTime * 10));
        });
      }, 100);

      return () => {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      };
    }
  }, [activeStoryIndex, activeSlideIndex, isPaused, videoLoaded]);

  if (!currentSlide) return null;

  const handleNextSlide = () => {
    if (activeSlideIndex < currentStory.slides.length - 1) {
      setActiveSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Mark story as viewed
      if (!viewedStories.includes(currentStory.id)) {
        const updated = [...viewedStories, currentStory.id];
        setViewedStories(updated);
        localStorage.setItem('app_storys_viewed_stories', JSON.stringify(updated));
      }
      onNextStory();
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      onPrevStory();
    }
  };

  const handleMouseDownNav = () => {
    clickStartTimeRef.current = Date.now();
    setIsPaused(true);
  };

  const handleMouseUpNav = (direction: 'next' | 'prev') => {
    setIsPaused(false);
    const duration = Date.now() - clickStartTimeRef.current;
    if (duration < 300) {
      if (direction === 'next') handleNextSlide();
      else handlePrevSlide();
    }
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleClickCTA = (slide: StorySlide) => {
    if (slide.link) {
      void trackEvent('story_cta_clicked', dataId, { slide_id: slide.id });
      if (slide.link.startsWith('http')) {
        window.open(slide.link, '_blank');
      } else {
        console.log('Story Action:', slide.link);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const crossConfig = currentStory.styling?.crossButton;
  const soundConfig = currentStory.styling?.soundToggle;
  const ctaStyling = currentSlide.styling?.cta;
  const ctaContainer = ctaStyling?.container;
  const ctaTextStyling = ctaStyling?.text;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.92)',
      zIndex: 100000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }} onClick={() => handleNextSlide()}>

      {/* Story Player Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
        height: '100%',
        maxHeight: '850px',
        backgroundColor: '#000',
        borderRadius: '0px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Progress Bars Top */}
        <div style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          right: '0px',
          display: 'flex',
          gap: '4px',
          padding: '10px',
          zIndex: 10
        }}>
          {currentStory.slides.map((_, idx) => {
            let fillWidth = '0%';
            if (idx < activeSlideIndex) fillWidth = '100%';
            else if (idx === activeSlideIndex) fillWidth = `${progress}%`;

            return (
              <div key={idx} style={{
                flex: 1,
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: fillWidth,
                  height: '100%',
                  backgroundColor: 'white',
                  transition: idx === activeSlideIndex ? 'width 0.1s linear' : 'none'
                }} />
              </div>
            );
          })}
        </div>

        {/* Header & Controls */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          padding: '5px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={currentStory.thumbnail} alt={currentStory.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              {currentStory.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {soundConfig?.enabled && (
              <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                {isMuted ? '🔇' : '🔊'}
              </button>
            )}
            {crossConfig?.enabled !== false && (
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Left / Right Nav Click Areas */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', zIndex: 5, cursor: 'pointer' }} onMouseDown={handleMouseDownNav} onMouseUp={() => handleMouseUpNav('prev')} onTouchStart={handleMouseDownNav} onTouchEnd={() => handleMouseUpNav('prev')} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '70%', zIndex: 4, cursor: 'pointer' }} onMouseDown={handleMouseDownNav} onMouseUp={() => handleMouseUpNav('next')} onTouchStart={handleMouseDownNav} onTouchEnd={() => handleMouseUpNav('next')} />

        {/* Content (Media) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          {currentSlide.video ? (
            <video ref={activeVideoRef} src={currentSlide.video} autoPlay playsInline muted={isMuted} onLoadedData={handleVideoLoad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={currentSlide.image || currentStory.thumbnail} alt="Story content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        {/* CTA Footer Section */}
        {(currentSlide.button_text || currentSlide.link) && (() => {
          const ctaMargin = currentSlide.styling?.cta?.margin;
          const ctaRadius = ctaStyling?.cornerRadius;
          const bLeft = ctaRadius?.bottomLeft || 12;
          const bRight = ctaRadius?.bottomRight || 12;
          const tLeft = ctaRadius?.topLeft || 12;
          const tRight = ctaRadius?.topRight || 12;

          return (
            <div style={{
              position: 'absolute',
              bottom: '0px',
              left: '0px',
              right: '0px',
              padding: `${ctaMargin?.top || 12}px ${ctaMargin?.right || 16}px ${ctaMargin?.bottom || 12}px ${ctaMargin?.left || 16}px`,
              zIndex: 10,
              display: 'flex',
              justifyContent: ctaContainer?.alignment === 'center' ? 'center' : 'flex-end',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleClickCTA(currentSlide); }}
                style={{
                  width: ctaContainer?.ctaFullWidth ? '100%' : (ctaContainer?.ctaWidth ? `${ctaContainer.ctaWidth}px` : 'auto'),
                  height: `${ctaContainer?.height || 45}px`,
                  backgroundColor: ctaContainer?.backgroundColor || '#F97316',
                  color: ctaTextStyling?.color || 'white',
                  borderRadius: `${tLeft}px ${tRight}px ${bRight}px ${bLeft}px`,
                  border: ctaContainer?.borderColor ? `${ctaContainer.borderWidth || 1}px solid ${ctaContainer.borderColor}` : 'none',
                  fontSize: `${ctaTextStyling?.fontSize || 14}px`,
                  fontFamily: ctaTextStyling?.fontFamily || 'Arial',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                }}
              >
                {currentSlide.button_text || 'Learn More'}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

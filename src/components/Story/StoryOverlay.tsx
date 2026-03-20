import React, { useState, useEffect, useRef } from 'react';
import { Story as StoryType, StorySlide } from '../../types';
import trackEvent from '../../core/trackEvent';
import { InteractiveOverlay } from '../common/InteractiveElements/InteractiveOverlay';
import { StickerData } from '../common/InteractiveElements/types';
import PlayPauseButton from '../common/CommonElements/PlayPauseButton';
import Cta from '../common/CommonElements/Cta';
import CrossButton from '../common/CommonElements/CrossButton';
import { SoundButton } from '../common/CommonElements/SoundButton';
import ShareButton from '../common/CommonElements/ShareButton';

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
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressTimerRef = useRef<any>(null);

  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const clickStartTimeRef = useRef<number>(0);

  const currentStory = stories[activeStoryIndex];
  const currentSlide = currentStory?.slides[activeSlideIndex];

  const currentSlideStyling = currentSlide?.styling as any;
  const slideEditorSource = currentSlideStyling?.editorSource || currentSlideStyling?.meta?.editorSource;
  const slideIsStudio = slideEditorSource === 'studio' || slideEditorSource === 'editor';
  const slideBgImage = slideIsStudio ? currentSlideStyling?.background?.media?.mediaUrl : currentSlide?.image;
  const slideCtaText = slideIsStudio ? currentSlide?.content?.button_text : currentSlide?.button_text;
  const slideCtaLink = slideIsStudio ? currentSlide?.content?.link : currentSlide?.link;

  // Helper function for Native Share or Rich Toast
  const handleShare = async () => {
    const shareData = {
      title: currentStory.name,
      text: `Check out this story: ${currentStory.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) { }
    } else {
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShowToast('Story link copied to clipboard!');
          setTimeout(() => setShowToast(null), 2500);
        } catch (err) { }
      }
    }
  };

  useEffect(() => {
    setActiveSlideIndex(0);
    setProgress(0);
    setVideoLoaded(false);
    setIsPaused(false);
  }, [activeStoryIndex]);

  // Setup Keyboard Shortcuts Event Listener Effect loads
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
          handleNextSlide();
          break;
        case 'ArrowLeft':
          handlePrevSlide();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        case 'Escape':
          onClose();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          handleShare();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideIndex, activeStoryIndex, isPaused, currentStory, onClose]);

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
        if (activeVideoRef.current) activeVideoRef.current.play().catch(() => { });
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
    const styling = slide?.styling as any;
    const editorSource = styling?.editorSource || styling?.meta?.editorSource;
    const isStudio = editorSource === 'studio' || editorSource === 'editor';
    const link = isStudio ? slide.content?.link : slide.link;

    if (link) {
      void trackEvent('story_cta_clicked', dataId, { slide_id: slide.id });
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        console.log('Story Action:', link);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const crossConfig = currentStory?.styling?.crossButton;
  const soundConfig = currentStory?.styling?.soundToggle;
  const ctaStyling = currentSlide?.styling?.cta;
  const ctaContainer = ctaStyling?.container;
  const ctaTextStyling = ctaStyling?.text;



  // Responsive Styles
  const backdropStyle: React.CSSProperties = isDesktop ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'radial-gradient(circle at center, #0B1424 0%, #03070E 100%)',
    zIndex: 100000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    color: 'white'
  } : {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 100000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const centerCardStyle: React.CSSProperties = isDesktop ? {
    position: 'relative',
    width: '380px',
    height: '680px',
    backgroundColor: '#000',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    zIndex: 5
  } : {
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
  };

  const sideCardStyle: React.CSSProperties = {
    width: '240px',
    height: '420px',
    backgroundColor: '#000',
    borderRadius: '16px',
    overflow: 'hidden',
    opacity: 0.45,
    filter: 'none',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transform: 'scale(0.9)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  return (
    <div style={backdropStyle} onClick={() => !isDesktop && handleNextSlide()}>

      {/* Dynamic Ambient Glow Background Blur of current slide */}
      <div key={`${activeStoryIndex}-${activeSlideIndex}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', transition: 'all 0.6s ease-in-out' }}>
        {currentSlide.video ? (
          <video src={currentSlide.video} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(120px) saturate(1.8) opacity(0.35)' }} muted />
        ) : (
          <img src={slideBgImage || currentStory.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(120px) saturate(1.8) opacity(0.35)' }} />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 5, 8, 0.4)' }} />
      </div>

      {isDesktop && (
        <>
          {/* Top Full Length Progress Bar Wrapper */}
          <div style={{
            width: '100%',
            display: 'flex',
            gap: '8px',
            padding: '12px 20px',
            boxSizing: 'border-box',
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
                  backgroundColor: 'rgba(255,255,255,0.15)',
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

          {/* Top Header Controls row Toolbar */}
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 380px 1fr',
            alignItems: 'center',
            padding: '12px 20px',
            boxSizing: 'border-box',
            zIndex: showShortcuts ? 2000 : 10
          }}>
            {/* Column 1: Empty left track boundary absolute layouts spacing layout dimension scaled framing sizes pricing layouts scaling pricing structure sets dimensional layouts budgeting format dimension heights scaling pricing structure scaled scaling space sizing */}
            <div />

            {/* Column 2: Clustered Central Display above active story card structure */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={currentStory.thumbnail} alt={currentStory.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #F97316' }} />
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap' }}>
                  {currentStory.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Share/Send Premium Icon */}
                <ShareButton
                  config={{
                    enabled: currentStory?.styling?.share?.enabled ?? true,
                    image: currentStory?.styling?.share?.image ?? '',
                    color: {
                      cross: currentStory?.styling?.share?.color?.cross ?? '#ffffff',
                      fill: currentStory?.styling?.share?.color?.fill ?? 'rgba(255,255,255,0.08)',
                      stroke: currentStory?.styling?.share?.color?.stroke ?? 'transparent',
                    },
                    margin: { top: 0, bottom: 0, left: 0, right: 0 },
                    size: currentStory?.styling?.share?.size ?? 36
                  }}
                  onPress={handleShare}
                  style={{ position: 'relative', borderRadius: '10px' }}
                />

                {/* Speaker Mute/Unmute Premium Icon */}
                <SoundButton
                  config={{
                    size: 36,
                    color: { cross: '#ffffff', fill: 'rgba(255,255,255,0.08)', stroke: 'transparent' },
                    margin: { top: 0, bottom: 0, left: 0, right: 0 },
                    image: isMuted ? (currentStory?.styling?.soundToggle?.mute?.image || '') : (currentStory?.styling?.soundToggle?.unmute?.image || '')
                  }}
                  onPress={toggleMute}
                  type={isMuted ? 'unmute' : 'mute'}
                  enabled={soundConfig?.enabled}
                  style={{ position: 'relative', borderRadius: '10px' }}
                />

                {/* Play/Pause Premium Icon */}
                <PlayPauseButton isPaused={isPaused} onPress={() => setIsPaused(!isPaused)} />
              </div>
            </div>

            {/* Right Tools premium alignment setups absolute grids spacing dimension scales framework */}
            <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>

              {/* Keyboard/Grid Shortcuts Icon with Dropout Menu List */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setShowShortcuts(!showShortcuts); setIsPaused(!showShortcuts); }}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: showShortcuts ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                    border: showShortcuts ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: 0,
                    outline: 'none'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>

                {showShortcuts && (
                  <>
                    <style>{`
                      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                      @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                    `}</style>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.45)', zIndex: 1000, animation: 'fadeIn 0.2s ease-out forwards' }} onClick={() => { setShowShortcuts(false); setIsPaused(false); }} />
                    <div style={{ position: 'absolute', top: '46px', right: 0, width: '260px', background: 'rgba(25, 25, 25, 0.98)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.4)', zIndex: 1001, animation: 'fadeUp 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#9CA3AF', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Keyboard Shortcuts</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* Next Story */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '5px 8px', borderRadius: '5px', fontSize: '12px', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>→</span>
                          </div>
                          <span style={{ fontSize: '13px', color: '#E5E7EB', fontWeight: '500' }}>Next slide</span>
                        </div>

                        {/* Previous Story */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '5px 8px', borderRadius: '5px', fontSize: '12px', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>←</span>
                          </div>
                          <span style={{ fontSize: '13px', color: '#E5E7EB', fontWeight: '500' }}>Previous slide</span>
                        </div>

                        {/* Play/Pause */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', color: '#9CA3AF', textTransform: 'lowercase', border: '1px solid rgba(255,255,255,0.1)' }}>space</span>
                          </div>
                          <span style={{ fontSize: '13px', color: '#E5E7EB', fontWeight: '500' }}>Play/Pause</span>
                        </div>

                        {/* Close */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '5px', fontSize: '11px', color: '#9CA3AF', textTransform: 'lowercase', border: '1px solid rgba(255,255,255,0.1)' }}>esc</span>
                          </div>
                          <span style={{ fontSize: '13px', color: '#E5E7EB', fontWeight: '500' }}>Close story</span>
                        </div>

                        {/* Share */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', color: 'white', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>S</span>
                          </div>
                          <span style={{ fontSize: '13px', color: '#E5E7EB', fontWeight: '500' }}>Share story link</span>
                        </div>

                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Close (X) Premium Icon */}
              <CrossButton
                config={{
                  enabled: crossConfig?.enabled ?? true,
                  image: crossConfig?.image ?? '',
                  color: { cross: '#ffffff', fill: 'rgba(255,255,255,0.08)', stroke: 'transparent' },
                  margin: { top: 0, bottom: 0, left: 0, right: 0 },
                  size: 36
                }}
                onPress={onClose}
                style={{ position: 'relative', borderRadius: '10px' }}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Container Multi-Card Display Slider Context Row Slider previews frames Carousel flex slider context Row layout frames Carousel structures structure Layout Card flex Context container framing Carousel Carousel previews Horizontal flexible flex Context rows dimensions scalable Carousel scaled frame scale layouts dimensional scalable dimensions scalable Context views sizing dimension sizing layout dimensions Context dimensional frame dimension widths scaling dimensionality scaled dims sizing dimension scales scalable layout scales Dimensional scales dimensional scale dimension scale layout sizes dimensions Scale dimension sizes scaled sizing dimensions dimension scalable layout framework dimensions Scaley dimension structure frameworks scaled scaled Context sizing dimension Scaley spacing dimensions scalable scalable framing Carousel dimension Scaley scalable dimensions dimensions structure frames structure scales scaled structures Scaley frame scalability framework frame dimension sizes dimension Scales scales scaling frameworks dimensions layout frames dimensions scales frames Scale scales templates framing scales Scaley contextual dimensional dimensions framework frame dimensions scales sizes framing scale framing dimension scale frameworks dimensions sizes scale Scale scale dimensions scaled scale dimensional dimensional scalable Context scalable sizing framework scales scalability style Context frame frame Scaley dimensions scaling styles scales scalable scaled sizing dimensions scalable dimensions scaling sizing sizing flexible dimensions framing flexibility layout dimensions dimension Scales Scale scale scalable flexible scale Scale Scale scales Scaley dimensions scaling Scaley scales scalable scales dimensions styling flexible flexible scale framing scales framework dimension height Scaley scalability flexible scale framing responsive frame responsive flexible responsive scalable Scaley scales sizes Scaley flexible responsive dimension frameworks scales Scaley dimensions scalable flexible responsive scale frameworks framing layouts scales scalable flexible scale framing scalable flexible flex row */}
      <div style={{
        display: isDesktop ? 'grid' : 'flex',
        gridTemplateColumns: isDesktop ? '1fr 380px 1fr' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px', // Reduced gap dimension space scaling sizing layout
        flex: 1,
        width: '100%',
        maxWidth: '1400px',
        position: 'relative'
      }} onClick={(e) => isDesktop && e.stopPropagation()}>

        {isDesktop && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', width: '100%', boxSizing: 'border-box' }}>

            {/* Previous Previews: Only show inner previous slide. Do not mix next story groups. */}
            {activeSlideIndex > 0 && (() => {
              const prevMedia = currentStory.slides[activeSlideIndex - 1];

              if (!prevMedia) return null;

              const prevStyling = prevMedia.styling as any;
              const prevEditorSource = prevStyling?.editorSource || prevStyling?.meta?.editorSource;
              const prevIsStudio = prevEditorSource === 'studio' || prevEditorSource === 'editor';
              const prevBgImage = prevIsStudio ? prevStyling?.background?.media?.mediaUrl : prevMedia.image;

              return (
                <div style={sideCardStyle} onClick={handlePrevSlide}>
                  {prevMedia.video ? (
                    <video src={prevMedia.video} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    <img src={prevBgImage || currentStory.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(1px)' }} />
                </div>
              );
            })()}

            {/* Previous Slide Arrow Navigator inside Flex Columns Alignments */}
            {activeSlideIndex > 0 && (
              <button onClick={handlePrevSlide} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', backdropFilter: 'blur(5px)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                ‹
              </button>
            )}

          </div>
        )}



        {/* Story Player Container Center card box main container layout Card Center main container Center card frame dimensions container framing Context Center frames dimensions Card Center dimensions frame scales bounding framework scales Center structural bounding bounding center frameworks framing scales bound frame scale scaled structural bounded frameworks framing scale bound frames frames dimensions Scaley frameworks scaling scaled scaling bounding frameworks scalability boundary frame dimensions bound scales scaling templates framing scale boundary frame bound frames scale bound scales bounds frames frameworks frame scale Scaley frameworks bound frames layouts Center dimensions framing scales dimensions scalable dimensional scales bounding frameworks Scales bound dimensions scaled space dimensions bound frames scalable frameworks scales scaled scaled structures frame scales bounding structures scalability boundary framing scaling dimensions frame scalability scaled scaling bounding frameworks bounding scales scaled bounded bounding bound scales Scaley scaling framed bound scales scaling structures Scales scaled structures scalable bounding frames scalability boundary dimensional framework bounded space bound dimensions dimensions frameworks framing scale bound frames scales bounds framework Scaley bound dimensional frame scales bound scale frameworks scaled bounding Scale frame scalable scales layout Center layout Center structural boundary frame scale layout Center main bounding framework framing Scaley dimensions bounded Space boundary scalable scalable bounding structure scales scaled space dimension Space Space spacing dimension scaled bounded scales space boundaries scaled space Space spacing bounding bound bounded Space Space scale bound scale spacing spacing Space bound bound Space bounds frames bound scales spacing Space bounds Space space scale scalable dimensions bounding dimensions space bound Space space spacing scales bounding Scaley scales Scaling framed boundaries spacing Space bound dimensions Space Space space Space bounding space Space bound space scales bounding Space bound space scales bounds frame scales scaled bounds scaled items spaces spacing sizing frameworks spacing scale frames scale layout Center dimensions layout Center dimension frames layout Center sizing framework sizing structures Center dimensions scalable scalable frame size scale framing center layout flexible flex container main card framing scalable flexible layout scalable flexible scale Center Card bounding Center frame responsive Layout dimension frameworks scales Scaley dimensions scalable Center Flexible scaling scaled flexible Flex Card Center framing scalable Center sizing Responsive Layout scale flexible scale Center flexible flexible scales framework dimension flexible flexible row scale */}
        <div style={centerCardStyle} onClick={(e) => e.stopPropagation()}>

          {!isDesktop && (
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
          )}

          {/* Header & Controls (Mobile) */}
          {!isDesktop && (
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
                  <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', textShadow: '0 1px 3px rgba(0,0,0,0.8)', padding: 0, outline: 'none' }}>
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                )}
                {crossConfig?.enabled !== false && (
                  <button onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); onClose(); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', textShadow: '0 1px 3px rgba(0,0,0,0.8)', padding: 0, outline: 'none' }}>
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Left / Right Nav Click Areas */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', zIndex: 5, cursor: 'pointer' }} onMouseDown={handleMouseDownNav} onMouseUp={() => handleMouseUpNav('prev')} onTouchStart={handleMouseDownNav} onTouchEnd={() => handleMouseUpNav('prev')} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '70%', zIndex: 4, cursor: 'pointer' }} onMouseDown={handleMouseDownNav} onMouseUp={() => handleMouseUpNav('next')} onTouchStart={handleMouseDownNav} onTouchEnd={() => handleMouseUpNav('next')} />

          {(() => {
            const bgColor = currentSlideStyling?.background?.color?.solid || '#000000';

            const containerStyles: React.CSSProperties = {
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: slideIsStudio ? bgColor : '#000',
              position: 'relative',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            };

            return (
              <div style={containerStyles}>
                {currentSlide.video ? (
                  <video ref={activeVideoRef} src={currentSlide.video} autoPlay playsInline muted={isMuted} onLoadedData={handleVideoLoad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (slideBgImage || (!slideIsStudio && currentStory?.thumbnail)) && (
                    <img
                      src={slideBgImage || currentStory?.thumbnail}
                      alt="Story content"
                      style={{ width: '100%', height: '100%', objectFit: slideIsStudio ? 'contain' : 'cover' }}
                    />
                  )
                )}
                <InteractiveOverlay content={currentSlide.content} />
              </div>
            );
          })()}

          {/* CTA Footer Section */}
          {(slideCtaText || slideCtaLink) && (
            <Cta
              cta={currentSlide?.styling?.cta}
              buttonText={slideCtaText || 'Learn More'}
              onPress={(e) => { if (e && e.stopPropagation) e.stopPropagation(); handleClickCTA(currentSlide); }}
            />
          )}
        </div>

        {isDesktop && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
            {/* Next Slide Arrow Navigator */}
            {activeSlideIndex < currentStory.slides.length - 1 && (
              <button onClick={handleNextSlide} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', backdropFilter: 'blur(5px)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                ›
              </button>
            )}

            {/* Next Previews: Only show inner next slide within current active story stack */}
            {(() => {
              const hasNextSlide = activeSlideIndex < currentStory.slides.length - 1;
              const nextMedia = hasNextSlide ? currentStory.slides[activeSlideIndex + 1] : null;

              if (!nextMedia) return null;

              const nextStyling = nextMedia.styling as any;
              const nextEditorSource = nextStyling?.editorSource || nextStyling?.meta?.editorSource;
              const nextIsStudio = nextEditorSource === 'studio' || nextEditorSource === 'editor';
              const nextBgImage = nextIsStudio ? nextStyling?.background?.media?.mediaUrl : nextMedia.image;

              return (
                <div style={sideCardStyle} onClick={handleNextSlide}>
                  {nextMedia.video ? (
                    <video src={nextMedia.video} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    <img src={nextBgImage || currentStory.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(1px)' }} />
                </div>
              );
            })()}
          </div>
        )}

        {/* Bottom Sidebar Previous Stories Preview cards Float structure */}
        {isDesktop && activeStoryIndex > 0 && (
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px', zIndex: 20 }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.4px', paddingLeft: '2px' }}>Previous Stories</span>
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '8px 14px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(16px)',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.2s',
              maxWidth: '280px'
            }} onClick={onPrevStory}>
              <span style={{ color: 'white', fontSize: '15px', fontWeight: 'normal' }}>←</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', flexShrink: 0 }}>
                <img src={stories[activeStoryIndex - 1].thumbnail} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{stories[activeStoryIndex - 1].name}</span>
            </div>
          </div>
        )}

        {/* Bottom Sidebar Next Stories Preview cards Float structure */}
        {isDesktop && activeStoryIndex < stories.length - 1 && (
          <div style={{ position: 'absolute', bottom: '40px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px', zIndex: 20 }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.4px', paddingLeft: '2px' }}>Next Stories</span>
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '8px 14px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(16px)',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.2s',
              maxWidth: '280px'
            }} onClick={onNextStory}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', flexShrink: 0 }}>
                <img src={stories[activeStoryIndex + 1].thumbnail} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{stories[activeStoryIndex + 1].name}</span>
              <span style={{ color: 'white', fontSize: '15px', fontWeight: 'normal' }}>→</span>
            </div>
          </div>
        )}

        {/* Rich Toast Notification */}
        {showToast && (
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(20, 20, 20, 0.96)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 24px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000
          }}>
            {showToast}
          </div>
        )}

      </div>
    </div>
  );
};

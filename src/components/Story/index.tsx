import React, { useState, useEffect } from 'react';
import { CampaignStory } from '../../types';
import useAppStorysStore from '../../core/store';
import useCampaigns from '../../hooks/useCampaigns';
import trackEvent from '../../core/trackEvent';
import { StoryList } from './StoryList';
import { StoryOverlay } from './StoryOverlay';

export const Story: React.FC = () => {
  const data = useCampaigns<CampaignStory>('STR');
  const sdkVisible = useAppStorysStore((state) => state.isVisible);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_storys_viewed_stories');
      if (saved) {
        setViewedStories(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load viewed stories:', e);
    }
  }, []);

  useEffect(() => {
    if (data && data.details) {
      void trackEvent('story_module_viewed', data.id);
    }
  }, [data]);

  if (!data || !data.details || data.details.length === 0 || !sdkVisible) return null;

  const handleStoryClick = (index: number) => {
    setActiveStoryIndex(index);
    const story = data.details[index];
    void trackEvent('story_opened', data.id, { story_id: story.id, story_name: story.name });
  };

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < data.details.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  return (
    <div className="story-group-container" style={{
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      boxSizing: 'border-box'
    }}>
      <StoryList 
        stories={data.details} 
        viewedStories={viewedStories} 
        onStoryClick={handleStoryClick} 
      />
      {activeStoryIndex !== null && (
        <StoryOverlay 
          stories={data.details}
          activeStoryIndex={activeStoryIndex}
          dataId={data.id}
          viewedStories={viewedStories}
          setViewedStories={setViewedStories}
          onNextStory={handleNextStory}
          onPrevStory={handlePrevStory}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
    </div>
  );
};

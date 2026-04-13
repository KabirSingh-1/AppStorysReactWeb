import { useEffect, useState } from 'react'
import * as AppStorysSDK from '@appstorys/react-web'
import HeroSection from './components/landing/HeroSection'
import CoreFeatures from './components/landing/CoreFeatures'
import HyperPersonalization from './components/landing/HyperPersonalization'
import SetupGoals from './components/landing/SetupGoals'
import FrequencyAndScheduling from './components/landing/FrequencyAndScheduling'
import WhyUs from './components/landing/WhyUs'
import Integrations from './components/landing/Integrations'
import Sdks from './components/landing/Sdks'
import Testimonials from './components/landing/Testimonials'
import TrustSection from './components/landing/TrustSection'
import BlogSection from './components/landing/BlogSection'
import TopBanner from './components/shell/TopBanner'
import Header from './components/shell/Header'
import Footer from './components/shell/Footer'
import TooltipCanvas from './components/TooltipCanvas'
import './App.css'

const AppStorys = (AppStorysSDK as any).AppStorys;
const StoryComponent =
  (AppStorysSDK as any).Story?.default ??
  (AppStorysSDK as any).Story;
const BannerComponent =
  (AppStorysSDK as any).Banner?.default ??
  (AppStorysSDK as any).Banner;
const PipComponent =
  (AppStorysSDK as any).Pip?.default ??
  (AppStorysSDK as any).Pip;
const FloaterComponent =
  (AppStorysSDK as any).Floater?.default ??
  (AppStorysSDK as any).Floater;
const TooltipComponent =
  (AppStorysSDK as any).Tooltip?.default ??
  (AppStorysSDK as any).Tooltip;
const BottomSheetComponent =
  (AppStorysSDK as any).BottomSheet?.default ??
  (AppStorysSDK as any).BottomSheet;
const CsatComponent =
  (AppStorysSDK as any).Csat?.default ??
  (AppStorysSDK as any).Csat;


function App() {
  const [showTooltipDashboard, setShowTooltipDashboard] = useState(false);
  const DEMO_SCREEN_NAME = 'Home Screen';
  const DASHBOARD_SCREEN_NAME = 'Dashboard';

  useEffect(() => {
    const initSDK = async () => {
      try {
        console.log('[App] Initializing AppStorys SDK...');
        await AppStorys.initialize({
          appId: 'f69bdccf-b20f-4938-b39e-7075d76db791',
          accountId: '12a9eac5-94ee-4735-9aa6-b8a94cb8fbbb',
          baseUrl: window.location.origin + '/appstorys-users',
          trackingUrl: window.location.origin + '/appstorys-tracking',
          navigateToScreen: (screen: string) => {
            console.log('[App] Navigating to screen:', screen);
          }
        });
        const currentTracking = showTooltipDashboard ? DASHBOARD_SCREEN_NAME : DEMO_SCREEN_NAME;
        console.log('[App] AppStorys SDK initialized. Tracking screen:', currentTracking);
        await AppStorys.trackScreen(currentTracking);
      } catch (error) {
        console.error('Failed to init SDK:', error);
      }
    };
    initSDK();
  }, [showTooltipDashboard]);

  const toggleDashboard = async () => {
    const newState = !showTooltipDashboard;
    setShowTooltipDashboard(newState);
    const trackingScreen = newState ? DASHBOARD_SCREEN_NAME : DEMO_SCREEN_NAME;
    try {
      await AppStorys.trackScreen(trackingScreen);
      console.log('[App] Screen tracked via toggle:', trackingScreen);
    } catch (e) {
      console.error('[App] Failed to track screen via toggle:', e);
    }
  };

  return (
    <div className="app-landing-root">
      <TopBanner />
      <div data-as-id="header_container">
        <Header />
      </div>
      {StoryComponent ? <StoryComponent /> : null}
      {BannerComponent ? <BannerComponent /> : null}

      <main>
        {showTooltipDashboard ? (
          <TooltipCanvas />
        ) : (
          <>
            <div data-as-id="hero_section">
              <HeroSection />
            </div>
            <div data-as-id="core_features">
              <CoreFeatures />
            </div>
            <HyperPersonalization />
            <SetupGoals />
            <FrequencyAndScheduling />
            <WhyUs />
            <div data-as-id="integrations_section">
              <Integrations />
            </div>
            <Sdks />
            <Testimonials />
            <TrustSection />
            <BlogSection />
          </>
        )}
      </main>

      {PipComponent ? <PipComponent /> : null}
      {FloaterComponent ? <FloaterComponent /> : null}
      {TooltipComponent ? <TooltipComponent /> : null}
      {BottomSheetComponent ? <BottomSheetComponent /> : null}
      {CsatComponent ? <CsatComponent /> : null}
      <div data-as-id="footer_section">
        <Footer />
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleDashboard}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          padding: '12px 20px',
          backgroundColor: '#FE6B35',
          color: '#fff',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        {showTooltipDashboard ? 'View Landing Page' : 'View Tooltip Dashboard'}
      </button>
    </div>
  )
}

export default App


import { useEffect } from 'react'
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

function App() {
  const DEMO_SCREEN_NAME = 'Home Screen';

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
        console.log('[App] AppStorys SDK initialized. Tracking screen:', DEMO_SCREEN_NAME);
        await AppStorys.trackScreen(DEMO_SCREEN_NAME);
        console.log('[App] Screen tracked:', DEMO_SCREEN_NAME);
      } catch (error) {
        console.error('Failed to init SDK:', error);
      }
    };
    initSDK();
  }, []);

  return (
    <div className="app-landing-root">
      <TopBanner />
      <Header />
      {StoryComponent ? <StoryComponent /> : null}
      {BannerComponent ? <BannerComponent /> : null}
      <main>
        <HeroSection />
        <CoreFeatures />
        <HyperPersonalization />
        <SetupGoals />
        <FrequencyAndScheduling />
        <WhyUs />
        <Integrations />
        <Sdks />
        <Testimonials />
        <TrustSection />
        <BlogSection />
      </main>
      {PipComponent ? <PipComponent /> : null}
      {FloaterComponent ? <FloaterComponent /> : null}
      <Footer />
    </div>
  )
}

export default App

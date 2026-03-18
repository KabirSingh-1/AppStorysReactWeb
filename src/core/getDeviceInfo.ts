export default async function getDeviceInfo() {
  try {
    const deviceInfo: Record<string, any> = {
      browser: navigator.userAgent,
      language: navigator.language,
      platform: 'web',
      screen_width_px: window.innerWidth,
      screen_height_px: window.innerHeight,
      screen_density: window.devicePixelRatio,
      orientation: window.innerWidth < window.innerHeight ? "portrait" : "landscape",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    return deviceInfo;
  } catch (error) {
    console.error("Error fetching device info:", error);
    return {};
  }
}

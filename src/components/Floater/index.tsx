import React, { useEffect, useRef, useState } from "react";
import { LottiePlayer } from "lottie-react";
import useCampaigns from "../../hooks/useCampaigns";
import trackEvent from "../../core/trackEvent";
import useAppStorysStore from "../../core/store";
import { Campaign } from "../../types";

interface FloaterStyling {
  bottomLeftRadius?: number | string;
  bottomRightRadius?: number | string;
  topLeftRadius?: number | string;
  topRightRadius?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  marginTop?: number | string;
}

interface FloaterDetails {
  id?: string;
  image?: string;
  lottie_data?: string | Record<string, unknown>;
  link?: string;
  position?: string;
  width?: number | string;
  height?: number | string;
  styling?: FloaterStyling;
}

type FloaterCampaign = Campaign & {
  campaign_type: "FLT";
  details: FloaterDetails;
  display_trigger?: boolean;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeScreen = (value?: string | null): string => (value || "").trim().toLowerCase();

const MEDIA_BUCKET_HOST = "appstorysmediabucketdev.s3.ap-south-1.amazonaws.com";

const resolveLottieCandidateUrls = (url: string): string[] => {
  try {
    if (typeof window === "undefined") return [url];

    const parsed = new URL(url);
    if (parsed.hostname !== MEDIA_BUCKET_HOST) return [url];

    const isDevServer = Boolean(window.location.port);
    const proxyUrl = `/appstorys-media${parsed.pathname}${parsed.search}`;

    if (isDevServer) {
      // Prefer proxy in dev (works for localhost and LAN IP access), keep source URL as fallback.
      return [proxyUrl, url];
    }

    return [url];
  } catch {
    return [url];
  }
};

const isLikelyLottieJson = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.layers) || Array.isArray(candidate.assets) || typeof candidate.v === "string";
};

class FloaterLottieErrorBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onError: () => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const Floater: React.FC = () => {
  const [lottieData, setLottieData] = useState<any>(null);
  const [lottieUrls, setLottieUrls] = useState<string[]>([]);
  const [lottieFailed, setLottieFailed] = useState(false);
  const [lottieLoading, setLottieLoading] = useState(false);
  const lottieContainerRef = useRef<HTMLDivElement | null>(null);
  const lottieAnimationRef = useRef<any>(null);
  const hookData = useCampaigns<FloaterCampaign>("FLT");
  const campaigns = useAppStorysStore((state) => state.campaigns);
  const allCampaigns = useAppStorysStore((state) => state.allCampaigns);
  const currentScreen = useAppStorysStore((state) => state.currentScreen);
  const sdkVisible = useAppStorysStore((state) => state.isVisible);

  const data = hookData ??
    ([...campaigns, ...allCampaigns].find((campaign) => {
      const item = campaign as FloaterCampaign;
      if (item.campaign_type !== "FLT") return false;
      if (item.display_trigger === false) return false;
      return !normalizeScreen(item.screen) || normalizeScreen(item.screen) === normalizeScreen(currentScreen);
    }) as FloaterCampaign | undefined);

  useEffect(() => {
    if (!data?.id) return;
    void trackEvent("viewed", data.id);
  }, [data?.id]);

  useEffect(() => {
    const lottieSource = data?.details?.lottie_data;

    setLottieData(null);
    setLottieUrls([]);
    setLottieFailed(false);
    setLottieLoading(false);

    if (!lottieSource) return;

    if (isLikelyLottieJson(lottieSource)) {
      setLottieData(lottieSource);
      setLottieLoading(true);
      return;
    }

    if (typeof lottieSource !== "string") {
      setLottieFailed(true);
      return;
    }

    const candidateUrls = resolveLottieCandidateUrls(lottieSource);
    setLottieUrls(candidateUrls);
    setLottieLoading(true);
  }, [data?.details?.lottie_data]);

  useEffect(() => {
    if (!data?.details?.lottie_data || !lottieContainerRef.current) return;

    const lottie = LottiePlayer as any;
    if (!lottie || typeof lottie.loadAnimation !== "function") {
      setLottieFailed(true);
      setLottieLoading(false);
      return;
    }

    let cancelled = false;
    let activeAnimation: any = null;

    const cleanupCurrent = () => {
      if (activeAnimation && typeof activeAnimation.destroy === "function") {
        activeAnimation.destroy();
      }
      activeAnimation = null;
      lottieAnimationRef.current = null;
    };

    const tryLoadByPath = (paths: string[], index: number) => {
      if (cancelled) return;
      if (index >= paths.length) {
        setLottieFailed(true);
        setLottieLoading(false);
        console.error("[Floater] lottie load failed", { lottieUrls: paths });
        return;
      }

      cleanupCurrent();

      const animation = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: paths[index],
      });

      activeAnimation = animation;
      lottieAnimationRef.current = animation;

      animation.addEventListener("DOMLoaded", () => {
        if (cancelled) return;
        setLottieLoading(false);
      });

      animation.addEventListener("data_failed", () => {
        if (cancelled) return;
        tryLoadByPath(paths, index + 1);
      });
    };

    if (lottieData) {
      cleanupCurrent();
      const animation = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: lottieData,
      });
      activeAnimation = animation;
      lottieAnimationRef.current = animation;
      animation.addEventListener("DOMLoaded", () => {
        if (!cancelled) {
          setLottieLoading(false);
        }
      });
      animation.addEventListener("data_failed", () => {
        if (!cancelled) {
          setLottieFailed(true);
          setLottieLoading(false);
        }
      });
    } else if (lottieUrls.length > 0) {
      tryLoadByPath(lottieUrls, 0);
    }

    return () => {
      cancelled = true;
      cleanupCurrent();
    };
  }, [data?.details?.lottie_data, lottieData, lottieUrls]);

  if (!data || !data.details || !sdkVisible) return null;
  const { details } = data;
  const styling = details.styling || {};

  const resolvedPosition =
    typeof details.position === "string"
      ? details.position
      : typeof data.position === "string"
        ? data.position
        : "right";
  const position = resolvedPosition.toLowerCase() === "left" ? "left" : "right";

  const positionStyle: React.CSSProperties = {
    position: "fixed",
    left: position === "left" ? toNumber(styling.marginLeft, 12) : undefined,
    right: position === "left" ? undefined : toNumber(styling.marginRight, 12),
    top: toNumber(styling.marginTop, 0) > 0 ? toNumber(styling.marginTop, 0) : undefined,
    bottom: toNumber(styling.marginTop, 0) > 0 ? undefined : toNumber(styling.marginBottom, 80),
    zIndex: 10040,
    display: "flex",
  };

  const floaterStyle: React.CSSProperties = {
    width: toNumber(details.width, 60),
    height: toNumber(details.height, 60),
    background: "transparent",
    overflow: "hidden",
    borderBottomLeftRadius: toNumber(styling.bottomLeftRadius, 0),
    borderBottomRightRadius: toNumber(styling.bottomRightRadius, 0),
    borderTopLeftRadius: toNumber(styling.topLeftRadius, 0),
    borderTopRightRadius: toNumber(styling.topRightRadius, 0),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: details.link ? "pointer" : "default",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
  };

  const handleClick = async () => {
    if (details.link) {
      await trackEvent("clicked", data.id);
      window.open(details.link, "_blank");
    }
  };

  const canRenderLottie = Boolean(details.lottie_data && !lottieFailed);
  const canRenderImage = Boolean(details.image);
  const canRenderLoadingPlaceholder = Boolean(details.lottie_data && lottieLoading && !lottieData && !lottieFailed);

  if (!canRenderLottie && !canRenderImage && !canRenderLoadingPlaceholder) return null;

  return (
    <div style={positionStyle}>
      <div style={floaterStyle} onClick={() => void handleClick()}>
        {canRenderLottie ? (
          <FloaterLottieErrorBoundary key={String(details.lottie_data)} onError={() => setLottieFailed(true)}>
            <div ref={lottieContainerRef} style={{ width: "100%", height: "100%", display: "block" }} />
          </FloaterLottieErrorBoundary>
        ) : canRenderLoadingPlaceholder ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.08)",
              color: "#333",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            ...
          </div>
        ) : (
          <img
            src={details.image}
            alt="floater"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
      </div>
    </div>
  );
};

export default Floater;

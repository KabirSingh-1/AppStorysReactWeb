import React, { useEffect, useMemo, useRef, useState } from "react";
import useCampaigns from "../../hooks/useCampaigns";
import trackEvent from "../../core/trackEvent";
import useAppStorysStore from "../../core/store";
import { Campaign } from "../../types";

interface PipCampaignDetails {
  button_text?: string;
  crossButtonImage?: string | null;
  height?: number | string;
  width?: number | string;
  large_video?: string;
  small_video?: string;
  link?: string;
  maximiseImage?: string | null;
  minimiseImage?: string | null;
  muteImage?: string | null;
  position?: "left" | "right" | string;
  unmuteImage?: string | null;
  styling?: {
    appearance?: {
      defaultSound?: string;
      pipHeight?: string | number;
      pipWidth?: string | number;
    };
    crossButton?: {
      color?: {
        cross?: string;
        fill?: string;
        stroke?: string;
      };
      enabled?: boolean;
      image?: string;
      margin?: {
        bottom?: number;
        left?: number;
        right?: number;
        top?: number;
      };
      selectedStyle?: string;
      size?: number;
    };
    cta?: {
      container?: {
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        ctaWidth?: number;
        ctaFullWidth?: boolean;
        height?: number;
      };
      text?: {
        color?: string;
        fontSize?: number;
      };
    };
    expandControls?: {
      enabled?: boolean;
      maximise?: {
        color?: {
          cross?: string;
          fill?: string;
          stroke?: string;
        };
        image?: string;
        margin?: {
          bottom?: number;
          left?: number;
          right?: number;
          top?: number;
        };
        selectedStyle?: string;
        size?: number;
      };
      minimise?: {
        color?: {
          cross?: string;
          fill?: string;
          stroke?: string;
        };
        image?: string;
        margin?: {
          bottom?: number;
          left?: number;
          right?: number;
          top?: number;
        };
        selectedStyle?: string;
        size?: number;
      };
    };
    expandablePip?: string;
    isMovable?: boolean;
    pipBottomPadding?: number | string;
    pipTopPadding?: number | string;
    soundToggle?: {
      enabled?: boolean;
      defaultSound?: string;
      mute?: {
        color?: {
          cross?: string;
          fill?: string;
          stroke?: string;
        };
        image?: string;
        margin?: {
          bottom?: number;
          left?: number;
          right?: number;
          top?: number;
        };
        selectedStyle?: string;
        size?: number;
      };
      unmute?: {
        color?: {
          cross?: string;
          fill?: string;
          stroke?: string;
        };
        image?: string;
        margin?: {
          bottom?: number;
          left?: number;
          right?: number;
          top?: number;
        };
        selectedStyle?: string;
        size?: number;
      };
    };
  };
}

interface IconConfig {
  color?: {
    cross?: string;
    fill?: string;
    stroke?: string;
  };
  image?: string;
  margin?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
  selectedStyle?: string;
  size?: number;
}

type PipCampaign = Campaign & {
  campaign_type: "PIP";
  details: PipCampaignDetails;
  display_trigger?: boolean;
  screen?: string;
  position?: string;
  id: string;
};

const normalizeScreen = (value?: string | null): string => (value || "").trim().toLowerCase();

const parseNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function PipIcon({ iconType, color }: { iconType: "close" | "expand" | "minimize" | "mute" | "unmute"; color: string }) {
  const stroke = color || "#FFFFFF";

  if (iconType === "close") {
    return (
      <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
        <line x1="6" y1="6" x2="18" y2="18" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="18" y1="6" x2="6" y2="18" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (iconType === "expand") {
    return (
      <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
        <polyline points="8,3 3,3 3,8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="3" y1="3" x2="9" y2="9" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <polyline points="16,21 21,21 21,16" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="15" y1="15" x2="21" y2="21" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (iconType === "minimize") {
    return (
      <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
        <polyline points="9,9 3,9 3,3" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="3" y1="9" x2="9" y2="3" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <polyline points="15,15 21,15 21,21" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="15" y1="21" x2="21" y2="15" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (iconType === "mute") {
    return (
      <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
        <polygon points="4,10 8,10 13,6 13,18 8,14 4,14" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        <line x1="16" y1="8" x2="21" y2="16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <line x1="21" y1="8" x2="16" y2="16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden>
      <polygon points="4,10 8,10 13,6 13,18 8,14 4,14" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 10 Q18 12 16 14" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8 Q22 12 18 16" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconButton({
  iconType,
  config,
  imageOverride,
  onClick,
}: {
  iconType: "close" | "expand" | "minimize" | "mute" | "unmute";
  config?: IconConfig;
  imageOverride?: string | null;
  onClick: () => void;
}) {
  const iconSize = parseNumber(config?.size, 18);
  const buttonSize = Math.max(24, iconSize + 10);
  const margin = config?.margin || {};

  const imageUrl = imageOverride || config?.image;
  const iconColor = config?.color?.cross || "#FFFFFF";
  const fillColor = config?.color?.fill || "rgba(0,0,0,0.55)";
  const strokeColor = config?.color?.stroke || "rgba(255,255,255,0.35)";

  return (
    <button
      data-control-button="true"
      onClick={onClick}
      title={config?.selectedStyle || iconType}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: 999,
        border: `1px solid ${strokeColor}`,
        background: fillColor,
        color: iconColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        marginTop: parseNumber(margin.top, 0),
        marginRight: parseNumber(margin.right, 0),
        marginBottom: parseNumber(margin.bottom, 0),
        marginLeft: parseNumber(margin.left, 0),
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={iconType}
          style={{ width: iconSize, height: iconSize, objectFit: "contain" }}
        />
      ) : (
        <PipIcon iconType={iconType} color={iconColor} />
      )}
    </button>
  );
}

const Pip: React.FC = () => {
  const hookData = useCampaigns<PipCampaign>("PIP");
  const campaigns = useAppStorysStore((state) => state.campaigns);
  const allCampaigns = useAppStorysStore((state) => state.allCampaigns);
  const currentScreen = useAppStorysStore((state) => state.currentScreen);
  const sdkVisible = useAppStorysStore((state) => state.isVisible);

  const [isClosed, setIsClosed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const data = useMemo(() => {
    if (hookData) return hookData;

    const screen = normalizeScreen(currentScreen);
    const findFromList = (source: Campaign[]) => source.find((campaign) => {
      const item = campaign as PipCampaign;
      const isPip = item.campaign_type === "PIP";
      const matchesScreen = !normalizeScreen(item.screen) || normalizeScreen(item.screen) === screen;
      const displayTriggerReady = item.display_trigger !== false;
      return isPip && matchesScreen && displayTriggerReady;
    }) as PipCampaign | undefined;

    return findFromList(campaigns) ?? findFromList(allCampaigns);
  }, [hookData, campaigns, allCampaigns, currentScreen]);

  useEffect(() => {
    if (!data) return;

    const defaultSoundSetting =
      data.details?.styling?.soundToggle?.defaultSound ||
      data.details?.styling?.appearance?.defaultSound ||
      "yes";

    setIsMuted(String(defaultSoundSetting).toLowerCase() !== "yes");
    setIsClosed(false);
    setIsExpanded(false);
    setDragPosition(null);

    void trackEvent("viewed", data.id);
  }, [data]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (event: MouseEvent) => {
      const nextX = event.clientX - dragOffsetRef.current.x;
      const nextY = event.clientY - dragOffsetRef.current.y;
      setDragPosition({ x: Math.max(0, nextX), y: Math.max(0, nextY) });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  if (!data || !data.details || isClosed || !sdkVisible) return null;

  const details = data.details;
  const styling = details.styling || {};
  const appearance = styling.appearance || {};

  const configuredWidth = parseNumber(details.width ?? appearance.pipWidth, 150);
  const configuredHeight = parseNumber(details.height ?? appearance.pipHeight, 300);

  // Keep mini PIP landscape rectangular like the web reference.
  const miniWidth = Math.max(configuredWidth, configuredHeight);
  const miniHeight = Math.min(configuredWidth, configuredHeight);

  const ctaContainer = styling.cta?.container || {};
  const ctaText = styling.cta?.text || {};
  const hasCta = Boolean(details.button_text && details.button_text.trim().length > 0);

  const ctaHeight = parseNumber(styling.cta?.container?.height, 42);
  const expandedExtraHeight = hasCta ? ctaHeight + 24 : 0;

  const bottomPadding = parseNumber(styling.pipBottomPadding, 20);
  const topPadding = parseNumber(styling.pipTopPadding, 0);

  const videoSource = isExpanded ? details.large_video || details.small_video : details.small_video || details.large_video;

  const position = (details.position || data.position || "right").toLowerCase();
  const isMovable = Boolean(styling.isMovable);
  const soundEnabled = styling.soundToggle?.enabled !== false;
  const closeEnabled = styling.crossButton?.enabled !== false;
  const expandEnabled =
    styling.expandControls?.enabled !== false &&
    String(styling.expandablePip || "yes").toLowerCase() === "yes";

  const closeConfig = styling.crossButton;
  const expandConfig = isExpanded ? styling.expandControls?.minimise : styling.expandControls?.maximise;
  const soundConfig = isMuted ? styling.soundToggle?.mute : styling.soundToggle?.unmute;

  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 10020,
    width: isExpanded ? "100vw" : miniWidth,
    height: isExpanded ? "100vh" : miniHeight,
    borderRadius: 0,
    overflow: "hidden",
    background: "#000",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
    cursor: isDragging ? "grabbing" : isMovable && !isExpanded ? "grab" : "default",
    transition: isDragging ? "none" : "width 180ms ease, height 180ms ease, transform 180ms ease",
  };

  if (dragPosition && !isExpanded) {
    wrapperStyle.left = dragPosition.x;
    wrapperStyle.top = dragPosition.y;
  } else if (isExpanded) {
    wrapperStyle.left = 0;
    wrapperStyle.top = 0;
    wrapperStyle.right = 0;
    wrapperStyle.bottom = 0;
  } else {
    if (position === "left") {
      wrapperStyle.left = 24;
    } else {
      wrapperStyle.right = 24;
    }

    if (topPadding > 0) {
      wrapperStyle.top = topPadding;
    } else {
      wrapperStyle.bottom = bottomPadding + 20;
    }
  }

  const onWrapperMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isMovable || isExpanded) return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-control-button='true']")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setDragPosition({ x: rect.left, y: rect.top });
    setIsDragging(true);
  };

  const handleOpenLink = () => {
    if (!details.link) return;

    void trackEvent("clicked", data.id);
    window.open(details.link, "_blank");
  };

  if (!videoSource) return null;

  return (
    <div style={wrapperStyle} onMouseDown={onWrapperMouseDown}>
      <video
        ref={videoRef}
        src={videoSource}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        style={{ width: "100%", height: isExpanded && hasCta ? `calc(100% - ${expandedExtraHeight}px)` : "100%", objectFit: isExpanded ? "contain" : "cover" }}
        onClick={handleOpenLink}
      />

      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 8,
          zIndex: 2,
        }}
      >
        {soundEnabled && (
          <IconButton
            iconType={isMuted ? "mute" : "unmute"}
            config={soundConfig}
            imageOverride={isMuted ? details.muteImage : details.unmuteImage}
            onClick={() => setIsMuted((prev) => !prev)}
          />
        )}

        {expandEnabled && (
          <IconButton
            iconType={isExpanded ? "minimize" : "expand"}
            config={expandConfig}
            imageOverride={isExpanded ? details.minimiseImage : details.maximiseImage}
            onClick={() => setIsExpanded((prev) => !prev)}
          />
        )}

        {closeEnabled && (
          <IconButton
            iconType="close"
            config={closeConfig}
            imageOverride={details.crossButtonImage}
            onClick={() => setIsClosed(true)}
          />
        )}
      </div>

      {isExpanded && hasCta && (
        <button
          data-control-button="true"
          onClick={handleOpenLink}
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 12,
            height: ctaContainer.height || 42,
            width: ctaContainer.ctaFullWidth ? "auto" : ctaContainer.ctaWidth || "auto",
            margin: ctaContainer.ctaFullWidth ? "0" : "0 auto",
            background: ctaContainer.backgroundColor || "#F7921C",
            color: ctaText.color || "#fff",
            border: `${ctaContainer.borderWidth || 0}px solid ${ctaContainer.borderColor || "transparent"}`,
            borderRadius: 10,
            fontSize: ctaText.fontSize || 14,
            fontWeight: 600,
            cursor: details.link ? "pointer" : "default",
          }}
        >
          {details.button_text}
        </button>
      )}
    </div>
  );
};

export { Pip };
export default Pip;

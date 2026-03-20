import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useCampaigns from "../../hooks/useCampaigns";
import trackEvent from "../../core/trackEvent";
import useAppStorysStore from "../../core/store";
import { BaseCampaign } from "../../types";

import { CampaignTooltip, TooltipItem, TooltipStyling } from "../../types";

const normalizeScreen = (value?: string | null): string => (value || "").trim().toLowerCase();

export const Tooltip: React.FC = () => {
  const hookData = useCampaigns<CampaignTooltip>("TTP");
  const campaigns = useAppStorysStore((state: any) => state.campaigns);
  const allCampaigns = useAppStorysStore((state: any) => state.allCampaigns);
  const currentScreen = useAppStorysStore((state: any) => state.currentScreen);
  const sdkVisible = useAppStorysStore((state: any) => state.isVisible);

  const [currentStep, setCurrentStep] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });

  const tooltipRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const data = useMemo(() => {
    if (hookData) return hookData;

    const screen = normalizeScreen(currentScreen);
    const findFromList = (source: any[]) => source.find((campaign) => {
      const item = campaign as BaseCampaign;
      const isTooltip = item.campaign_type === "TTP" || item.campaign_type === "TLTP";
      const matchesScreen = !normalizeScreen(item.screen) || normalizeScreen(item.screen) === screen;
      const displayTriggerReady = (item as any).display_trigger !== false;
      return isTooltip && matchesScreen && displayTriggerReady;
    }) as CampaignTooltip | undefined;

    return findFromList(campaigns) ?? findFromList(allCampaigns);
  }, [hookData, campaigns, allCampaigns, currentScreen]);

  const tooltips = useMemo(() => {
    if (data?.details?.tooltips && Array.isArray(data.details.tooltips)) {
      return [...data.details.tooltips].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    // Support for single step fully flat campaigns
    if (data?.details?.target || data?.details?.titleText) {
      return [{ ...data.details, _id: data.id } as TooltipItem];
    }

    return [];
  }, [data]);

  const currentTooltip = tooltips[currentStep];

  useEffect(() => {
    if (data) {
      void trackEvent("viewed", data.id);
    }
  }, [data]);

  // Find target element and get rect
  useEffect(() => {
    if (!currentTooltip?.target || isDismissed) return;

    setTargetRect(null);

    const findTarget = (scroll = false) => {
      const targetId = currentTooltip.target;
      if (!targetId) return null;

      const el = document.getElementById(targetId) ||
        document.querySelector(`[data-id="${targetId}"]`) ||
        document.querySelector(`.${targetId}`);

      if (el) {
        setTargetRect(el.getBoundingClientRect());
        if (scroll) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return el;
      }
      return null;
    };

    // Initial check
    const el = findTarget(true);

    // Setup MutationObserver to watch for element appearing
    if (!el) {
      observerRef.current = new MutationObserver(() => {
        const found = findTarget(true);
        if (found) {
          observerRef.current?.disconnect();
        }
      });
      observerRef.current.observe(document.body, { childList: true, subtree: true });
    }

    // Resize and scroll listener
    const handleResizeOrScroll = () => {
      const targetEl = findTarget(false);
      if (targetEl) {
        setTargetRect(targetEl.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll);
    };
  }, [currentTooltip, isDismissed, currentStep]);

  // Measure tooltip content
  useLayoutEffect(() => {
    if (tooltipRef.current && targetRect) {
      const { width, height } = tooltipRef.current.getBoundingClientRect();
      setTooltipSize({ width, height });
    }
  }, [currentTooltip, targetRect]);

  if (!data || !currentTooltip || isDismissed || !sdkVisible || !targetRect) return null;

  const styling = currentTooltip.styling || {};
  const appearance = styling.appearance || {};
  const colors = appearance.colors || {};
  const cta = styling.cta || {};
  const ctaContainer = cta.container || {};
  const ctaCorner = cta.cornerRadius || {};
  const ctaText = cta.text || {};

  const arrowPos = currentTooltip.arrowPosition || "left";
  const arrowStyle = appearance.arrowStyle || { width: 6, height: 12 };
  const arrowSize = arrowStyle.width || 6; // fallback

  const absoluteTop = targetRect.top + window.scrollY;
  const absoluteLeft = targetRect.left + window.scrollX;

  let tooltipLeft = 0;
  let tooltipTop = 0;

  // Offset gap between target and tooltip (excluding arrow itself)
  const offsetGap = 8;

  if (arrowPos === "left") {
    tooltipLeft = absoluteLeft + targetRect.width + offsetGap;
    tooltipTop = absoluteTop + (targetRect.height / 2) - (tooltipSize.height / 2);
  } else if (arrowPos === "right") {
    tooltipLeft = absoluteLeft - tooltipSize.width - offsetGap;
    tooltipTop = absoluteTop + (targetRect.height / 2) - (tooltipSize.height / 2);
  } else if (arrowPos === "top") {
    tooltipTop = absoluteTop + targetRect.height + offsetGap;
    tooltipLeft = absoluteLeft + (targetRect.width / 2) - (tooltipSize.width / 2);
  } else if (arrowPos === "bottom") {
    tooltipTop = absoluteTop - tooltipSize.height - offsetGap;
    tooltipLeft = absoluteLeft + (targetRect.width / 2) - (tooltipSize.width / 2);
  }

  const handleNext = () => {
    const action = currentTooltip.clickAction || "nextStep";
    const targetLink = currentTooltip.link || currentTooltip.url;

    if (action === "close") {
      setIsDismissed(true);
      if (targetLink) window.open(targetLink, "_blank");
      return;
    }

    if (currentStep < tooltips.length - 1) {
      setCurrentStep((prev: number) => prev + 1);
    } else {
      setIsDismissed(true);
      if (targetLink) {
        window.open(targetLink, "_blank");
      }
    }
  };

  const handleBackdropClick = () => {
    if (currentTooltip.enableBackdrop) {
      setIsDismissed(true);
    }
  };

  return (
    <>
      {currentTooltip.enableBackdrop && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.backdrop || "rgba(0, 0, 0, 0.7)",
            opacity: appearance.backdropOpacity ? appearance.backdropOpacity / 100 : 0.7,
            zIndex: 10000,
          }}
          onClick={handleBackdropClick}
        />
      )}

      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          top: tooltipTop,
          left: tooltipLeft,
          zIndex: 10001,
          backgroundColor: colors.tooltip || "#FE6B35",
          padding: `${appearance.padding?.top ?? 8}px ${appearance.padding?.right ?? 8}px ${appearance.padding?.bottom ?? 8}px ${appearance.padding?.left ?? 8}px`,
          borderRadius: `${appearance.cornerRadius?.topLeft ?? 12}px ${appearance.cornerRadius?.topRight ?? 12}px ${appearance.cornerRadius?.bottomRight ?? 12}px ${appearance.cornerRadius?.bottomLeft ?? 12}px`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          maxWidth: 300,
          minWidth: 200,
          transition: "top 0.2s ease, left 0.2s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderStyle: "solid",
            ...(arrowPos === "left" && {
              left: -offsetGap,
              top: tooltipSize.height / 2 - arrowSize,
              borderWidth: `${arrowSize}px ${offsetGap}px ${arrowSize}px 0`,
              borderColor: `transparent ${colors.tooltip || "#FE6B35"} transparent transparent`,
            }),
            ...(arrowPos === "right" && {
              right: -offsetGap,
              top: tooltipSize.height / 2 - arrowSize,
              borderWidth: `${arrowSize}px 0 ${arrowSize}px ${offsetGap}px`,
              borderColor: `transparent transparent transparent ${colors.tooltip || "#FE6B35"}`,
            }),
            ...(arrowPos === "top" && {
              top: -offsetGap,
              left: tooltipSize.width / 2 - arrowSize,
              borderWidth: `0 ${arrowSize}px ${offsetGap}px ${arrowSize}px`,
              borderColor: `transparent transparent ${colors.tooltip || "#FE6B35"} transparent`,
            }),
            ...(arrowPos === "bottom" && {
              bottom: -offsetGap,
              left: tooltipSize.width / 2 - arrowSize,
              borderWidth: `${offsetGap}px ${arrowSize}px 0 ${arrowSize}px`,
              borderColor: `${colors.tooltip || "#FE6B35"} transparent transparent transparent`,
            }),
          }}
        />

        {currentTooltip.titleText && (
          <div
            style={{
              color: styling.title?.color || "#ffffff",
              fontFamily: styling.title?.fontFamily || "Arial",
              fontSize: styling.title?.fontSize || 14,
              textAlign: (styling.title?.textAlign as any) || "center",
              marginBottom: styling.title?.margin?.bottom ?? 4,
              marginTop: styling.title?.margin?.top ?? 0,
              marginLeft: styling.title?.margin?.left ?? 0,
              marginRight: styling.title?.margin?.right ?? 0,
              fontWeight: styling.title?.fontDecoration?.includes("bold") ? "bold" : 600,
              fontStyle: styling.title?.fontDecoration?.includes("italic") ? "italic" : "normal",
              textDecoration: styling.title?.fontDecoration?.includes("underline") ? "underline" : "none",
            }}
          >
            {currentTooltip.titleText}
          </div>
        )}

        {currentTooltip.subtitleText && (
          <div
            style={{
              color: styling.subTitle?.color || "#ffffff",
              fontFamily: styling.subTitle?.fontFamily || "Arial",
              fontSize: styling.subTitle?.fontSize || 12,
              textAlign: (styling.subTitle?.textAlign as any) || "center",
              marginBottom: styling.subTitle?.margin?.bottom ?? 8,
              marginTop: styling.subTitle?.margin?.top ?? 0,
              marginLeft: styling.subTitle?.margin?.left ?? 0,
              marginRight: styling.subTitle?.margin?.right ?? 0,
              fontWeight: styling.subTitle?.fontDecoration?.includes("bold") ? "bold" : "normal",
              fontStyle: styling.subTitle?.fontDecoration?.includes("italic") ? "italic" : "normal",
              textDecoration: styling.subTitle?.fontDecoration?.includes("underline") ? "underline" : "none",
            }}
          >
            {currentTooltip.subtitleText}
          </div>
        )}

        {currentTooltip.ctaText && (
          <div
            style={{
              display: "flex",
              justifyContent: ctaContainer.alignment === "right" ? "flex-end" : ctaContainer.alignment === "left" ? "flex-start" : "center",
              marginTop: 8,
            }}
          >
            <button
              onClick={handleNext}
              style={{
                width: ctaContainer.ctaFullWidth ? "100%" : ctaContainer.ctaWidth || "auto",
                height: ctaContainer.height || 35,
                background: ctaContainer.backgroundColor || "#F7921C",
                color: ctaText.color || "#ffffff",
                border: `${ctaContainer.borderWidth || 0}px solid ${ctaContainer.borderColor || "transparent"}`,
                borderRadius: `${ctaCorner.topLeft ?? 7}px ${ctaCorner.topRight ?? 7}px ${ctaCorner.bottomRight ?? 7}px ${ctaCorner.bottomLeft ?? 7}px`,
                fontSize: ctaText.fontSize || 14,
                fontFamily: ctaText.fontFamily || "Arial",
                fontWeight: ctaText.fontDecoration?.includes("bold") ? "bold" : "normal",
                fontStyle: ctaText.fontDecoration?.includes("italic") ? "italic" : "normal",
                textDecoration: ctaText.fontDecoration?.includes("underline") ? "underline" : "none",
                cursor: "pointer",
                padding: "0 12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {currentTooltip.ctaText}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Tooltip;

import React, { useEffect, useState } from "react";
// @ts-ignore
import Lottie from "lottie-react";
import useCampaigns from "../../hooks/useCampaigns";
import trackEvent from "../../core/trackEvent"; // Placeholder, update import as needed
import useAppStorysStore from "../../core/store";

interface FloaterProps {}

const Floater: React.FC<FloaterProps> = () => {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [lottieData, setLottieData] = useState<any>(null);
  const [isLottie, setIsLottie] = useState(false);

  // TODO: Replace with actual campaign hook and types
  const data = useCampaigns("FLT");
  const campaigns = useAppStorysStore((state) => state.campaigns);
  const currentScreen = useAppStorysStore((state) => state.currentScreen);
  console.log("[Floater] all campaigns:", campaigns);
  console.log("[Floater] currentScreen:", currentScreen);
  console.log("[Floater] campaign data:", data);

  const padding = 0; // TODO: Implement padding logic if needed

  const [borderRadius, setBorderRadius] = useState({
    bottomLeft: 0,
    bottomRight: 0,
    topLeft: 0,
    topRight: 0,
  });

  useEffect(() => {
    if (!data) return;
    trackEvent("viewed", data.id);

    if (data.details.lottie_data) {
      setIsLottie(true);
      fetch(data.details.lottie_data)
        .then((res) => res.json())
        .then((json) => setLottieData(json));
      setBorderRadius({
        bottomLeft: parseInt(data.details.styling?.bottomLeftRadius || "0"),
        bottomRight: parseInt(data.details.styling?.bottomRightRadius || "0"),
        topLeft: parseInt(data.details.styling?.topLeftRadius || "0"),
        topRight: parseInt(data.details.styling?.topRightRadius || "0"),
      });
    } else if (data.details.image) {
      setIsLottie(false);
      setImagePath(data.details.image);
      setBorderRadius({
        bottomLeft: parseInt(data.details.styling?.bottomLeftRadius || "0"),
        bottomRight: parseInt(data.details.styling?.bottomRightRadius || "0"),
        topLeft: parseInt(data.details.styling?.topLeftRadius || "0"),
        topRight: parseInt(data.details.styling?.topRightRadius || "0"),
      });
    }
  }, [data]);

  if (!data || !data.details) return null;

  const positionStyle: React.CSSProperties = {
    position: "fixed",
    left:
      data.details.position === "left"
        ? parseInt(data.details.styling?.marginLeft || "0")
        : undefined,
    right:
      !data.details.position || data.details.position === "right"
        ? parseInt(data.details.styling?.marginRight || "0")
        : undefined,
    bottom: parseInt(data.details.styling?.marginBottom || "0") + padding,
    zIndex: 9999,
    display: "flex",
    justifyContent: "flex-end",
  };

  const floaterStyle: React.CSSProperties = {
    width: data.details.width || 60,
    height: data.details.height || 60,
    background: "rgba(0,0,0,0)",
    overflow: "hidden",
    borderBottomLeftRadius: borderRadius.bottomLeft,
    borderBottomRightRadius: borderRadius.bottomRight,
    borderTopLeftRadius: borderRadius.topLeft,
    borderTopRightRadius: borderRadius.topRight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: data.details.link ? "pointer" : "default",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };

  const handleClick = () => {
    if (data.details.link) {
      trackEvent("clicked", data.id);
      window.open(data.details.link, "_blank");
    }
  };

  return (
    <div style={positionStyle}>
      <div style={floaterStyle} onClick={handleClick}>
        {isLottie && lottieData ? (
          <Lottie animationData={lottieData} loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : imagePath ? (
          <img src={imagePath} alt="floater" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : null}
      </div>
    </div>
  );
};

export default Floater;

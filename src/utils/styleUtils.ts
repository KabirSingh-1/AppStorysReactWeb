export const parseBackground = (bg: any): string | undefined => {
  if (!bg) return undefined;
  if (typeof bg === 'string') return bg;

  const color = bg.color || {};
  if (color.type === 'gradient' && color.gradient) {
    const { direction = 'right', from, to, stops = [] } = color.gradient;
    const dirMap: Record<string, string> = {
      right: 'to right',
      left: 'to left',
      top: 'to top',
      bottom: 'to bottom',
    };
    const cssDir = dirMap[direction] || direction;
    
    if (stops.length > 0) {
      const stopStr = stops
        .map((s: any) => `${s.color} ${Math.round((s.offset || 0) * 100)}%`)
        .join(', ');
      return `linear-gradient(${cssDir}, ${stopStr})`;
    }
    return `linear-gradient(${cssDir}, ${from}, ${to})`;
  }

  return color.solid || color.value || undefined;
};

export const getAnimationStyles = (anim: any): string | undefined => {
  if (!anim || anim.type === 'none') return undefined;
  const type = String(anim.type).toLowerCase();
  const duration = anim.duration || 0.6;
  
  if (type === 'fade') return `appstorys-fade-in ${duration}s ease-out forwards`;
  if (type === 'classic') return `appstorys-classic-in ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
  if (type === 'rotate') return `appstorys-rotate-in ${duration}s ease-out forwards`;
  if (type === 'bounce') return `appstorys-bounce-in ${duration + 0.2}s cubic-bezier(0.68, -0.6, 0.32, 1.6) forwards`;
  
  return undefined;
};

import React from 'react';
import { StorySlideCta } from '../../../types';
import { personalizeText } from '../../../core/personalization';

interface CtaProps {
    cta?: StorySlideCta | null;
    buttonText?: string;
    onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const mapAlignment = (alignment?: string) => {
    switch (alignment) {
        case "left": return "flex-start";
        case "right": return "flex-end";
        default: return "center";
    }
};

const Cta: React.FC<CtaProps> = ({ cta, buttonText, onPress }) => {
    if (!cta || !buttonText || buttonText.trim() === '') {
        return null;
    }

    return (
        <div
            style={{
                position: "absolute",
                bottom: cta?.margin?.bottom,
                left: cta?.margin?.left,
                right: cta?.margin?.right,
                display: 'flex',
                justifyContent: mapAlignment(cta?.container?.alignment),
                width: '100%',
                pointerEvents: 'none',
                boxSizing: 'border-box',
                zIndex: 10,
            }}
        >
            <button
                style={{
                    backgroundColor: cta?.container?.backgroundColor || '#F7921C',
                    borderColor: cta?.container?.borderColor || 'transparent',
                    borderWidth: cta?.container?.borderWidth ?? 0,
                    borderStyle: cta?.container?.borderWidth ? 'solid' : 'none',
                    borderTopRightRadius: cta?.cornerRadius?.topRight,
                    borderTopLeftRadius: cta?.cornerRadius?.topLeft,
                    borderBottomRightRadius: cta?.cornerRadius?.bottomRight,
                    borderBottomLeftRadius: cta?.cornerRadius?.bottomLeft,
                    height: cta?.container?.height || 42,
                    width: cta?.container?.ctaFullWidth
                        ? "100%"
                        : cta?.container?.ctaWidth || "auto",
                    justifyContent: "center",
                    alignItems: "center",
                    display: 'flex',
                    cursor: 'pointer',
                    outline: 'none',
                    pointerEvents: 'auto',
                    padding: '0 12px',
                    boxSizing: 'border-box',
                }}
                onClick={onPress}
            >
                <span
                    style={{
                        color: cta?.text?.color || '#ffffff',
                        fontSize: cta?.text?.fontSize || 14,
                        fontFamily: cta?.text?.fontFamily,
                        fontWeight: cta?.text?.fontDecoration?.includes("bold") ? "bold" : "normal",
                        fontStyle: cta?.text?.fontDecoration?.includes("italic") ? "italic" : "normal",
                        textDecorationLine: cta?.text?.fontDecoration?.includes("underline") ? "underline" : "none",
                        textAlign: "center",
                    }}
                >
                    {personalizeText(buttonText)}
                </span>
            </button>
        </div>
    );
};

export default Cta;
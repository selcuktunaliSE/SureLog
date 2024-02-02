import { useState } from 'react';
import "../scss/effects/_cardTiltEffect.scss";

const useCardTiltEffect = () => {
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x - (rect.width / 2)) / (rect.width / 2);
        const yPercent = -(y - (rect.height / 2)) / (rect.height / 2);

        const tiltXMax = 15;
        const tiltYMax = 10;
        const tiltX = tiltXMax * xPercent;
        const tiltY = tiltYMax * yPercent;

        const gradientSize = 350; // Reduced gradient size for subtlety
        const gradientX = x;
        const gradientY = y;

        const shadowStrength = 20;
        const shadowX = -shadowStrength * xPercent; 
        const shadowY = -shadowStrength * yPercent;

        const newStyle = {
            transform: `rotateX(${tiltY}deg) rotateY(${tiltX}deg)`,
            transition: 'transform 0.2s ease-out', // Smooth transition for transform
            background: `radial-gradient(circle ${gradientSize}px at ${gradientX}px ${gradientY}px, rgba(150,150,255,0.15), rgba(255,255,255,0))`,
            boxShadow: `${shadowX}px ${shadowY}px 30px rgba(0,0,0,0.2)` // Dynamic shadow
        };

        setStyle(newStyle);
    };

    const handleMouseLeave = () => {
        const resetStyle = {
            transform: 'rotateX(0) rotateY(0)',
            transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out', // Smooth transition for reset
            background: '',
            boxShadow: ''
        };
        setStyle(resetStyle);
    };

    return { style, handleMouseMove, handleMouseLeave };
};

export default useCardTiltEffect;

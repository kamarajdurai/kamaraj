import { useRef, useState, useEffect } from 'react';

export default function TiltCard({ children, className = '' }) {
    const cardRef = useRef(null);
    const rectRef = useRef(null);
    const rafId = useRef(null);

    const [isTouch, setIsTouch] = useState(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(hover: none)').matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mediaQuery = window.matchMedia('(hover: none)');
        const handleChange = (e) => setIsTouch(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const handleMouseEnter = () => {
        if (isTouch || !cardRef.current) return;
        rectRef.current = cardRef.current.getBoundingClientRect();
        cardRef.current.style.transition = 'transform 0.1s ease-out';
        cardRef.current.style.transform = `perspective(1000px) scale3d(1.02, 1.02, 1)`;
    };

    const handleMouseMove = (e) => {
        if (isTouch || !cardRef.current || !rectRef.current) return;

        if (rafId.current) return;

        rafId.current = requestAnimationFrame(() => {
            const rect = rectRef.current;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            if (cardRef.current) {
                cardRef.current.style.transform =
                    `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1)`;
            }
            rafId.current = null;
        });
    };

    const handleMouseLeave = () => {
        if (isTouch) return;
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
        if (cardRef.current) {
            cardRef.current.style.transition = 'transform 0.5s ease-out';
            cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
    };

    if (isTouch) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            ref={cardRef}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                willChange: 'transform',
                transformStyle: 'preserve-3d'
            }}
        >
            {children}
        </div>
    );
}

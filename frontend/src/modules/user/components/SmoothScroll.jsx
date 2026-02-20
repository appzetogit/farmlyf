import { ReactLenis } from 'lenis/react';
import React from 'react';

function SmoothScroll({ children }) {
    return (
        <ReactLenis root options={{
            lerp: 0.1,
            duration: 1.5,
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        }}>
            {children}
        </ReactLenis>
    );
}

export default SmoothScroll;

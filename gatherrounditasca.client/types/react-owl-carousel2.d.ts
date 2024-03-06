// react-owl-carousel2.d.ts
//didnt work - need to remove the owl-carousel and use react-slick
declare module 'react-owl-carousel2' {
    import * as React from 'react';

    interface OwlCarouselProps {
        options?: any; // Use a more specific type if possible
        events?: Record<string, () => void>;
        // Add any other props here
        children?: React.ReactNode;  // This allows any valid JSX content as children
        className?: string;
        loop?: boolean;
        margin?: number;
        nav?: boolean;
        dots?: boolean;
        autoplay?: boolean;
        responsive?: {
            0?: { items: number };
            600?: { items: number };
            1000?: { items: number };
        };
    }

    const OwlCarousel: React.ComponentType<OwlCarouselProps>;
    export default OwlCarousel;
}


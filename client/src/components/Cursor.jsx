import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const Cursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX - 10);
            cursorY.set(e.clientY - 10);
        };

        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, []);

    // Also hiding default cursor in CSS

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-5 h-5 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full z-[9999] pointer-events-none mix-blend-screen"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full z-[9999] pointer-events-none mix-blend-screen"
                style={{
                    translateX: cursorX,
                    translateY: cursorY,
                    // Offset slightly to center
                    x: 6,
                    y: 6
                }}
            />
        </>
    );
};

export default Cursor;

import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!finePointer.matches || reducedMotion.matches) {
      return undefined;
    }

    const cursor = cursorRef.current;
    let frameId;
    let pointerX = 0;
    let pointerY = 0;

    const moveCursor = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!frameId) {
        frameId = window.requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
          cursor.classList.add('is-visible');
          frameId = null;
        });
      }
    };

    const updateHoverState = (event) => {
      const eventTarget = event.type === 'pointerout' ? event.relatedTarget : event.target;
      const target = eventTarget instanceof Element ? eventTarget : null;
      cursor.classList.toggle(
        'is-hovering',
        Boolean(target?.closest('a, button, [role="button"]'))
      );
    };

    document.addEventListener('pointermove', moveCursor);
    document.addEventListener('pointerover', updateHoverState);
    document.addEventListener('pointerout', updateHoverState);

    return () => {
      document.removeEventListener('pointermove', moveCursor);
      document.removeEventListener('pointerover', updateHoverState);
      document.removeEventListener('pointerout', updateHoverState);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      <span className="custom-cursor-dot" />
    </div>
  );
};

export default CustomCursor;

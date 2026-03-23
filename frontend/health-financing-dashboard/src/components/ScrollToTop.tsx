import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page when navigating to a new route.
 * This ensures users always see the beginning of the page content.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top using multiple methods for maximum compatibility
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Execute immediately
    scrollToTop();

    // Execute after browser paint
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Execute after a small delay to catch any late-rendering content
    const timer = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

export default ScrollToTop;

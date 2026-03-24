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
    // Prevent default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Scroll to top using multiple methods for maximum compatibility
    const scrollToTop = () => {
      // Most aggressive scroll methods first
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Also try with scrollTo options
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

      // Force scroll for main-content if it exists
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }

      // Force scroll on all scrollable elements
      const app = document.querySelector('.App');
      if (app) {
        app.scrollTop = 0;
      }
    };

    // Execute immediately and synchronously - before any rendering
    scrollToTop();

    // Execute after browser paint
    requestAnimationFrame(() => {
      scrollToTop();
      // Double-check after another frame
      requestAnimationFrame(() => {
        scrollToTop();
      });
    });

    // Execute after various delays to catch late-rendering content
    const timers = [0, 10, 50, 100, 200, 300].map(delay =>
      setTimeout(scrollToTop, delay)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [pathname]);

  return null;
}

export default ScrollToTop;

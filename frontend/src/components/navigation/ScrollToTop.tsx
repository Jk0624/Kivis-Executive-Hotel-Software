import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't scroll to the top if we're navigating to a hash.
    // ScrollToHash will handle that.
    if (hash) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
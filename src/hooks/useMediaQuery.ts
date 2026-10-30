import { useEffect, useState } from "react";

/** True while the viewport matches the CSS media query. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Phones: the redesign switches to its mobile layouts at 768px and below. */
export const useIsMobile = () => useMediaQuery("(max-width: 768px)");

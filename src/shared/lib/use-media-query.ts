import { useEffect, useState } from "react";

type Options = {
  defaultValue?: boolean;
};

export function useMediaQuery(query: string, options: Options = {}): boolean {
  const { defaultValue = false } = options;
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}


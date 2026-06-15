import { useEffect, useState } from "react";

interface WordRotateProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

/**
 * Cicla una parola con fade+slide. Coerente con stile brutalist (transizione netta, no easing morbidi lunghi).
 */
const WordRotate = ({ words, intervalMs = 2200, className = "" }: WordRotateProps) => {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (words.length <= 1) return;
    const outT = setTimeout(() => setPhase("out"), intervalMs - 220);
    const inT = setTimeout(() => {
      setI((p) => (p + 1) % words.length);
      setPhase("in");
    }, intervalMs);
    return () => {
      clearTimeout(outT);
      clearTimeout(inT);
    };
  }, [i, intervalMs, words.length]);

  // largest word reserves width to avoid layout jump
  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  return (
    <span className={`relative inline-block align-baseline ${className}`}>
      {/* ghost reserves space */}
      <span aria-hidden className="invisible whitespace-nowrap">{longest}</span>
      <span
        key={i}
        className={`absolute inset-0 whitespace-nowrap transition-all duration-200 ease-out ${
          phase === "in" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        {words[i]}
      </span>
    </span>
  );
};

export default WordRotate;

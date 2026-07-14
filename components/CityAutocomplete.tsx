"use client";

import { useEffect, useRef, useState } from "react";

type CitySuggestion = { label: string; lat: number; lng: number };

export default function CityAutocomplete({
  name,
  value,
  onChange,
  onSelectCoords,
  placeholder,
  className,
  style,
}: {
  name?: string;
  value: string;
  onChange: (v: string) => void;
  onSelectCoords?: (lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = value.trim();
    const isPostalCode = /^\d+$/.test(trimmed);

    if ((isPostalCode && trimmed.length < 5) || (!isPostalCode && trimmed.length < 3)) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const param = isPostalCode ? `codePostal=${trimmed}` : `nom=${encodeURIComponent(trimmed)}`;
        const res = await fetch(`https://geo.api.gouv.fr/communes?${param}&fields=nom,centre,codesPostaux&boost=population&limit=8`);
        const data = await res.json();
        const results: CitySuggestion[] = data.map((c: any) => ({
          label: isPostalCode ? `${c.nom} (${trimmed})` : c.nom,
          lat: c.centre?.coordinates?.[1],
          lng: c.centre?.coordinates?.[0],
        }));
        setSuggestions(results);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul
          className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-[6px] border shadow-lg"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--input-bg)" }}
        >
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.label.replace(/\s*\(\d+\)$/, ""));
                  if (s.lat && s.lng && onSelectCoords) onSelectCoords(s.lat, s.lng);
                  setOpen(false);
                }}
                className="block w-full px-3.5 py-2 text-left text-sm transition hover:bg-[#3E8EF7]/10"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

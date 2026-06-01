"use client";

import { useRef, useEffect } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

interface AddressInputProps {
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  onSelect: (place: { address: string; lat: number; lng: number }) => void;
  onClear: () => void;
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--line-strong)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 13,
  fontFamily: "var(--font-ui)",
  width: "100%",
  boxSizing: "border-box",
};

export default function AddressInput({ placeholder, value, onChange, onSelect, onClear }: AddressInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "ar" },
      language: "es",
    },
    debounce: 300,
    defaultValue: value,
  });

  // Sync external value changes (e.g. reset after adding stop)
  useEffect(() => {
    if (value !== inputValue) setValue(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setValue(text);
    onChange(text);
    if (!text) onClear();
  }

  async function handleSelect(description: string) {
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect({ address: description, lat, lng });
    } catch {
      // geocode failed — keep text but don't update coords
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        clearSuggestions();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [clearSuggestions]);

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1 }}>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInput}
        disabled={!ready}
        style={inputStyle}
        autoComplete="off"
      />
      {status === "OK" && data.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--line-strong)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 50,
            listStyle: "none",
            margin: 0,
            padding: 0,
            overflow: "hidden",
          }}
        >
          {data.map(({ place_id, description }: { place_id: string; description: string }) => (
            <li
              key={place_id}
              onMouseDown={() => handleSelect(description)}
              style={{
                padding: "8px 12px",
                fontSize: 13,
                fontFamily: "var(--font-ui)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-2, #f5f5f5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "";
              }}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

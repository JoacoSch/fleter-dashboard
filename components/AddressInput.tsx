"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface AddressInputProps {
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  onSelect: (place: { address: string; lat: number; lng: number }) => void;
  onClear: () => void;
}

export default function AddressInput({ placeholder, value, onChange, onSelect, onClear }: AddressInputProps) {
  const placesLib = useMapsLibrary("places");
  const ready = placesLib !== null;

  const [inputValue, setInputValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [suggestions, setSuggestions] = useState<google.maps.places.PlacePrediction[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value resets (e.g. after adding a stop). Patrón de React
  // "Adjusting state when a prop changes": se ajusta durante el render
  // comparando con el valor anterior, no dentro de un useEffect.
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value);
  }

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!ready || !text.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const { suggestions: results } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: text,
            includedRegionCodes: ["ar"],
            locationBias: { south: -34.706, north: -34.527, west: -58.532, east: -58.335 },
          });
        setSuggestions(results.map((s) => s.placePrediction!));
      } catch {
        setSuggestions([]);
      }
    },
    [ready]
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setInputValue(text);
    onChange(text);
    if (!text) {
      setSuggestions([]);
      onClear();
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  }

  async function handleSelect(prediction: google.maps.places.PlacePrediction) {
    const text = prediction.text.toString();
    setInputValue(text);
    setSuggestions([]);
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["location", "displayName"] });
      const lat = place.location!.lat();
      const lng = place.location!.lng();
      onSelect({ address: text, lat, lng });
    } catch {
      // fetchFields failed — keep text but don't update coords
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="autocomplete">
      <input
        type="text"
        className="input"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInput}
        disabled={!ready}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="autocomplete__lista">
          {suggestions.map((prediction) => {
            const key = prediction.placeId;
            const label = prediction.text.toString();
            return (
              <li
                key={key}
                className="autocomplete__item"
                onMouseDown={() => handleSelect(prediction)}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "roadmap-openai-api-key";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setApiKeyState(stored);
    setIsLoaded(true);
  }, []);

  const setApiKey = useCallback((key: string | null) => {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setApiKeyState(key);
  }, []);

  return { apiKey, setApiKey, isLoaded };
}

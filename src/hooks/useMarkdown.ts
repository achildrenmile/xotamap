import { useState, useEffect } from 'react';
import { useI18n } from '../i18n';

interface UseMarkdownResult {
  content: string | null;
  loading: boolean;
  error: string | null;
}

// Module-level cache: key = `{lang}/{slug}` → content string
const cache = new Map<string, string>();

export function useMarkdown(programCodeSlug: string): UseMarkdownResult {
  const { language } = useI18n();
  const cacheKey = `${language}/${programCodeSlug}`;

  const [content, setContent] = useState<string | null>(
    cache.has(cacheKey) ? (cache.get(cacheKey) ?? null) : null,
  );
  const [loading, setLoading] = useState(!cache.has(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programCodeSlug) return;

    const key = `${language}/${programCodeSlug}`;

    if (cache.has(key)) {
      setContent(cache.get(key) ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const url = `/data/encyclopedia/${language}/${programCodeSlug}.md`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        cache.set(key, text);
        setContent(text);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load article');
        setContent(null);
        setLoading(false);
      });
  }, [language, programCodeSlug]);

  return { content, loading, error };
}

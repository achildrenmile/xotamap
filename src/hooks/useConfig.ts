import { useState, useEffect } from 'react';

export interface AppConfig {
  siteName: string;
  siteDescription: string;
  parentSiteName: string;
  parentSiteUrl: string;
  parentSiteLogo: string;
  version: string;
}

const defaultConfig: AppConfig = {
  siteName: 'xOTA Map',
  siteDescription: 'Multi-Program xOTA Activations Map',
  parentSiteName: '',
  parentSiteUrl: '',
  parentSiteLogo: '',
  version: '0.1.0',
};

let cachedConfig: AppConfig | null = null;
let configPromise: Promise<AppConfig> | null = null;

async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = fetch('/config.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Config not found');
      }
      return response.json();
    })
    .then((data) => {
      cachedConfig = {
        siteName: data.siteName || defaultConfig.siteName,
        siteDescription: data.siteDescription || defaultConfig.siteDescription,
        parentSiteName: data.parentSiteName || defaultConfig.parentSiteName,
        parentSiteUrl: data.parentSiteUrl || defaultConfig.parentSiteUrl,
        parentSiteLogo: data.parentSiteLogo || defaultConfig.parentSiteLogo,
        version: data.version || defaultConfig.version,
      };
      return cachedConfig;
    })
    .catch(() => {
      cachedConfig = defaultConfig;
      return cachedConfig;
    });

  return configPromise;
}

export function useConfig(): { config: AppConfig; loading: boolean; error: string | null } {
  const [config, setConfig] = useState<AppConfig>(cachedConfig || defaultConfig);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setLoading(false);
      return;
    }

    loadConfig()
      .then((loadedConfig) => {
        setConfig(loadedConfig);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load config');
        setConfig(defaultConfig);
        setLoading(false);
      });
  }, []);

  return { config, loading, error };
}

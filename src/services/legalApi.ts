import { legalConfig } from '../config/legalConfig';

export interface LegalText {
  content: string;
  lastUpdated: string;
}

interface CachedLegalText extends LegalText {
  cachedAt: number;
}

const CACHE_PREFIX = 'legal_text_';
const FALLBACK_PREFIX = 'legal_fallback_';

class LegalApiService {
  private async fetchFromApi(endpoint: string): Promise<LegalText | null> {
    if (!legalConfig.enabled || !legalConfig.isConfigured()) {
      return null;
    }

    try {
      const type = endpoint.split('/').pop() || 'impressum';
      const url = `${legalConfig.apiUrl}${endpoint}?token=${legalConfig.apiToken}&shopid=${legalConfig.shopId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.error) {
        return null;
      }

      return {
        content: data.content || data || '',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  private getCachedText(key: string): LegalText | null {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const data: CachedLegalText = JSON.parse(cached);
      const now = Date.now();

      if (now - data.cachedAt > legalApiConfig.cacheExpiration) {
        return null;
      }

      return {
        content: data.content,
        lastUpdated: data.lastUpdated,
      };
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  private setCachedText(key: string, text: LegalText): void {
    try {
      const cached: CachedLegalText = {
        ...text,
        cachedAt: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
      localStorage.setItem(FALLBACK_PREFIX + key, JSON.stringify(text));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  private getFallbackText(key: string): LegalText | null {
    try {
      const fallback = localStorage.getItem(FALLBACK_PREFIX + key);
      if (!fallback) return null;
      return JSON.parse(fallback);
    } catch (error) {
      console.error('Fallback read error:', error);
      return null;
    }
  }

  async getLegalText(type: 'impressum' | 'datenschutz' | 'agb'): Promise<LegalText | null> {
    const cached = this.getCachedText(type);
    if (cached) {
      return cached;
    }

    const endpoint = legalApiConfig.endpoints[type];
    const apiText = await this.fetchFromApi(endpoint);

    if (apiText) {
      this.setCachedText(type, apiText);
      return apiText;
    }

    return this.getFallbackText(type);
  }

  setFallbackText(type: 'impressum' | 'datenschutz' | 'agb', content: string): void {
    const fallbackText: LegalText = {
      content,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(FALLBACK_PREFIX + type, JSON.stringify(fallbackText));
  }

  clearCache(type?: 'impressum' | 'datenschutz' | 'agb'): void {
    if (type) {
      localStorage.removeItem(CACHE_PREFIX + type);
    } else {
      ['impressum', 'datenschutz', 'agb'].forEach((key) => {
        localStorage.removeItem(CACHE_PREFIX + key);
      });
    }
  }

  async refreshAllTexts(): Promise<void> {
    this.clearCache();
    await Promise.all([
      this.getLegalText('impressum'),
      this.getLegalText('datenschutz'),
      this.getLegalText('agb'),
    ]);
  }
}

export const legalApiService = new LegalApiService();

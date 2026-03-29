export const GEMINI_DEFAULT_MODEL = 'gemini-2.0-flash';

const STORAGE_KEY_API = 'queryforge.geminiApiKey';
const STORAGE_KEY_MODEL = 'queryforge.geminiModel';

export function loadGeminiSettingsFromStorage(): { apiKey: string; model: string } {
  if (typeof window === 'undefined') {
    return { apiKey: '', model: GEMINI_DEFAULT_MODEL };
  }
  return {
    apiKey: localStorage.getItem(STORAGE_KEY_API) ?? '',
    model: localStorage.getItem(STORAGE_KEY_MODEL) ?? GEMINI_DEFAULT_MODEL,
  };
}

export function persistGeminiApiKey(value: string) {
  if (typeof window === 'undefined') return;
  if (value.trim()) localStorage.setItem(STORAGE_KEY_API, value);
  else localStorage.removeItem(STORAGE_KEY_API);
}

export function persistGeminiModel(value: string) {
  if (typeof window === 'undefined') return;
  const v = value.trim() || GEMINI_DEFAULT_MODEL;
  localStorage.setItem(STORAGE_KEY_MODEL, v);
}

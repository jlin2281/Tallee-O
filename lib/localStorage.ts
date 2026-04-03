import { SplitSession, CalculationResult } from '@/types';

const SESSION_KEY = 'tallee-o-session';
const RESULT_KEY = 'tallee-o-result';
const THEME_KEY = 'tallee-o-theme';

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Use sessionStorage for guest mode to isolate tabs and clear on session close
export function saveSession(session: SplitSession): void {
  if (!isBrowser) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session to sessionStorage:', error);
  }
}

export function loadSession(): SplitSession | null {
  if (!isBrowser) return null;
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load session from sessionStorage:', error);
    return null;
  }
}

export function clearSession(): void {
  if (!isBrowser) return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session from sessionStorage:', error);
  }
}

export function saveCalculationResult(result: CalculationResult): void {
  if (!isBrowser) return;
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch (error) {
    console.error('Failed to save calculation result to sessionStorage:', error);
  }
}

export function loadCalculationResult(): CalculationResult | null {
  if (!isBrowser) return null;
  try {
    const data = sessionStorage.getItem(RESULT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load calculation result from sessionStorage:', error);
    return null;
  }
}

// Theme should still use localStorage to persist across sessions
export function saveTheme(theme: 'light' | 'dark'): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

export function loadTheme(): 'light' | 'dark' | null {
  if (!isBrowser) return null;
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error);
    return null;
  }
}

import { Injectable, signal, effect, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'calendar_theme';

  private themePreference = signal<Theme | 'system'>(this.loadPreference());
  private systemPrefersDark = signal(this.getSystemPreference());

  readonly currentTheme = computed<Theme>(() => {
    const pref = this.themePreference();
    if (pref === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return pref;
  });

  readonly preference = this.themePreference.asReadonly();
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    this.setupSystemPreferenceListener();

    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  private loadPreference(): Theme | 'system' {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'system';
  }

  private getSystemPreference(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private setupSystemPreferenceListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      this.systemPrefersDark.set(e.matches);
    });
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(`${theme}-theme`);
    root.style.colorScheme = theme;
  }

  setTheme(theme: Theme | 'system'): void {
    this.themePreference.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}

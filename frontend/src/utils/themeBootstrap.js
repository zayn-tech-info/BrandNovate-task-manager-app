// Apply saved theme to <html> before first paint (default dark).
export function applyThemeFromStorage() {
  const stored = localStorage.getItem('theme');
  const useDark = stored !== 'light';
  document.documentElement.classList.toggle('dark', useDark);
}

export function setDocumentTheme(mode) {
  const isDark = mode === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', mode);
}

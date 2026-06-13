import { useTheme, getThemeIcon, getThemeLabel } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      onClick={cycleTheme}
      className="relative w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-[var(--bg-secondary)]"
      title={getThemeLabel(theme)}
      aria-label={`Current theme: ${getThemeLabel(theme)}. Click to cycle themes.`}
    >
      {getThemeIcon(theme)}
    </button>
  );
}

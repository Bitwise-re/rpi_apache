// JS for CSS palette (colour theme)

const THEME_KEY = "theme";

const applyTheme = (theme) => {
    const isDark = theme === "dark";

    document.documentElement.classList.toggle("dark", isDark);

    // Keep the toggle label in sync with the active theme.
    const label = document.querySelector("#theme-choice span");
    if (label) {
        label.textContent = isDark ? "Dark" : "Light";
    }
};

const swapTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const theme = isDark ? "light" : "dark";

    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
};

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

    applyTheme(savedTheme || (systemPrefersLight ? "dark" : "light"));

    // Pass the function itself; calling it here would toggle the theme on load.
    $("#theme-choice").on("click", swapTheme);
});

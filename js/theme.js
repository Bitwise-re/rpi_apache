// JS for CSS palette (colour theme)

const THEME_KEY = "theme";

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.classList.toggle("dark", isDark);

    // Keep the toggle label in sync with the active theme.
    const label = document.querySelector("#theme-choice span");
    if (label) {
        label.textContent = isDark ? "Dark" : "Light";
    }
}

function swapTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    const theme = isDark ? "light" : "dark";

    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
}

$(document).ready(function () {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(savedTheme || (systemPrefersDark ? "dark" : "light"));

    // Pass the function itself; calling it here would toggle the theme on load.
    $("#theme-choice").on("click", swapTheme);
});

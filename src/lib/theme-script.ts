export const THEME_STORAGE_KEY = "theme";

/** Inline FOUC script for RootLayout (runs before paint). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=t==="dark"||(t==="system"&&d)?"dark":"light";var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`;

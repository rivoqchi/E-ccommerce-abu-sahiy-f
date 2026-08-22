/** Best-effort screenshot shortcut detection. OS hardware buttons are not visible to the web. */
export function isScreenshotShortcut(event: KeyboardEvent): boolean {
  const key = event.key;
  if (key === "PrintScreen" || key === "Print") return true;

  const code = event.code;
  if (code === "PrintScreen") return true;

  const digit = key.replace("Digit", "");
  const macCapture =
    event.metaKey &&
    event.shiftKey &&
    ["3", "4", "5", "#", "$", "%"].includes(digit);
  if (macCapture) return true;

  const winKey =
    event.getModifierState("OS") || event.getModifierState("Super");
  if (winKey && event.shiftKey && key.toLowerCase() === "s") return true;

  return false;
}

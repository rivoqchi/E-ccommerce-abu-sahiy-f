/** Next.js 16 throws if replace/push runs before the App Router action queue exists. */
function isRouterNotReady(err: unknown): boolean {
  return (
    err instanceof Error &&
    err.message.includes("Router action dispatched before initialization")
  );
}

export function safeReplace(
  router: { replace: (href: string) => void },
  href: string,
) {
  if (typeof window === "undefined") return;

  const go = () => {
    try {
      router.replace(href);
    } catch (err) {
      if (isRouterNotReady(err)) {
        window.location.replace(href);
        return;
      }
      throw err;
    }
  };

  window.requestAnimationFrame(() => {
    window.setTimeout(go, 0);
  });
}

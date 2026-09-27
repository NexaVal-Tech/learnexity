// Warn before leaving a CMS editor with unsaved changes (tab close,
// reload, or in-app navigation).
import { useEffect } from "react";
import { useRouter } from "next/router";

export function useUnsavedGuard(dirty: boolean) {
  const router = useRouter();

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const onRouteChange = (url: string) => {
      if (!dirty || url === router.asPath) return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        router.events.emit("routeChangeError");
        // Cancelling a Next.js route change requires throwing.
        throw "Route change cancelled (unsaved CMS changes)";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    router.events.on("routeChangeStart", onRouteChange);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      router.events.off("routeChangeStart", onRouteChange);
    };
  }, [dirty, router]);
}

/** Ctrl/Cmd + S to save. */
export function useSaveShortcut(save: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, enabled]);
}

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function useAuthTokenSync() {
  const router = useRouter();

  useEffect(() => {
    const token = router.query.token as string | undefined;

    if (token) {
      localStorage.setItem("token", token);
      router.replace(router.pathname); // cleans URL, stays on same page
    }
  }, [router.query]);
}

import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { checkAndTrackUsage } from "../services/usageLimiter";

/**
 * Hook to check and enforce usage limits before running a tool.
 * Usage:
 *   const { checkLimit, limitError, clearLimitError } = useUsageLimit("breach");
 *   const run = async () => {
 *     const ok = await checkLimit();
 *     if (!ok) return; // limitError will be set
 *     // proceed with tool
 *   };
 */
export function useUsageLimit(toolId) {
  const { user } = useAuth();
  const [limitError, setLimitError] = useState(null);

  const checkLimit = useCallback(async () => {
    if (!user?.uid) {
      setLimitError("Please log in to use this tool.");
      return false;
    }
    const plan = user.plan || "free";
    const result = await checkAndTrackUsage(user.uid, plan, toolId);
    if (!result.allowed) {
      setLimitError(
        `Daily ${result.category} limit reached (${result.limit}/${result.limit}). Upgrade your plan for more.`
      );
      return false;
    }
    setLimitError(null);
    return true;
  }, [user, toolId]);

  const clearLimitError = useCallback(() => setLimitError(null), []);

  return { checkLimit, limitError, clearLimitError };
}

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  componentName: string;
}

interface UsePerformanceOptions {
  componentName: string;
  enabled?: boolean;
}

export function usePerformance({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
}: UsePerformanceOptions) {
  const startTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  const markStart = useCallback(() => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
  }, [enabled]);

  const markEnd = useCallback(
    (operation: string) => {
      if (!enabled || !startTimeRef.current) return;

      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;

      // Reset for next measurement
      startTimeRef.current = 0;
    },
    [enabled, componentName]
  );

  const measureAsync = useCallback(
    async <T>(
      operation: string,
      asyncFunction: () => Promise<T>
    ): Promise<T> => {
      if (!enabled) {
        return asyncFunction();
      }

      const start = performance.now();
      try {
        const result = await asyncFunction();
        const end = performance.now();

        return result;
      } catch (error) {
        const end = performance.now();

        throw error;
      }
    },
    [enabled, componentName]
  );

  // Measure component mount time
  useEffect(() => {
    if (!enabled) return;

    mountTimeRef.current = performance.now();

    return () => {
      if (mountTimeRef.current) {
        const unmountTime = performance.now();
        const mountDuration = unmountTime - mountTimeRef.current;
      }
    };
  }, [enabled, componentName]);

  // Report Web Vitals in development
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Core Web Vitals reporting
    const reportWebVitals = (metric: any) => {};

    // Dynamically import web-vitals if available
    import('web-vitals')
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(reportWebVitals);
        onINP(reportWebVitals);
        onFCP(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
      })
      .catch(() => {
        // web-vitals not installed, skip
      });
  }, [enabled]);

  return {
    markStart,
    markEnd,
    measureAsync,
  };
}

// Hook for measuring render performance
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    renderCountRef.current += 1;
    const currentTime = performance.now();

    if (lastRenderTimeRef.current > 0) {
      const timeSinceLastRender = currentTime - lastRenderTimeRef.current;
    }

    lastRenderTimeRef.current = currentTime;
  });

  return {
    renderCount: renderCountRef.current,
  };
}

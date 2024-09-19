import { useCallback, useEffect } from "react";

export function RefreshPreviewAreaHeight({
  interval = 3000,
  textareaSelector = ".markdown-textarea",
}: {
  interval?: number;
  textareaSelector?: string;
}) {
  const refreshHeight = useCallback(() => {
    const textarea =
      document.querySelector<HTMLTextAreaElement>(textareaSelector);
    const preview = document.querySelector<HTMLDivElement>(".markdown-preview");

    if (textarea && preview) {
      const delta = Math.abs(textarea.clientHeight - preview.clientHeight);
      if (delta > 30) {
        preview.style.height = `${textarea.clientHeight - 30}px`;
      }
    }
  }, [textareaSelector]);

  useEffect(() => {
    // Run, once, immediately on first mount
    refreshHeight();

    const timer = setInterval(refreshHeight, interval);
    return () => clearInterval(timer);
  }, [interval, refreshHeight]);

  return null;
}

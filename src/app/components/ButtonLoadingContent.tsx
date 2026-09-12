import type { ReactNode } from "react";

export function ButtonLoadingContent({
  children,
  size = 16,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-2 leading-none">
      <span
        className="inline-block shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span>{children}</span>
    </span>
  );
}

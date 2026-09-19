"use client";

import { flagUrl } from "@/lib/constants";

export function Flag({
  cca2,
  className = "",
}: {
  cca2: string;
  className?: string;
}) {
  return (
    <img
      src={flagUrl(cca2)}
      alt=""
      loading="lazy"
      draggable={false}
      className={`${className} bg-white/10`}
    />
  );
}
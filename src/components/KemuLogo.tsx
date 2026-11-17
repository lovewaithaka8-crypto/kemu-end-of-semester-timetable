import { useState } from "react";
import { Upload } from "lucide-react";

interface KemuLogoProps {
  src?: string | null;
  size?: "sm" | "md" | "lg";
  onRequestUpload?: () => void;
  className?: string;
}

export function KemuLogo({
  src,
  size = "md",
  onRequestUpload,
  className = "",
}: KemuLogoProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = src || "/assets/kemu-logo.png";

  const dimensionClasses =
    size === "sm"
      ? "w-10 h-10 p-1"
      : size === "lg"
        ? "w-16 h-16 p-1.5"
        : "w-12 h-12 p-1";

  if (hasError) {
    return (
      <div
        className={`${dimensionClasses} rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 ${className}`}
      >
        {onRequestUpload ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequestUpload();
            }}
            title="Upload official KeMU logo (PNG/SVG)"
            className="flex flex-col items-center justify-center text-[10px] font-semibold text-[#871054] hover:text-[#6D0D44]"
          >
            <Upload className="w-3.5 h-3.5 mb-0.5" aria-hidden="true" />
            <span>Logo</span>
          </button>
        ) : (
          <span className="text-[11px] font-bold text-[#871054]">KeMU</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${dimensionClasses} rounded-full bg-white border border-[#D6B34A] flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${className}`}
    >
      <img
        src={resolvedSrc}
        alt="Kenya Methodist University Official Crest"
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

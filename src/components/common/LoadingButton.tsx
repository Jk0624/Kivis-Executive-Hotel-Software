import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, Check } from "lucide-react";

interface LoadingButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  success?: boolean;
  loadingText?: string;
  successText?: string;
  children: ReactNode;
}

export default function LoadingButton({
  loading = false,
  success = false,
  loadingText = "Processing...",
  successText = "Completed",
  children,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || loading || success;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-5
        py-3
        font-semibold
        transition-all
        duration-300
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-70
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : success ? (
        <>
          <Check className="h-5 w-5" />
          <span>{successText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
import { cn } from "@/client/lib/cn";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-label={name}
      className={cn(
        "rounded-pill bg-brand-700 inline-flex items-center justify-center font-bold text-white select-none",
        SIZE_CLASSES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

import { CarPlaceholder } from "./CarPlaceholder";

export function CarPhoto({
  photoUrl,
  accent,
  className = "",
  alt = "",
  fit = "cover",
}: {
  photoUrl?: string;
  accent?: string;
  className?: string;
  alt?: string;
  fit?: "cover" | "contain";
}) {
  if (!photoUrl) {
    return <CarPlaceholder accent={accent} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={alt}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    />
  );
}

import { CarPlaceholder } from "./CarPlaceholder";

export function CarPhoto({
  photoUrl,
  accent,
  className = "",
  alt = "",
}: {
  photoUrl?: string;
  accent?: string;
  className?: string;
  alt?: string;
}) {
  if (!photoUrl) {
    return <CarPlaceholder accent={accent} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={alt}
      className={`object-cover ${className}`}
    />
  );
}

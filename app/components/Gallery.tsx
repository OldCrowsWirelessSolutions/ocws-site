import Image from "next/image";

type GalleryProps = {
  images: string[];
  altBase: string;
};

export default function Gallery({ images, altBase }: GalleryProps) {
  const safe = images.slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {safe.map((src, idx) => (
        <div
          key={src}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40"
        >
          <div className="relative h-56 w-full">
            <Image
              src={src}
              alt={`${altBase} image ${idx + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-90"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={idx === 0}
            />

            {/* Strong gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Optional label overlay (future-proofed) */}
            <div className="pointer-events-none absolute bottom-0 w-full bg-black/70 p-3">
              <p className="text-xs text-white/80 drop-shadow-sm">
                {altBase} — image {idx + 1}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

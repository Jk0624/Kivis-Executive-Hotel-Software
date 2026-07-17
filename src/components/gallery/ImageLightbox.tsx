import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";


interface GalleryImage {
  id: number;
  title: string;
  category: string;
  image: string;
}

interface ImageLightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: ImageLightboxProps) {
  const image = images[currentIndex];

  useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowLeft":
        onPrevious();
        break;
      case "ArrowRight":
        onNext();
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [onClose, onNext, onPrevious]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
        >
          <X size={24} />
        </button>

        {/* Previous */}
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40"
        >
          <ChevronLeft size={30} />
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40"
        >
          <ChevronRight size={30} />
        </button>

        {/* Image */}
        <img
          src={image.image}
          alt={image.title}
          className="max-h-[80vh] w-full rounded-xl object-contain"
        />

        {/* Caption */}
        <div className="mt-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">{image.title}</h2>
            <p className="text-yellow-400">{image.category}</p>
          </div>

          <p>
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}
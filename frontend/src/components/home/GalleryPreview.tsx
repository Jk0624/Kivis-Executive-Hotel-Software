import { Link } from "react-router-dom";

const images = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900",
];

function GalleryPreview() {
  return (
    <section
      id="gallery"
      className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500 sm:text-sm">
            Gallery
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:mt-4 sm:text-4xl">
            Experience Kiviz Executive Hotel
          </h2>

          <div className="mt-4 flex flex-col items-center sm:mt-5">
            <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Take a glimpse into our elegant rooms,
              modern facilities, and welcoming
              atmosphere.
            </p>

            <Link
              to="/gallery"
              className="mt-3 font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
            >
              View Full Gallery →
            </Link>
          </div>
        </div>

        {/* Gallery Grid */}

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:mt-16 md:grid-cols-4">
          <img
            src={images[0]}
            alt="Gallery"
            className="col-span-2 row-span-2 h-64 w-full rounded-2xl object-cover shadow-lg sm:h-80 md:h-[420px]"
          />

          {images.slice(1).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Gallery ${index + 2}`}
              className="h-32 w-full rounded-2xl object-cover shadow-md transition duration-300 hover:scale-105 sm:h-40 md:h-48"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default GalleryPreview;
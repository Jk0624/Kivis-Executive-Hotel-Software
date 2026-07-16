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
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">

        <div className="text-center">

  <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
    Gallery
  </p>

  <h2 className="mt-4 text-4xl font-bold text-slate-900">
    Experience Kiviz Executive Hotel
  </h2>

        <div className="mt-5 flex flex-col items-center">

            <p className="max-w-3xl text-lg text-slate-600">
            Take a glimpse into our elegant rooms, modern facilities,
            and welcoming atmosphere.
            </p>

            <Link
            to="/gallery"
            className="mt-2 font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
            >
            View Full Gallery →
            </Link>

        </div>

        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">

          <img
            src={images[0]}
            alt="Gallery"
            className="col-span-2 row-span-2 h-[420px] w-full rounded-2xl object-cover shadow-lg"
          />

          {images.slice(1).map((image, index) => (
            <img
              key={index}
              src={image}
              alt="Gallery"
              className="h-48 w-full rounded-2xl object-cover shadow-md transition duration-300 hover:scale-105"
            />
          ))}

        </div>

      </div>
    </section>
  );
}

export default GalleryPreview;
import { useState } from "react";
import { Eye } from "lucide-react";

import MainLayout from "../../layouts/MainLayout";
import ImageLightbox from "../../components/gallery/ImageLightbox";

import { galleryImages } from "../../data/galleryImages";

function Gallery() {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedImageIndex, setSelectedImageIndex] =
    useState<number | null>(null);

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter(
          (image) =>
            image.category === selectedCategory
        );

  return (
    <MainLayout>
      <section className="bg-slate-50 px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Gallery
            </p>

            <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Explore Kiviz Executive Lodge
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Browse our collection of rooms,
              facilities and hotel spaces designed to
              provide comfort, elegance and a
              memorable stay.
            </p>
          </div>

          {/* Categories */}

          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:mt-12">
            {[
              "All",
              "Hotel Exterior",
              "Rooms & Suites",
              "Restaurant & Dining",
              "Amenities & Facilities",
              "Conference & Events",
            ].map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 sm:px-5 ${
                  selectedCategory === category
                    ? "bg-yellow-500 text-white shadow-lg"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-yellow-500 hover:bg-yellow-500 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}

          <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                onClick={() =>
                  setSelectedImageIndex(index)
                }
                className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.image}
                    alt={image.title}
                    className="h-60 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-72"
                  />

                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 opacity-0 transition duration-500 group-hover:opacity-100">
                    <p className="text-xs font-medium uppercase tracking-widest text-yellow-400 sm:text-sm">
                      {image.category}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-white sm:text-xl">
                      {image.title}
                    </h3>

                    <div className="mt-4 flex items-center gap-2 text-white">
                      <Eye size={18} />

                      <span className="text-sm font-medium">
                        View Photo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImageIndex !== null && (
        <ImageLightbox
          images={filteredImages}
          currentIndex={selectedImageIndex}
          onClose={() =>
            setSelectedImageIndex(null)
          }
          onNext={() =>
            setSelectedImageIndex(
              (selectedImageIndex + 1) %
                filteredImages.length
            )
          }
          onPrevious={() =>
            setSelectedImageIndex(
              (selectedImageIndex -
                1 +
                filteredImages.length) %
                filteredImages.length
            )
          }
        />
      )}
    </MainLayout>
  );
}

export default Gallery;
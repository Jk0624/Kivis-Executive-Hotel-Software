import MainLayout from "../../layouts/MainLayout";
import { galleryImages } from "../../data/galleryImages";
import { useState } from "react";
import { Eye } from "lucide-react";
import ImageLightbox from "../../components/gallery/ImageLightbox";

function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
  null
);


  const filteredImages =
  selectedCategory === "All"
    ? galleryImages
    : galleryImages.filter(
        (image) => image.category === selectedCategory
      );
  return (
    <MainLayout>

      <section className="bg-slate-50 px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Gallery
            </p>

            <h1 className="mt-4 text-5xl font-bold text-slate-900">
              Explore Kiviz Executive Lodge
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
              Browse our collection of rooms, facilities and hotel spaces
              designed to provide comfort, elegance and a memorable stay.
            </p>

          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
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
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition duration-300 ${
                  selectedCategory === category
                    ? "bg-yellow-500 text-white shadow-lg"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-yellow-500 hover:bg-yellow-500 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map((image,index) => (
              <div
                key={image.id}
                onClick={() => setSelectedImageIndex(index)}
                className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative overflow-hidden">
                    <img
                      src={image.image}
                      alt={image.title}
                      className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 opacity-0 transition duration-500 group-hover:opacity-100">
                      <p className="text-sm font-medium uppercase tracking-widest text-yellow-400">
                        {image.category}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-white">
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

                <div className="h-2"></div>
              </div>
            ))}
          </div>





        </div>

      </section>


      {selectedImageIndex !== null && (
  <ImageLightbox
    images={filteredImages}
    currentIndex={selectedImageIndex}
    onClose={() => setSelectedImageIndex(null)}
    onNext={() =>
      setSelectedImageIndex(
        (selectedImageIndex + 1) % filteredImages.length
      )
    }
    onPrevious={() =>
      setSelectedImageIndex(
        (selectedImageIndex - 1 + filteredImages.length) %
          filteredImages.length
      )
    }
  />
)}

    </MainLayout>
  );
}

export default Gallery;
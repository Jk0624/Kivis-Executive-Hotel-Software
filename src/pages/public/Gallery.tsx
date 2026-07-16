import MainLayout from "../../layouts/MainLayout";

function Gallery() {
  return (
    <MainLayout>

      <section className="bg-slate-50 px-6 py-24">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
              Gallery
            </p>

            <h1 className="mt-4 text-5xl font-bold text-slate-900">
              Explore Kiviz Executive Hotel
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
              Browse our collection of rooms, facilities and hotel spaces
              designed to provide comfort, elegance and a memorable stay.
            </p>

          </div>

        </div>

      </section>

    </MainLayout>
  );
}

export default Gallery;
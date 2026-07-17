import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0,0.82), rgba(0,0,0,0.55), rgba(0,0,0,0.25)), url('https://images.unsplash.com/photo-1455587734955-081b22074882')",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-lg font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Experience Smart Luxury
          </p>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Welcome to
            <br />
            <span className="text-yellow-400">
              Kiviz Executive Hotel
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-9 text-slate-200">
            Enjoy elegant accommodation powered by secure smart room access,
            exceptional hospitality, and modern comfort designed to make every
            stay unforgettable.
          </p>

          <div className="mt-12 flex flex-wrap gap-5">
            <button
              onClick={() => navigate("/rooms")}
              className="rounded-xl bg-yellow-500 px-8 py-4 text-lg font-semibold text-white transition duration-300 hover:bg-yellow-400"
            >
              Book Your Stay
            </button>

            <button
              onClick={() => navigate("/gallery")}
              className="rounded-xl border border-white px-8 py-4 text-lg font-semibold text-white transition duration-300 hover:bg-white hover:text-slate-900"
            >
              View Gallery
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
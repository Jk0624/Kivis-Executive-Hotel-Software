import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="flex min-h-screen items-center justify-center bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6"
    >
      <div className="mx-auto max-w-5xl text-center">

        <p className="text-lg font-semibold uppercase tracking-[0.3em] text-yellow-400">
          Experience Smart Luxury
        </p>

        <h1 className="mt-6 text-6xl font-extrabold leading-tight text-white md:text-7xl">
          Welcome to
          <br />
          <span className="text-yellow-400">
            Kiviz Executive Hotel
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-300">
          Enjoy elegant accommodation powered by secure smart room access,
          exceptional hospitality, and modern comfort designed to make every
          stay unforgettable.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-5">

          <button
            onClick={() => navigate("/rooms")}
            className="rounded-xl bg-yellow-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-yellow-400"
          >
            Book Your Stay
          </button>

          <button
            onClick={() => navigate("/rooms")}
            className="rounded-xl border border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white hover:text-slate-900">
            Explore Rooms
          </button>
          

        </div>

      </div>
    </section>
  );
}

export default Hero;
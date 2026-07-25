import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ShieldCheck,
  Wifi,
  Clock3,
} from "lucide-react";
import heroImage from "../../assets/gallery/kivis-lodge-exterior.jpeg";

function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(
          to right,
          rgba(0,0,0,0.72),
          rgba(0,0,0,0.48),
          rgba(0,0,0,0.18)
        ), url(${heroImage})`,
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-center px-5 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Tagline */}

          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-400 sm:text-sm md:text-base md:tracking-[0.45em]">
            Luxury • Comfort • Excellence
          </p>

          {/* Heading */}

          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Luxury Stays.
            <br />
            Exceptional Comfort.
            <br />
            <span className="text-yellow-400">
              Every Time.
            </span>
          </h1>

          {/* Description */}

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8 lg:text-xl">
            Welcome to{" "}
            <strong>Kiviz Executive Lodge</strong>,
            where elegant accommodation,
            secure smart room access,
            exceptional hospitality, and
            modern comfort come together to
            create memorable experiences for
            every guest.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <button
              onClick={() =>
                navigate("/rooms")
              }
              className="w-full rounded-xl bg-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800 sm:w-auto sm:text-lg"
            >
              Reserve Your Stay
            </button>

            <button
              onClick={() =>
                navigate("/gallery")
              }
              className="w-full rounded-xl border border-white px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white hover:text-slate-900 sm:w-auto sm:text-lg"
            >
              Explore Gallery
            </button>
          </div>

          {/* Trust Highlights */}

          <div className="mt-12 grid grid-cols-1 gap-5 text-slate-200 sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-yellow-400" />

              <span className="text-sm sm:text-base">
                Smart Room Access
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Wifi className="h-6 w-6 flex-shrink-0 text-yellow-400" />

              <span className="text-sm sm:text-base">
                Free High-Speed Wi-Fi
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock3 className="h-6 w-6 flex-shrink-0 text-yellow-400" />

              <span className="text-sm sm:text-base">
                24/7 Reception Service
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}

        <div className="mt-16 flex animate-bounce flex-col items-center text-slate-300 sm:mt-24">
          <span className="mb-2 text-xs uppercase tracking-[0.25em] sm:text-sm sm:tracking-[0.3em]">
            Scroll to Explore
          </span>

          <ChevronDown className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
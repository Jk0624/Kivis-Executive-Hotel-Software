import { useNavigate } from "react-router-dom";
import { ChevronDown, ShieldCheck, Wifi, Clock3 } from "lucide-react";
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
      <div className="mx-auto w-full max-w-7xl px-6 pt-24 pb-16 lg:px-8">
        <div className="max-w-3xl">

          {/* Tagline */}

          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-yellow-400 md:text-base">
            Luxury • Comfort • Excellence
          </p>

          {/* Heading */}

          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Luxury Stays.
            <br />
            Exceptional Comfort.
            <br />
            <span className="text-yellow-400">
              Every Time.
            </span>
          </h1>

          {/* Description */}

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
            Welcome to <strong>Kiviz Executive Lodge</strong>, where elegant
            accommodation, secure smart room access, exceptional hospitality,
            and modern comfort come together to create memorable experiences for
            every guest.
          </p>

          {/* Buttons */}

          <div className="mt-12 flex flex-wrap gap-5">
            <button
              onClick={() => navigate("/rooms")}
              className="rounded-xl bg-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-800"
            >
              Reserve Your Stay
            </button>

            <button
              onClick={() => navigate("/gallery")}
              className="rounded-xl border border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-slate-900"
            >
              Explore Gallery
            </button>
          </div>

          {/* Trust Highlights */}

          <div className="mt-14 flex flex-wrap gap-8 text-slate-200">

            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-yellow-400" />
              <span className="text-base">
                Smart Room Access
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Wifi className="h-6 w-6 text-yellow-400" />
              <span className="text-base">
                Free High-Speed Wi-Fi
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock3 className="h-6 w-6 text-yellow-400" />
              <span className="text-base">
                24/7 Reception Service
              </span>
            </div>

          </div>

        </div>

        {/* Scroll Indicator */}

        <div className="mt-24 flex flex-col items-center text-slate-300 animate-bounce">
          <span className="mb-2 text-sm uppercase tracking-[0.3em]">
            Scroll to Explore
          </span>

          <ChevronDown className="h-7 w-7" />
        </div>

      </div>
    </section>
  );
}

export default Hero;
import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 px-6 text-center">
    
      <h1 className="text-6xl font-bold text-white">
        Kivis Executive Hotel
      </h1>

      <p className="mt-6 text-2xl font-medium text-yellow-400">
        Luxury • Comfort • Excellence
      </p>

      <p className="mt-4 max-w-2xl text-center text-lg leading-8 text-gray-200">
        Experience premium hospitality with elegant rooms,
        exceptional service, and smart room access technology.
      </p>
      <button
        onClick={() => navigate("/rooms")}
        className="mt-10 rounded-xl bg-yellow-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:shadow-2xl"
        >
        Book Your Stay
    </button>

    </section>
  );
}

export default Hero;
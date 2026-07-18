import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Phone, PhoneCall, X } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";

function SignIn() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  return (
    <MainLayout>
      <section
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-6 py-12"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Glass Card */}
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

          {/* Cancel Button */}
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full p-2 text-white transition duration-300 hover:scale-110 hover:bg-white/20"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Header */}
          <div className="text-center">

            <h1 className="text-3xl font-bold text-white">
              Kiviz Executive Lodge
            </h1>

            <p className="mt-2 text-sm tracking-[0.25em] text-yellow-400">
              Luxury • Comfort • Excellence
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-white">
              Welcome Back
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-200">
              Sign in to continue with your booking.
            </p>

          </div>

          {/* Form */}

          <form
            className="mt-8 space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();

              if (!phone) {
                alert("Please enter your phone number.");
                return;
              }

              try {
                await axios.post("http://localhost:3001/auth/request-otp", {
                  phone,
                });

                navigate("/verify-otp", {
                  state: {
                    flow: "signin",
                    phone,
                  },
                });
              } catch (error) {
                console.error(error);
                alert("Failed to send OTP. Please try again.");
              }
            }}
            >

            {/* Phone Number */}

            <div>

              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-white"
              >
                Phone Number
              </label>

              <div className="relative">

                <Phone
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                />

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-300 outline-none backdrop-blur-md transition focus:border-yellow-400" required
                />

              </div>

            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 text-lg font-semibold text-white transition hover:bg-yellow-400"
            >
              <PhoneCall size={20} />
              Verify Phone Number
            </button>

          </form>

          <p className="mt-8 text-center text-sm text-gray-200">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-yellow-400 hover:underline"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </section>
    </MainLayout>
  );
}

export default SignIn;
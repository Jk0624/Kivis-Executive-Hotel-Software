import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Phone, PhoneCall, X } from "lucide-react";

import MainLayout from "../../layouts/MainLayout";
import LoadingButton from "../../components/common/LoadingButton";
import api from "../../services/api";

function SignIn() {
  const navigate = useNavigate();

  const location = useLocation();

  const redirect =
    new URLSearchParams(location.search).get("redirect");

  const [phone, setPhone] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setPhoneError("Please enter your phone number.");
      return;
    }

    setPhoneError("");
    setSendingCode(true);

    try {
      await api.post(
        "/auth/request-otp",
        {
          phone: trimmedPhone,
          mode: "SIGN_IN",
        }
      );

      navigate("/verify-otp", {
  state: {
    flow: "signin",
    phone: trimmedPhone,
    redirect,
  },
});
    } catch (error) {
      console.error(error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <MainLayout>
      <section
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-8 sm:px-6 sm:py-12"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')",
        }}
      >
        {/* Overlay */}

        <div className="absolute inset-0 bg-black/60" />

        {/* Glass Card */}

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-8">
          {/* Close Button */}

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={sendingCode}
              aria-label="Close"
              className="rounded-full p-2 text-white transition duration-300 hover:scale-110 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={22} />
            </button>
          </div>

          {/* Header */}

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              KIVIS EXECUTIVE LODGE
            </h1>

            <p className="mt-2 text-xs tracking-[0.2em] text-yellow-400 sm:text-sm sm:tracking-[0.25em]">
              Luxury • Comfort • Excellence
            </p>

            <h2 className="mt-6 text-xl font-semibold text-white sm:mt-8 sm:text-2xl">
              Welcome Back
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-200">
              Sign in to continue with your booking.
            </p>
          </div>

          {/* Form */}

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Phone */}

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
                  autoComplete="tel"
                  value={phone}
                  disabled={sendingCode}
                  aria-invalid={!!phoneError}
                  aria-describedby={
                    phoneError
                      ? "phone-error"
                      : undefined
                  }
                  onChange={(e) => {
                    setPhone(e.target.value);

                    if (phoneError) {
                      setPhoneError("");
                    }
                  }}
                  placeholder="05xxxxxxxx"
                  className={`w-full rounded-xl bg-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-300 outline-none backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    phoneError
                      ? "border border-red-500 focus:border-red-500"
                      : "border border-white/20 focus:border-yellow-400"
                  }`}
                />
              </div>

              {phoneError && (
                <p
                  id="phone-error"
                  className="mt-2 text-sm font-medium text-red-400"
                >
                  {phoneError}
                </p>
              )}
            </div>

            {/* Submit */}

            <LoadingButton
              type="submit"
              loading={sendingCode}
              loadingText="Sending SMS Code..."
              className="w-full bg-yellow-500 py-3 text-base text-white hover:bg-yellow-400 sm:text-lg"
            >
              <>
                <PhoneCall size={20} />
                Send SMS Code
              </>
            </LoadingButton>
          </form>

          {/* Footer */}

          <p className="mt-8 text-center text-sm leading-6 text-gray-200">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-yellow-400 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </section>
    </MainLayout>
  );
}

export default SignIn;

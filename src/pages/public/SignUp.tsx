import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  PhoneCall,
  X,
} from "lucide-react";

import MainLayout from "../../layouts/MainLayout";
import LoadingButton from "../../components/common/LoadingButton";

function SignUp() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [sendingCode, setSendingCode] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    let hasError = false;

    if (!trimmedName) {
      setFullNameError("Please enter your full name.");
      hasError = true;
    } else {
      setFullNameError("");
    }

    if (!trimmedEmail) {
      setEmailError("Please enter your email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!trimmedPhone) {
      setPhoneError("Please enter your phone number.");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (hasError) {
      return;
    }

    setSendingCode(true);

    try {
      await axios.post(
        "http://localhost:3001/auth/request-otp",
        {
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          mode: "SIGN_UP",
        }
      );

      navigate("/verify-otp", {
        state: {
          flow: "signup",
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
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
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-6 py-12"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600')",
        }}
      >
        {/* Dark Overlay */}

        <div className="absolute inset-0 bg-black/60" />

        {/* Glass Card */}

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

          {/* Close Button */}

          <div className="mb-4 flex justify-end">

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={sendingCode}
              aria-label="Close"
              className="rounded-full p-2 text-white transition duration-300 hover:scale-110 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={24} />
            </button>

          </div>

          {/* Header */}

          <div className="text-center">

            <h1 className="text-3xl font-bold text-white">
              KIVIS EXECUTIVE LODGE
            </h1>

            <p className="mt-2 text-sm tracking-[0.25em] text-yellow-400">
              Luxury • Comfort • Excellence
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-white">
              Create Your Account
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-200">
              Create your guest account to enjoy a seamless booking experience.
            </p>

          </div>

          {/* Form */}

          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >

            {/* Full Name */}

            <div>

              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-white"
              >
                Full Name
              </label>

              <div className="relative">

                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                />

                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  disabled={sendingCode}
                  aria-invalid={!!fullNameError}
                  aria-describedby={
                    fullNameError
                      ? "fullname-error"
                      : undefined
                  }
                  onChange={(e) => {
                    setFullName(e.target.value);

                    if (fullNameError) {
                      setFullNameError("");
                    }
                  }}
                  placeholder="John Doe"
                  className={`w-full rounded-xl bg-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-300 outline-none backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    fullNameError
                      ? "border border-red-500 focus:border-red-500"
                      : "border border-white/20 focus:border-yellow-400"
                  }`}
                />

              </div>

              {fullNameError && (
                <p
                  id="fullname-error"
                  className="mt-2 text-sm font-medium text-red-400"
                >
                  {fullNameError}
                </p>
              )}

            </div>

                        {/* Email Address */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white"
              >
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled={sendingCode}
                  aria-invalid={!!emailError}
                  aria-describedby={
                    emailError
                      ? "email-error"
                      : undefined
                  }
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (emailError) {
                      setEmailError("");
                    }
                  }}
                  placeholder="john@example.com"
                  className={`w-full rounded-xl bg-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-300 outline-none backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    emailError
                      ? "border border-red-500 focus:border-red-500"
                      : "border border-white/20 focus:border-yellow-400"
                  }`}
                />

              </div>

              {emailError && (
                <p
                  id="email-error"
                  className="mt-2 text-sm font-medium text-red-400"
                >
                  {emailError}
                </p>
              )}

            </div>

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
                  placeholder="+233 XX XXX XXXX"
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

            {/* Submit Button */}

            <LoadingButton
              type="submit"
              loading={sendingCode}
              loadingText="Sending SMS Code..."
              className="mt-4 w-full bg-yellow-500 py-3 text-lg text-white hover:bg-yellow-400"
            >
              <>
                <PhoneCall size={20} />
                Send SMS Code
              </>
            </LoadingButton>

          </form>

          {/* Footer */}

          <p className="mt-8 text-center text-sm text-gray-200">

            Already have an account?{" "}

            <Link
              to="/signin"
              className="font-semibold text-yellow-400 hover:underline"
            >
              Log In
            </Link>

          </p>

        </div>

      </section>
    </MainLayout>
  );
}

export default SignUp;
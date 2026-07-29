import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { CheckCircle2, X } from "lucide-react";

import MainLayout from "../../layouts/MainLayout";
import OTPInput from "../../components/auth/OTPInput";
import LoadingButton from "../../components/common/LoadingButton";

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const flow = location.state?.flow || "signin";
  const name = location.state?.name || "";
  const email = location.state?.email || "";
  const phone = location.state?.phone || "";

  const redirect = location.state?.redirect || null;

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const maskPhoneNumber = (phone: string) => {
  if (phone.length < 4) return phone;

  return (
    phone.slice(0, 2) +
    "*".repeat(phone.length - 4) +
    phone.slice(-2)
  );
};

  const handleVerify = () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit verification code."

      );
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
              disabled={verifying}
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
              {flow === "signup"
                ? "Complete Your Registration"
                : "Welcome Back"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-200">
              {flow === "signup"
                ? "Enter the verification code sent to your phone."
                : "Verify your phone number to continue."}
            </p>

            <p className="mt-4 font-medium tracking-wide text-yellow-300">
  {maskPhoneNumber(phone)}
</p>
          </div>

          {/* OTP */}

          <div className="mt-8 sm:mt-10">
            <OTPInput
  onComplete={async (value) => {
    setOtp(value);

    if (otpError) {
      setOtpError("");
    }

    // Prevent duplicate verification requests
    if (verifying) return;

    setVerifying(true);

    try {
      const payload =
        flow === "signup"
          ? {
              name,
              phone,
              email,
              otp: value,
              mode: "SIGN_UP",
            }
          : {
              phone,
              otp: value,
              mode: "SIGN_IN",
            };

      const response = await axios.post(
        "http://localhost:3001/auth/verify-otp",
        payload
      );

      const data = response.data;

      localStorage.setItem(
        "token",
        data.accessToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      const role = data.user.role;

      if (redirect) {
        navigate(redirect, {
          replace: true,
        });
        return;
      }

      if (role === "RECEPTIONIST") {
        navigate("/receptionist/dashboard", {
          replace: true,
        });
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard", {
          replace: true,
        });
      } else {
        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(error);

      setOtpError(
        "Invalid verification code. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  }}
/>

            {otpError && (
              <p className="mt-4 text-center text-sm font-medium text-red-400">
                {otpError}
              </p>
            )}
          </div>

          {/* Timer */}

          <div className="mt-6 space-y-2 text-center sm:mt-8">
            <p className="pt-3 text-sm text-gray-300">
              Resend code in 01:00
            </p>
          </div>

          {/* Verify Button */}

          <LoadingButton
            type="button"
            loading={verifying}
            loadingText="Verifying..."
            onClick={handleVerify}
            className="mt-8 w-full bg-yellow-500 py-3 text-base text-white hover:bg-yellow-400 sm:text-lg"
          >
            <>
              <CheckCircle2 size={20} />
              Verify
            </>
          </LoadingButton>

          {/* Footer */}

          <p className="mt-6 text-center text-sm leading-6 text-gray-200">
            Wrong phone number?{" "}
            <button
              type="button"
              disabled={verifying}
              onClick={() => navigate(-1)}
              className="font-semibold text-yellow-400 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Go Back
            </button> 
          </p>
        </div>
      </section>
    </MainLayout>
  );
}

export default OTPVerification;
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import MainLayout from "../../layouts/MainLayout";
import OTPInput from "../../components/auth/OTPInput";

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const flow = location.state?.flow || "signin";
  const name = location.state?.name || "";
  const email = location.state?.email || "";
  const phone = location.state?.phone || "";
  const [otp, setOtp] = useState("");

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

          {/* Cancel */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 text-white transition hover:bg-white/20 hover:scale-110"
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

              {flow === "signup"
                ? "Complete Your Registration"
                : "Welcome Back"}

            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-200">

              {flow === "signup"
                ? "Enter the verification code sent to your phone."
                : "Verify your phone number to continue."}

            </p>

            <p className="mt-4 text-yellow-300">
              {phone}
            </p>

          </div>

          {/* OTP */}

          <div className="mt-10">
            <OTPInput onComplete={setOtp} />
          </div>

          {/* Timers */}

          <div className="mt-8 space-y-2 text-center">

            <p className="pt-3 text-sm text-gray-300">
              Resend code in 01:00
            </p>

          </div>

          {/* Verify */}

          <button
              onClick={async () => {
                if (otp.length !== 6) {
                  alert("Please enter the 6-digit OTP.");
                  return;
                }

                try {
                  const payload =
                    flow === "signup"
                      ? {
                          name,
                          phone,
                          email,
                          otp,
                          mode: "SIGN_UP",
                        }
                      : {
                          phone,
                          otp,
                          mode: "SIGN_IN",
                        };

                  const response = await axios.post(
                    "http://localhost:3001/auth/verify-otp",
                    payload
                  );

                  const data = response.data;

                  // Save JWT
                  localStorage.setItem("token", data.accessToken);

                  const role = data.user.role;

                  alert(
                    flow === "signup"
                      ? "Registration successful!"
                      : "Login successful!"
                  );

                  if (role === "RECEPTIONIST") {
                    navigate("/receptionist/dashboard");
                  } else if (role === "ADMIN") {
                    navigate("/admin/dashboard");
                  } else {
                    navigate("/");
                  }

                } catch (error) {
                  console.error(error);
                  alert("Invalid OTP.");
                }
              }}
              className="mt-8 w-full rounded-xl bg-yellow-500 py-3 text-lg font-semibold text-white transition hover:bg-yellow-400"
            >
              Verify
            </button>

          <p className="mt-6 text-center text-sm text-gray-200">
            Wrong phone number?{" "}
            <button
              onClick={() => navigate(-1)}
              className="font-semibold text-yellow-400 hover:underline"
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
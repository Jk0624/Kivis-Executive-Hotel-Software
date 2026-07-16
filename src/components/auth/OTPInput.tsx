import { useRef, useState } from "react";

type OTPInputProps = {
  length?: number;
  onComplete?: (otp: string) => void;
};

function OTPInput({
  length = 6,
  onComplete,
}: OTPInputProps) {
  const [otp, setOtp] = useState(Array(length).fill(""));

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    value: string,
    index: number
  ) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOTP = [...otp];
    updatedOTP[index] = value;

    setOtp(updatedOTP);

    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (updatedOTP.every((digit) => digit !== "")) {
      onComplete?.(updatedOTP.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">

      {otp.map((digit, index) => (

        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) =>
            handleChange(e.target.value, index)
          }
          onKeyDown={(e) =>
            handleKeyDown(e, index)
          }
          className="h-14 w-14 rounded-xl border border-white/20 bg-white/10 text-center text-2xl font-bold text-white outline-none backdrop-blur-md transition focus:border-yellow-400"
        />

      ))}

    </div>
  );
}

export default OTPInput;
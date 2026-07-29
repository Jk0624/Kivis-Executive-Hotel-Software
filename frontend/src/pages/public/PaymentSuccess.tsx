import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../../services/api";

function PaymentSuccess() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(search);

      const reference =
        params.get("reference") || params.get("trxref");

      if (!reference) {
        setMessage("Payment reference not found.");
        return;
      }

      try {
        const response = await api.get(
          `/payments/verify/${reference}`
        );

        const data = response.data;

        if (response.status >= 200 && response.status < 300) {
          setMessage(data.message);

          // Redirect back to My Bookings after 2 seconds
          setTimeout(() => {
            navigate("/guest/bookings", { replace: true });
          }, 2000);
        } else {
          setMessage(data.message || "Payment verification failed.");
        }
      } catch {
        setMessage("Unable to verify payment.");
      }
    };

    verifyPayment();
  }, [search, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>Payment Successful</h1>
      <p>{message}</p>
      <p>You will be redirected shortly...</p>
    </div>
  );
}

export default PaymentSuccess;

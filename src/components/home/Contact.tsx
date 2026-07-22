import { useState } from "react";
import axios from "axios";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  Send,
} from "lucide-react";

function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    // Frontend validation (matches backend DTO)

    if (!formData.fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (formData.fullName.length > 100) {
      setErrorMessage("Full name cannot exceed 100 characters.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.subject.trim()) {
      setErrorMessage("Subject is required.");
      return;
    }

    if (formData.subject.length > 150) {
      setErrorMessage("Subject cannot exceed 150 characters.");
      return;
    }

    if (!formData.message.trim()) {
      setErrorMessage("Message is required.");
      return;
    }

    if (formData.message.length > 2000) {
      setErrorMessage("Message cannot exceed 2000 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3001/contact",
        formData
      );

      setSuccessMessage(
        response.data.message ||
          "Thank you for contacting Kiviz Executive Lodge. We have received your message and will get back to you shortly."
      );

      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error(error);

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to send your message. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">

        {/* Heading */}

        <div className="text-center">

          <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
            Contact Us
          </p>

          <h2 className="mt-4 text-4xl font-bold text-slate-900">
            We'd Love to Hear From You
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
            Whether you're planning your next stay, making a
            reservation, or simply have a question, our team
            is always ready to assist you.
          </p>

        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">

          {/* Contact Information */}

          <div className="space-y-8">

            <div className="flex gap-4">
              <MapPin className="h-8 w-8 text-yellow-500" />

              <div>
                <h3 className="text-xl font-semibold">
                  Address
                </h3>

                <p className="mt-2 text-slate-600">
                  Accra, Greater Accra Region, Ghana
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone className="h-8 w-8 text-yellow-500" />

              <div>
                <h3 className="text-xl font-semibold">
                  Phone
                </h3>

                <p className="mt-2 text-slate-600">
                  +233 XX XXX XXXX
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Mail className="h-8 w-8 text-yellow-500" />

              <div>
                <h3 className="text-xl font-semibold">
                  Email
                </h3>

                <p className="mt-2 text-slate-600">
                  info@kivizhotel.com
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock3 className="h-8 w-8 text-yellow-500" />

              <div>
                <h3 className="text-xl font-semibold">
                  Reception
                </h3>

                <p className="mt-2 text-slate-600">
                  Open 24 Hours
                </p>
              </div>
            </div>

          </div>

          {/* Contact Form */}

          <div className="rounded-2xl bg-slate-50 p-8 shadow-md">

            <h3 className="text-2xl font-bold text-slate-900">
              Send Us a Message
            </h3>

            <p className="mt-2 text-slate-600">
              Have a question or special request? Complete the
              form below and our team will get back to you as
              soon as possible.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >

              {/* Success */}

              {successMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                  {successMessage}
                </div>
              )}

              {/* Error */}

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Full Name */}

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-700"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block font-medium text-slate-700">
                  Email Address *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-700"
                />
              </div>

              {/* Subject */}

              <div>

                <label className="mb-2 block font-medium text-slate-700">
                  Subject *
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="e.g. Room Reservation"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-700"
                />

                <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Examples: Room Reservation, Event Booking,
                    General Inquiry
                  </span>

                  <span>
                    {formData.subject.length}/150
                  </span>
                </div>

              </div>

              {/* Message */}

              <div>

                <label className="mb-2 block font-medium text-slate-700">
                  Your Message *
                </label>

                <textarea
                  rows={6}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={2000}
                  placeholder='Tell us how we can assist you. Example: "I would like to reserve a Deluxe Room from 15th–18th August."'
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-700"
                />

                <div className="mt-2 text-right text-sm text-slate-500">
                  {formData.message.length}/2000
                </div>

              </div>

              {/* Button */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                <Send size={18} />

                {loading
                  ? "Sending..."
                  : "Send Message"}
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Contact;
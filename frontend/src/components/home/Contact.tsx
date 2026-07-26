import { useState } from "react";
import axios from "axios";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  Send,
} from "lucide-react";
import { API_BASE_URL } from "../../services/api";

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
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

    if (!formData.fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (formData.fullName.length > 100) {
      setErrorMessage(
        "Full name cannot exceed 100 characters."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setErrorMessage(
        "Please enter a valid email address."
      );
      return;
    }

    if (!formData.subject.trim()) {
      setErrorMessage("Subject is required.");
      return;
    }

    if (formData.subject.length > 150) {
      setErrorMessage(
        "Subject cannot exceed 150 characters."
      );
      return;
    }

    if (!formData.message.trim()) {
      setErrorMessage("Message is required.");
      return;
    }

    if (formData.message.length > 2000) {
      setErrorMessage(
        "Message cannot exceed 2000 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/contact`,
        formData
      );

      setSuccessMessage(
        response.data.message ??
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
        error?.response?.data?.message ??
          "Unable to send your message. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500 sm:text-sm">
            Contact Us
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:mt-4 sm:text-4xl">
            We'd Love to Hear From You
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg">
            Whether you're planning your next
            stay, making a reservation, or
            simply have a question, our team is
            always ready to assist you.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-12">
          {/* Contact Information */}

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 h-7 w-7 flex-shrink-0 text-yellow-500 sm:h-8 sm:w-8" />

              <div>
                <h3 className="text-lg font-semibold sm:text-xl">
                  Address
                </h3>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  Accra, Greater Accra Region,
                  Ghana
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="mt-1 h-7 w-7 flex-shrink-0 text-yellow-500 sm:h-8 sm:w-8" />

              <div>
                <h3 className="text-lg font-semibold sm:text-xl">
                  Phone
                </h3>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  +233 XX XXX XXXX
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="mt-1 h-7 w-7 flex-shrink-0 text-yellow-500 sm:h-8 sm:w-8" />

              <div>
                <h3 className="text-lg font-semibold sm:text-xl">
                  Email
                </h3>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  info@kivizhotel.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock3 className="mt-1 h-7 w-7 flex-shrink-0 text-yellow-500 sm:h-8 sm:w-8" />

              <div>
                <h3 className="text-lg font-semibold sm:text-xl">
                  Reception
                </h3>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  Open 24 Hours
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}

          <div className="rounded-2xl bg-slate-50 p-5 shadow-md sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Send Us a Message
            </h3>

            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Have a question or special
              request? Complete the form below
              and our team will get back to you
              as soon as possible.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              {successMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {errorMessage}
                </div>
              )}

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

                <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Examples: Room Reservation,
                    Event Booking, General
                    Inquiry
                  </span>

                  <span>
                    {formData.subject.length}/150
                  </span>
                </div>
              </div>

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
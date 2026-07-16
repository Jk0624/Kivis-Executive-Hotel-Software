import {
  MapPin,
  Phone,
  Mail,
  Clock3,
} from "lucide-react";

function Contact() {
  return (
    <section
      id="contact"
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">

        <div className="text-center">

          <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
            Contact Us
          </p>

          <h2 className="mt-4 text-4xl font-bold text-slate-900">
            We'd Love to Hear From You
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
            Whether you're planning your next stay or have a question,
            our team is always ready to assist you.
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

            <div className="space-y-5">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <textarea
                rows={5}
                placeholder="Your Message"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <button
                className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                Send Message
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Contact;
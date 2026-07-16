import { Building2, ShieldCheck, Sparkles } from "lucide-react";

function About() {
  return (
    <section
      id="about"
      className="bg-slate-50 px-6 py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

        {/* Left Content */}

        <div>

                <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
                About Us
                </p>

                <h2 className="mt-4 text-4xl font-bold text-slate-900">
                A Modern Hospitality Experience
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                Kiviz Executive Hotel is dedicated to providing exceptional hospitality
                in a comfortable, secure, and welcoming environment. Whether you're
                travelling for business or leisure, we strive to make every stay
                memorable through outstanding service and attention to detail.
                </p>

                <p className="mt-6 text-lg leading-8 text-slate-600">
                As part of our commitment to innovation, Kiviz Executive Hotel embraces
                smart room access technology, combining modern convenience with enhanced
                guest security. Our mission is to deliver a seamless hotel experience
                where comfort, trust, and technology come together.
                </p>

                <div className="mt-8 rounded-2xl bg-blue-50 p-6">

                <h3 className="text-xl font-semibold text-blue-900">
                    Our Vision
                </h3>

                <p className="mt-3 leading-7 text-slate-700">
                    To become one of Ghana's leading smart hospitality destinations by
                    delivering memorable guest experiences through innovation,
                    professionalism, and exceptional customer service.
                </p>

                </div>
        </div>

        {/* Right Image */}

        <img
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900"
          alt="Hotel Lobby"
          className="rounded-3xl shadow-2xl"
        />

      </div>
    </section>
  );
}

export default About;
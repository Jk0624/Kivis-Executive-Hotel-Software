function About() {
  return (
    <section
      id="about"
      className="bg-slate-50 px-5 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Content */}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-500 sm:text-sm">
            About Us
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:mt-4 sm:text-4xl">
            A Modern Hospitality Experience
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
            Kiviz Executive Hotel is dedicated to providing
            exceptional hospitality in a comfortable,
            secure, and welcoming environment. Whether
            you're travelling for business or leisure, we
            strive to make every stay memorable through
            outstanding service and attention to detail.
          </p>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
            As part of our commitment to innovation,
            Kiviz Executive Hotel embraces smart room
            access technology, combining modern
            convenience with enhanced guest security.
            Our mission is to deliver a seamless hotel
            experience where comfort, trust, and
            technology come together.
          </p>

          <div className="mt-8 rounded-2xl bg-blue-50 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-900 sm:text-xl">
              Our Vision
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
              To become one of Ghana's leading smart
              hospitality destinations by delivering
              memorable guest experiences through
              innovation, professionalism, and exceptional
              customer service.
            </p>
          </div>
        </div>

        {/* Right Image */}

        <div>
          <img
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900"
            alt="Hotel Lobby"
            className="h-full w-full rounded-3xl object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

export default About;
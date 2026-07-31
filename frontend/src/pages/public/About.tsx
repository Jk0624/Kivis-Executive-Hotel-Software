import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

function About() {
  return (
    <MainLayout>
      {/* Hero */}

      <section className="relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80')",
          }}
        />

        <div className="absolute inset-0 bg-slate-900/75" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center text-white sm:px-6 sm:py-28 lg:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400 sm:tracking-[0.35em]">
            About Kiviz Executive Lodge
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Where Comfort Meets Smart Hospitality
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:mt-8 sm:text-lg sm:leading-9 xl:text-xl">
            Experience the perfect blend of luxury accommodation,
            personalised service and modern smart room technology,
            thoughtfully designed to make every stay comfortable,
            secure and unforgettable.
          </p>
        </div>
      </section>

      {/* Our Story */}

      <section className="bg-white px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:tracking-[0.3em]">
              Our Story
            </p>

            <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              More Than Just a Place to Stay
            </h2>

            <p className="mt-6 text-sm leading-8 text-slate-600 sm:mt-8 sm:text-base">
              At Kiviz Executive Lodge, we believe every guest deserves
              an experience that combines comfort, security and genuine
              hospitality. Whether you are travelling for business,
              leisure or a special occasion, our lodge offers a peaceful
              environment where every detail is carefully designed for
              your comfort.
            </p>

            <p className="mt-6 text-sm leading-8 text-slate-600 sm:text-base">
              Our Smart Hotel Management System enhances your stay
              through secure PIN and RFID room access, efficient booking
              services and seamless guest experiences. By embracing
              innovation while maintaining warm Ghanaian hospitality,
              we provide accommodation that is both modern and welcoming.
            </p>

            <p className="mt-6 text-sm leading-8 text-slate-600 sm:text-base">
              Every member of our team is committed to delivering
              exceptional service from the moment you arrive until the
              moment you check out.
            </p>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury Hotel"
              className="rounded-3xl shadow-2xl"
            />

            <div className="absolute -bottom-4 left-4 rounded-2xl bg-yellow-500 p-5 shadow-xl sm:-bottom-6 sm:left-6 sm:p-6 lg:-bottom-8 lg:-left-8 lg:rounded-3xl lg:p-8">
              <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
                ★★★★★
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">
                Exceptional Guest Experience
              </p>
            </div>
          </div>
        </div>
      </section>

            {/* Mission, Vision & Why Choose Us */}

      <section className="bg-slate-50 px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:tracking-[0.3em]">
                Our Mission
              </p>

              <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                Delivering Hospitality Beyond Expectations
              </h2>

              <p className="mt-6 text-sm leading-8 text-slate-600 sm:text-base">
                We are committed to providing exceptional accommodation
                through personalised service, modern facilities and smart
                technology that makes every guest's stay secure,
                comfortable and memorable.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:tracking-[0.3em]">
                Our Vision
              </p>

              <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                Setting the Standard for Smart Hospitality
              </h2>

              <p className="mt-6 text-sm leading-8 text-slate-600 sm:text-base">
                To become one of Ghana's most trusted hospitality
                destinations by combining luxury accommodation with
                innovative smart hotel technology and outstanding customer
                service.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}

          <div className="mt-16 text-center sm:mt-24">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:tracking-[0.3em]">
              Why Choose Kiviz Executive Lodge
            </p>

            <h2 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Everything You Need For A Comfortable Stay
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              We combine luxury accommodation, modern technology and
              outstanding hospitality to create an experience our guests
              will always remember.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:mt-16 xl:grid-cols-3 xl:gap-8">
            <div className="rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
              <div className="mb-6 text-5xl">🔐</div>

              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Smart Room Access
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Secure PIN and RFID technology provides convenient and
                reliable room access for every guest.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
              <div className="mb-6 text-5xl">🛏️</div>

              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Premium Accommodation
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Spacious rooms thoughtfully designed to deliver comfort,
                elegance and relaxation throughout your stay.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
              <div className="mb-6 text-5xl">📶</div>

              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                High-Speed Wi-Fi
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Stay connected with complimentary internet access
                throughout the lodge.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
              <div className="mb-6 text-5xl">🛎️</div>

              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                24/7 Reception
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Our friendly reception team is always available to assist
                you whenever you need help.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
              <div className="mb-6 text-5xl">🚗</div>

              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Secure Parking
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Enjoy peace of mind with safe and convenient parking
                facilities for all guests.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8">
              <div className="mb-6 text-5xl">❤️</div>

              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Exceptional Service
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Every guest is treated with professionalism, warmth and
                genuine hospitality from arrival to departure.
              </p>
            </div>
          </div>
        </div>
      </section>

            {/* Core Values */}

      <section className="bg-white px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:tracking-[0.3em]">
              Our Core Values
            </p>

            <h2 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              The Principles That Define Us
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Everything we do is guided by values that place our guests,
              professionalism and innovation at the centre of every experience.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:mt-16 xl:grid-cols-4 xl:gap-8">
            {[
              {
                title: "Excellence",
                description:
                  "We consistently strive to exceed expectations through outstanding hospitality.",
              },
              {
                title: "Integrity",
                description:
                  "We treat every guest with honesty, respect and professionalism.",
              },
              {
                title: "Innovation",
                description:
                  "We embrace smart technology to improve convenience and security.",
              },
              {
                title: "Hospitality",
                description:
                  "Every guest is welcomed with warmth, kindness and genuine care.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-3xl border border-slate-200 p-6 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8"
              >
                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {value.title}
                </h3>

                <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}

      <section className="bg-slate-900 px-5 py-14 text-white sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 text-center xl:grid-cols-4">
            <div>
              <h2 className="text-4xl font-extrabold text-yellow-400 sm:text-5xl lg:text-6xl">
                20+
              </h2>

              <p className="mt-4 text-sm text-slate-300 sm:text-lg">
                Premium Rooms
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-extrabold text-yellow-400 sm:text-5xl lg:text-6xl">
                24/7
              </h2>

              <p className="mt-4 text-sm text-slate-300 sm:text-lg">
                Guest Support
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-extrabold text-yellow-400 sm:text-5xl lg:text-6xl">
                100%
              </h2>

              <p className="mt-4 text-sm text-slate-300 sm:text-lg">
                Secure Smart Access
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-extrabold text-yellow-400 sm:text-5xl lg:text-6xl">
                ★★★★★
              </h2>

              <p className="mt-4 text-sm text-slate-300 sm:text-lg">
                Hospitality Experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Hospitality */}

      <section className="bg-slate-50 px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:tracking-[0.3em]">
              Smart Hospitality
            </p>

            <h2 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Hospitality Enhanced by Technology
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Our Smart Hotel Management System streamlines every stage of your stay,
              delivering convenience, security and efficiency from check-in to check-out.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:mt-16 xl:gap-8">
            <div className="rounded-3xl bg-white p-6 shadow-md sm:p-8">
              <h3 className="text-xl font-bold text-yellow-600 sm:text-2xl">
                Smart Room Access
              </h3>

              <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
                Secure RFID cards and temporary PINs provide fast and reliable
                access while protecting guest privacy.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md sm:p-8">
              <h3 className="text-xl font-bold text-yellow-600 sm:text-2xl">
                Faster Service
              </h3>

              <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
                Our integrated system helps staff respond quickly, improving
                efficiency throughout your stay.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-md sm:p-8 md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-bold text-yellow-600 sm:text-2xl">
                Better Guest Experience
              </h3>

              <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
                Technology and hospitality work together to deliver a smooth,
                comfortable and memorable experience.
              </p>
            </div>
          </div>
        </div>
      </section>

            {/* Hospitality Promise */}

      <section className="bg-white px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500 sm:tracking-[0.3em]">
            Our Promise
          </p>

          <h2 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Every Guest Matters
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:mt-8 sm:text-lg sm:leading-9">
            From the moment you arrive until your departure,
            our team is dedicated to providing exceptional service,
            secure accommodation and a welcoming atmosphere that
            makes every stay memorable.
          </p>
        </div>
      </section>

      {/* CTA */}

      <section className="bg-blue-700 px-5 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl text-center text-white">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready To Experience Kiviz Executive Lodge?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-blue-100 sm:text-lg">
            Whether you're travelling for business, leisure or a special
            event, we look forward to welcoming you with comfort,
            professionalism and smart hospitality.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:gap-5">
            <Link
              to="/guest/rooms"
              className="w-full rounded-2xl bg-yellow-500 px-8 py-4 text-center font-semibold text-slate-900 transition duration-300 hover:-translate-y-1 hover:bg-yellow-400 sm:w-auto"
            >
              Explore Our Rooms
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default About;
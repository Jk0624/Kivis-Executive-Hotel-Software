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

  <div className="relative mx-auto max-w-7xl px-6 py-32 text-center text-white">

    <p className="font-semibold uppercase tracking-[0.35em] text-yellow-400">
      About Kiviz Executive Lodge
    </p>

    <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-tight md:text-6xl">
      Where Comfort Meets Smart Hospitality
    </h1>

    <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-200">
      Experience the perfect blend of luxury accommodation,
      personalised service and modern smart room technology,
      thoughtfully designed to make every stay comfortable,
      secure and unforgettable.
    </p>

  </div>

</section>

{/* Our Story */}

<section className="bg-white px-6 py-24">

  <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

    <div>

      <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
        Our Story
      </p>

      <h2 className="mt-5 text-5xl font-bold leading-tight text-slate-900">
        More Than Just a Place to Stay
      </h2>

      <p className="mt-8 leading-8 text-slate-600">
        At Kiviz Executive Lodge, we believe every guest deserves
        an experience that combines comfort, security and genuine
        hospitality. Whether you are travelling for business,
        leisure or a special occasion, our lodge offers a peaceful
        environment where every detail is carefully designed for
        your comfort.
      </p>

      <p className="mt-6 leading-8 text-slate-600">
        Our Smart Hotel Management System enhances your stay
        through secure PIN and RFID room access, efficient booking
        services and seamless guest experiences. By embracing
        innovation while maintaining warm Ghanaian hospitality,
        we provide accommodation that is both modern and welcoming.
      </p>

      <p className="mt-6 leading-8 text-slate-600">
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

      <div className="absolute -bottom-8 -left-8 rounded-3xl bg-yellow-500 p-8 shadow-xl">

        <h3 className="text-5xl font-extrabold text-slate-900">
          ★★★★★
        </h3>

        <p className="mt-2 font-semibold text-slate-900">
          Exceptional Guest Experience
        </p>

      </div>

    </div>

  </div>

</section>

{/* Mission, Vision & Why Choose Us */}

<section className="bg-slate-50 px-6 py-24">

  <div className="mx-auto max-w-7xl">

    <div className="grid gap-10 lg:grid-cols-2">

      <div className="rounded-3xl bg-white p-10 shadow-lg">

        <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
          Our Mission
        </p>

        <h2 className="mt-4 text-4xl font-bold text-slate-900">
          Delivering Hospitality Beyond Expectations
        </h2>

        <p className="mt-6 leading-8 text-slate-600">
          We are committed to providing exceptional accommodation
          through personalised service, modern facilities and smart
          technology that makes every guest's stay secure,
          comfortable and memorable.
        </p>

      </div>

      <div className="rounded-3xl bg-white p-10 shadow-lg">

        <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
          Our Vision
        </p>

        <h2 className="mt-4 text-4xl font-bold text-slate-900">
          Setting the Standard for Smart Hospitality
        </h2>

        <p className="mt-6 leading-8 text-slate-600">
          To become one of Ghana's most trusted hospitality
          destinations by combining luxury accommodation with
          innovative smart hotel technology and outstanding customer
          service.
        </p>

      </div>

    </div>

    {/* Why Choose Us */}

    <div className="mt-24 text-center">

      <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
        Why Choose Kiviz Executive Lodge
      </p>

      <h2 className="mt-5 text-5xl font-bold text-slate-900">
        Everything You Need For A Comfortable Stay
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
        We combine luxury accommodation, modern technology and
        outstanding hospitality to create an experience our guests
        will always remember.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

      <div className="rounded-3xl bg-white p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="mb-6 text-5xl">🔐</div>
        <h3 className="text-2xl font-bold text-slate-900">
          Smart Room Access
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          Secure PIN and RFID technology provides convenient and
          reliable room access for every guest.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="mb-6 text-5xl">🛏️</div>
        <h3 className="text-2xl font-bold text-slate-900">
          Premium Accommodation
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          Spacious rooms thoughtfully designed to deliver comfort,
          elegance and relaxation throughout your stay.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="mb-6 text-5xl">📶</div>
        <h3 className="text-2xl font-bold text-slate-900">
          High-Speed Wi-Fi
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          Stay connected with complimentary internet access
          throughout the lodge.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="mb-6 text-5xl">🛎️</div>
        <h3 className="text-2xl font-bold text-slate-900">
          24/7 Reception
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          Our friendly reception team is always available to assist
          you whenever you need help.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="mb-6 text-5xl">🚗</div>
        <h3 className="text-2xl font-bold text-slate-900">
          Secure Parking
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          Enjoy peace of mind with safe and convenient parking
          facilities for all guests.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="mb-6 text-5xl">❤️</div>
        <h3 className="text-2xl font-bold text-slate-900">
          Exceptional Service
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          Every guest is treated with professionalism, warmth and
          genuine hospitality from arrival to departure.
        </p>
      </div>

    </div>

  </div>

</section>

{/* Core Values */}

<section className="bg-white px-6 py-24">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
        Our Core Values
      </p>

      <h2 className="mt-5 text-5xl font-bold text-slate-900">
        The Principles That Define Us
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
        Everything we do is guided by values that place our guests,
        professionalism and innovation at the centre of every experience.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

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
          className="rounded-3xl border border-slate-200 p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
        >

          <h3 className="text-2xl font-bold text-slate-900">
            {value.title}
          </h3>

          <p className="mt-5 leading-7 text-slate-600">
            {value.description}
          </p>

        </div>

      ))}

    </div>

  </div>

</section>

{/* Statistics */}

<section className="bg-slate-900 px-6 py-24 text-white">

  <div className="mx-auto max-w-7xl">

    <div className="grid gap-8 text-center md:grid-cols-2 xl:grid-cols-4">

      <div>
        <h2 className="text-6xl font-extrabold text-yellow-400">20+</h2>
        <p className="mt-4 text-lg text-slate-300">
          Premium Rooms
        </p>
      </div>

      <div>
        <h2 className="text-6xl font-extrabold text-yellow-400">24/7</h2>
        <p className="mt-4 text-lg text-slate-300">
          Guest Support
        </p>
      </div>

      <div>
        <h2 className="text-6xl font-extrabold text-yellow-400">100%</h2>
        <p className="mt-4 text-lg text-slate-300">
          Secure Smart Access
        </p>
      </div>

      <div>
        <h2 className="text-6xl font-extrabold text-yellow-400">★★★★★</h2>
        <p className="mt-4 text-lg text-slate-300">
          Hospitality Experience
        </p>
      </div>

    </div>

  </div>

</section>

{/* Smart Hospitality */}

<section className="bg-slate-50 px-6 py-24">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
        Smart Hospitality
      </p>

      <h2 className="mt-5 text-5xl font-bold text-slate-900">
        Hospitality Enhanced by Technology
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
        Our Smart Hotel Management System streamlines every stage of your stay,
        delivering convenience, security and efficiency from check-in to check-out.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-3">

      <div className="rounded-3xl bg-white p-8 shadow-md">
        <h3 className="text-2xl font-bold text-yellow-600">
          Smart Room Access
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          Secure RFID cards and temporary PINs provide fast and reliable
          access while protecting guest privacy.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-md">
        <h3 className="text-2xl font-bold text-yellow-600">
          Faster Service
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          Our integrated system helps staff respond quickly, improving
          efficiency throughout your stay.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-md">
        <h3 className="text-2xl font-bold text-yellow-600">
          Better Guest Experience
        </h3>

        <p className="mt-5 leading-8 text-slate-600">
          Technology and hospitality work together to deliver a smooth,
          comfortable and memorable experience.
        </p>
      </div>

    </div>

  </div>

</section>

{/* Hospitality Promise */}

<section className="bg-white px-6 py-24">

  <div className="mx-auto max-w-5xl text-center">

    <p className="font-semibold uppercase tracking-[0.3em] text-yellow-500">
      Our Promise
    </p>

    <h2 className="mt-5 text-5xl font-bold text-slate-900">
      Every Guest Matters
    </h2>

    <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-slate-600">
      From the moment you arrive until your departure,
      our team is dedicated to providing exceptional service,
      secure accommodation and a welcoming atmosphere that
      makes every stay memorable.
    </p>

  </div>

</section>

{/* CTA */}

<section className="bg-blue-700 px-6 py-24">

  <div className="mx-auto max-w-5xl text-center text-white">

    <h2 className="text-5xl font-bold">
      Ready To Experience Kiviz Executive Lodge?
    </h2>

    <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
      Whether you're travelling for business, leisure or a special event,
      we look forward to welcoming you with comfort,
      professionalism and smart hospitality.
    </p>

    <div className="mt-12 flex flex-wrap justify-center gap-5">

      <Link
        to="/rooms"
        className="rounded-2xl bg-yellow-500 px-8 py-4 font-semibold text-slate-900 transition duration-300 hover:-translate-y-1 hover:bg-yellow-400"
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
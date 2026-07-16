import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

function About() {
  return (
    <MainLayout>

      {/* Hero */}

      <section className="bg-slate-900 px-6 py-24 text-center text-white">

        <div className="mx-auto max-w-5xl">

          <p className="font-semibold uppercase tracking-[0.25em] text-yellow-400">
            About Us
          </p>

          <h1 className="mt-4 text-5xl font-bold">
            Discover the Story Behind Kiviz Executive Hotel
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Combining exceptional hospitality with innovative smart room
            technology to deliver unforgettable guest experiences.
          </p>

        </div>

      </section>

      {/* Our Story */}

      <section className="bg-white px-6 py-24">

        <div className="mx-auto max-w-5xl">

          <h2 className="text-4xl font-bold text-slate-900">
            Our Story
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Kiviz Executive Hotel was established with a vision of providing
            guests with luxury accommodation, outstanding hospitality, and
            modern technology that enhances comfort and security. Whether
            travelling for business or leisure, every guest is welcomed into
            an environment designed for relaxation, convenience, and memorable
            experiences.
          </p>

        </div>

      </section>


      {/* Mission & Vision */}

<section className="bg-slate-50 px-6 py-24">

  <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">

    <div className="rounded-2xl bg-white p-10 shadow-md">

      <p className="font-semibold uppercase tracking-[0.2em] text-yellow-500">
        Our Mission
      </p>

      <h2 className="mt-4 text-3xl font-bold text-slate-900">
        Delivering Exceptional Hospitality
      </h2>

      <p className="mt-6 leading-8 text-slate-600">
        Our mission is to provide every guest with a seamless blend of
        comfort, security, and outstanding customer service by embracing
        modern hospitality and innovative smart room technology.
      </p>

    </div>

    <div className="rounded-2xl bg-white p-10 shadow-md">

      <p className="font-semibold uppercase tracking-[0.2em] text-yellow-500">
        Our Vision
      </p>

      <h2 className="mt-4 text-3xl font-bold text-slate-900">
        Becoming Ghana's Leading Smart Hotel
      </h2>

      <p className="mt-6 leading-8 text-slate-600">
        We aspire to become one of Ghana's most trusted hospitality
        destinations by delivering memorable guest experiences through
        innovation, professionalism, and continuous improvement.
      </p>

    </div>

  </div>

</section>


{/* Core Values */}

<section className="bg-white px-6 py-24">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="font-semibold uppercase tracking-[0.25em] text-yellow-500">
        Our Core Values
      </p>

      <h2 className="mt-4 text-4xl font-bold text-slate-900">
        The Principles That Guide Everything We Do
      </h2>

      <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
        Every decision we make is driven by our commitment to providing an
        exceptional hospitality experience for every guest.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-2xl border border-slate-200 p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl">

        <h3 className="text-2xl font-semibold text-slate-900">
          Excellence
        </h3>

        <p className="mt-4 leading-7 text-slate-600">
          We strive to exceed guest expectations through outstanding service.
        </p>

      </div>

      <div className="rounded-2xl border border-slate-200 p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl">

        <h3 className="text-2xl font-semibold text-slate-900">
          Integrity
        </h3>

        <p className="mt-4 leading-7 text-slate-600">
          We operate with honesty, transparency and professionalism.
        </p>

      </div>

      <div className="rounded-2xl border border-slate-200 p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl">

        <h3 className="text-2xl font-semibold text-slate-900">
          Innovation
        </h3>

        <p className="mt-4 leading-7 text-slate-600">
          We embrace smart technology to enhance comfort and security.
        </p>

      </div>

      <div className="rounded-2xl border border-slate-200 p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl">

        <h3 className="text-2xl font-semibold text-slate-900">
          Hospitality
        </h3>

        <p className="mt-4 leading-7 text-slate-600">
          Every guest is welcomed with warmth, respect and genuine care.
        </p>

      </div>

    </div>

  </div>

</section>


{/* Smart Hospitality */}

<section className="bg-slate-900 px-6 py-24 text-white">

  <div className="mx-auto max-w-7xl">

    <div className="text-center">

      <p className="font-semibold uppercase tracking-[0.25em] text-yellow-400">
        Smart Hospitality
      </p>

      <h2 className="mt-4 text-4xl font-bold">
        Hospitality Powered by Innovation
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
        At Kiviz Executive Hotel, technology enhances every guest experience.
        Our Smart Hotel Management System combines convenience, efficiency,
        and security to deliver a modern hospitality experience.
      </p>

    </div>

    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

      <div className="rounded-2xl bg-slate-800 p-8">

        <h3 className="text-2xl font-semibold text-yellow-400">
          Smart Room Access
        </h3>

        <p className="mt-4 leading-7 text-slate-300">
          Guests securely access their rooms using temporary PINs and RFID
          cards issued during check-in.
        </p>

      </div>

      <div className="rounded-2xl bg-slate-800 p-8">

        <h3 className="text-2xl font-semibold text-yellow-400">
          Enhanced Security
        </h3>

        <p className="mt-4 leading-7 text-slate-300">
          Smart access credentials are securely managed, helping protect both
          guests and hotel property.
        </p>

      </div>

      <div className="rounded-2xl bg-slate-800 p-8">

        <h3 className="text-2xl font-semibold text-yellow-400">
          Seamless Guest Experience
        </h3>

        <p className="mt-4 leading-7 text-slate-300">
          From check-in to room access, our integrated system reduces waiting
          time and improves convenience throughout your stay.
        </p>

      </div>

    </div>

  </div>

</section>


{/* Call To Action */}

<section className="bg-white px-6 py-24">

  <div className="mx-auto max-w-4xl rounded-3xl bg-blue-700 px-10 py-16 text-center text-white">

    <h2 className="text-4xl font-bold">
      Ready to Experience Kiviz Executive Hotel?
    </h2>

    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
      Whether you're planning a business trip or a relaxing getaway,
      we're ready to provide exceptional hospitality, modern comfort,
      and a secure smart hotel experience.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-4">

      <Link
  to="/rooms"
        className="rounded-xl bg-yellow-500 px-8 py-4 font-semibold text-white transition hover:bg-yellow-400"
      >
        Explore Our Rooms
      </Link>

      <Link
  to="/rooms"
        className="rounded-xl border border-white px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-blue-700"
      >
        Book Your Stay
      </Link>
      

    </div>

  </div>

</section>

    </MainLayout>
  );
}

export default About;
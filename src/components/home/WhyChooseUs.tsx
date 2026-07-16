import {
  Wifi,
  ShieldCheck,
  ParkingCircle,
  KeyRound,
  Utensils,
  Clock3,
} from "lucide-react";

function WhyChooseUs() {
  const features = [
    {
      icon: KeyRound,
      title: "Smart Room Access",
      description:
        "Secure PIN powered room access for a seamless stay.",
    },
    {
      icon: Wifi,
      title: "Free High-Speed Wi-Fi",
      description:
        "Stay connected anywhere in the hotel with reliable internet.",
    },
    {
      icon: Utensils,
      title: "Restaurant & Bar",
      description:
        "Enjoy delicious local and continental dishes throughout the day.",
    },
    {
      icon: ParkingCircle,
      title: "Secure Parking",
      description:
        "Spacious and monitored parking for all our guests.",
    },
    {
      icon: Clock3,
      title: "24/7 Reception",
      description:
        "Our reception team is always available to assist you.",
    },
    {
      icon: ShieldCheck,
      title: "24/7 Security",
      description:
        "Your safety is our priority with round-the-clock security.",
    },
  ];

  return (
    <section
      id="why-us"
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">

        <div className="text-center">

          <h2 className="text-4xl font-bold text-slate-900">
            WHY CHOOSE US
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
            Experience luxury, comfort and smart technology designed to make
            every stay unforgettable.
          </p>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
                  <Icon className="h-7 w-7 text-yellow-600" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;
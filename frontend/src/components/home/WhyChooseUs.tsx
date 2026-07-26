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
      className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}

        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            WHY CHOOSE US
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
            Experience luxury, comfort and smart technology
            designed to make every stay unforgettable.
          </p>
        </div>

        {/* Features */}

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
                  <Icon className="h-7 w-7 text-yellow-600" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900 sm:mt-6 sm:text-xl">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
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
"use client";

const apps = [
  {
    logo: "/workkerzapp.png",
    name: "Workkerz",
    desc: "For Customers",
  },
  {
    logo: "/aurixapp.png",
    name: "E-Aurix",
    desc: "For Buying and Sellings",
  },
  {
    logo: "/Zevrooapp.png",
    name: "Zevroo partner",
    desc: "For Riders ",
  },
];

export default function DownloadAppsBar() {
  return (
    <section className="mt-8 flex justify-center px-4">
      <div className="w-full max-w-5xl bg-white/10 border border-white/10 rounded-3xl px-6 py-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* app cards */}
          <div className="flex flex-wrap justify-center gap-5">
            {apps.map((app, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 min-w-52"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f6f6f6] flex items-center justify-center text-2xl">
                  <img
                    src={app.logo}
                    alt={app.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <h4 className="text-white font-semibold">{app.name}</h4>

                  <p className="text-xs text-gray-300">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* common playstore line */}
          <div className="flex items-center gap-3 bg-white text-slate-800 px-5 py-3 rounded-full font-medium shadow-md">
            <span className="text-green-600 text-lg">▶</span>

            <span className="text-sm">Notify You</span>
          </div>
        </div>
      </div>
    </section>
  );
}

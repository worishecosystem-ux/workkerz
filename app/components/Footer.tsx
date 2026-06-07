import Link from "next/link";
import Image from "next/image";
import {
  Hammer,
  Wrench,
  Zap,
  Car,
  Grid,
  Building2,
  Briefcase,
  Newspaper,
  Megaphone,
  Users,
  HelpCircle,
  Phone,
  Shield,
  FileText,
  AlertTriangle,
} from "lucide-react";

/* 🔥 Map icons per link */
const footerColumns = [
  {
    title: "Services",
    links: [
      { name: "Construction", icon: Hammer },
      { name: "Plumbing", icon: Wrench },
      { name: "Electrical", icon: Zap },
      { name: "Driving", icon: Car },
      { name: "Browse All", icon: Grid },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", icon: Building2 },
      { name: "Careers", icon: Briefcase },
      { name: "Blog", icon: Newspaper },
      { name: "Press", icon: Megaphone },
      { name: "Partners", icon: Users },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", icon: HelpCircle },
      { name: "Contact Us", icon: Phone },
      { name: "Privacy Policy", icon: Shield },
      { name: "Terms of Service", icon: FileText },
      { name: "Safety", icon: AlertTriangle },
    ],
  },
];
/* ✅ Proper type definition */
type Social =
  | {
      name: string;
      href: string;
      icon: string;
      svg?: false;
    }
  | {
      name: string;
      href: string;
      svg: true;
      icon?: never;
    };

const socials: Social[] = [
  {
    name: "X",
    href: "https://x.com",
    icon: "https://cdn.simpleicons.org/x/ffffff",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    svg: true,
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: "https://cdn.simpleicons.org/instagram/ffffff",
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: "https://cdn.simpleicons.org/facebook/ffffff",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-8">
        {/* Brand */}
        <div className="grid lg:grid-cols-[300px_1fr_280px] gap-10 mb-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center mb-4">
            <div className="relative w-52 h-20">
              <Image
                src="/WORKKERZ (1).png"
                alt="Workkerz Logo"
                fill
                sizes="208px"
                className="object-contain"
              />
            </div>
          </Link>

          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Connecting skilled professionals with people who need them. Fast,
            reliable and trusted.
          </p>
        </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-semibold tracking-wider mb-5">
                {col.title.toUpperCase()}
              </h4>

              <ul className="space-y-3">
                {col.links.map((link) => {
                  const Icon = link.icon;

                  return (
                    <li key={link.name}>
                      <a
                        href="#"
                        className="group flex items-center gap-3 text-gray-400 text-sm transition"
                      >
                        {/* Icon */}
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-[#FF5C39] transition">
                          <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
                        </span>

                        {/* Text */}
                        <span className="group-hover:text-white transition">
                          {link.name}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-white font-semibold text-sm">
                Follow Workkerz
              </h4>
              <p className="text-gray-400 text-xs">Stay connected with us</p>
            </div>

            <span className="text-[10px] px-2 py-1 rounded-full bg-[#FF5C39]/10 text-[#FF5C39] font-semibold">
              Social
            </span>
          </div>

          <div className="flex gap-3">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-white/10 hover:bg-[#FF5C39] flex items-center justify-center transition-all duration-300"
              >
                {social.svg ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 34 34"
                    className="w-5 h-5 fill-white group-hover:fill-[#fafafa]"
                  >
                    {" "}
                    <path d="M34,2.5C34,1.1,32.9,0,31.5,0H2.5C1.1,0,0,1.1,0,2.5v29C0,32.9,1.1,34,2.5,34h29c1.4,0,2.5-1.1,2.5-2.5V2.5z M10.1,28.9H5.3V13.4h4.8V28.9z M7.7,11.3c-1.5,0-2.7-1.2-2.7-2.7c0-1.5,1.2-2.7,2.7-2.7c1.5,0,2.7,1.2,2.7,2.7 C10.4,10.1,9.2,11.3,7.7,11.3z M28.9,28.9h-4.8v-7.5c0-1.8,0-4.1-2.5-4.1c-2.5,0-2.9,2-2.9,4v7.6h-4.8V13.4h4.6v2.1h0.1 c0.6-1.2,2.1-2.5,4.3-2.5c4.6,0,5.5,3,5.5,6.9V28.9z" />{" "}
                  </svg>
                ) : (
                  <div className="relative w-5 h-5">
                    <Image
                      src={social.icon}
                      alt={social.name}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Workkerz Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-gray-400 text-sm">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

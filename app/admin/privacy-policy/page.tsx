"use client";

import Link from "next/link";
import {
  ShieldCheck,
  LockKeyhole,
  UserCheck,
  Database,
  FileText,
  Mail,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    title: "About Workkerz Admin",
    content: (
      <>
        <p>
          Workkerz Admin is an administrative and operational application
          associated with the Workkerz platform. It is intended for authorized
          administrators and personnel who manage and operate Workkerz
          services.
        </p>

        <p className="mt-4">The application may allow authorized users to:</p>

        <ul>
          <li>Manage worker information</li>
          <li>Manage customer information</li>
          <li>Manage shops and sellers</li>
          <li>Review and manage bookings</li>
          <li>Review and manage orders</li>
          <li>Manage services and products</li>
          <li>Review reports and support requests</li>
          <li>Monitor platform activity</li>
          <li>Perform security and compliance operations</li>
        </ul>
      </>
    ),
  },
  {
    title: "Information We Collect and Access",
    content: (
      <>
        <p>
          Depending on the administrator's role and the functionality being
          used, Workkerz Admin may access information stored on the Workkerz
          platform.
        </p>

        <h3>Administrator Information</h3>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Mobile number</li>
          <li>Administrator account ID</li>
          <li>Authentication information</li>
          <li>Profile information</li>
          <li>Role and permissions</li>
          <li>Login and authentication activity</li>
        </ul>

        <h3>Worker Information</h3>
        <ul>
          <li>Worker name</li>
          <li>Mobile number</li>
          <li>Profile photograph</li>
          <li>Address or service location</li>
          <li>Skills and services</li>
          <li>Availability</li>
          <li>Pricing information</li>
          <li>Ratings and reviews</li>
          <li>Booking history</li>
          <li>Account status</li>
          <li>Verification information where applicable</li>
        </ul>

        <h3>Customer Information</h3>
        <ul>
          <li>Customer name</li>
          <li>Mobile number</li>
          <li>Email address</li>
          <li>Address</li>
          <li>Booking information</li>
          <li>Order information</li>
          <li>Service history</li>
          <li>Support requests</li>
          <li>Account status</li>
        </ul>

        <h3>Shop and Seller Information</h3>
        <ul>
          <li>Seller or shop name</li>
          <li>Contact details</li>
          <li>Business address</li>
          <li>Product information</li>
          <li>Seller account information</li>
          <li>Orders and inventory information</li>
          <li>Verification information where applicable</li>
        </ul>

        <h3>Technical Information</h3>
        <ul>
          <li>Device type</li>
          <li>Operating system</li>
          <li>Application version</li>
          <li>IP address</li>
          <li>Network information</li>
          <li>Error and crash information</li>
          <li>Security and authentication logs</li>
        </ul>
      </>
    ),
  },
  {
    title: "How We Use Information",
    content: (
      <>
        <p>Information may be used to:</p>

        <ul>
          <li>Operate and administer the Workkerz platform.</li>
          <li>Manage authorized administrator accounts.</li>
          <li>Manage workers, customers, sellers, bookings and orders.</li>
          <li>Provide customer and worker support.</li>
          <li>Investigate complaints and reports.</li>
          <li>Detect and prevent fraud and abuse.</li>
          <li>Protect platform security.</li>
          <li>Improve platform performance.</li>
          <li>Maintain operational and business records.</li>
          <li>Resolve disputes.</li>
          <li>Enforce applicable policies and agreements.</li>
          <li>Comply with applicable laws and legal obligations.</li>
        </ul>

        <p className="mt-4">
          Administrator access to personal information must only be used for
          legitimate Workkerz business and operational purposes.
        </p>
      </>
    ),
  },
  {
    title: "Authorized Access",
    content: (
      <>
        <p>
          Workkerz Admin is intended for authorized personnel. Access to
          information is controlled according to administrative roles and
          permissions.
        </p>

        <p className="mt-4">
          Administrators are expected to access only information necessary for
          their assigned responsibilities.
        </p>

        <p className="mt-4">
          We may suspend or terminate access when unauthorized, suspicious or
          inappropriate activity is detected.
        </p>
      </>
    ),
  },
  {
    title: "Sharing of Information",
    content: (
      <>
        <p>
          We may share information when reasonably necessary with trusted
          service providers that help us operate Workkerz.
        </p>

        <h3>Service Providers</h3>

        <ul>
          <li>Cloud hosting providers</li>
          <li>Database infrastructure providers</li>
          <li>Authentication providers</li>
          <li>Storage providers</li>
          <li>Security providers</li>
          <li>Notification providers</li>
          <li>Technical support providers</li>
        </ul>

        <h3>Legal Requirements</h3>

        <p>
          We may disclose information when required or permitted by applicable
          law, regulation, court order, legal process, or lawful government
          request.
        </p>

        <h3>Security and Fraud Prevention</h3>

        <p>
          Information may be shared when necessary to investigate fraud,
          unauthorized access, security incidents, abuse, or violations of
          applicable policies.
        </p>

        <p className="mt-4 font-medium">
          We do not sell personal information to third parties.
        </p>
      </>
    ),
  },
  {
    title: "Data Security",
    content: (
      <>
        <p>
          We use reasonable technical and organizational safeguards designed to
          protect information against unauthorized access, disclosure,
          accidental loss, destruction, alteration, or misuse.
        </p>

        <p className="mt-4">Security measures may include:</p>

        <ul>
          <li>Authentication controls</li>
          <li>Role-based access controls</li>
          <li>Encrypted transmission</li>
          <li>Access restrictions</li>
          <li>Security monitoring</li>
          <li>Logging</li>
          <li>Backup and recovery measures</li>
        </ul>

        <p className="mt-4">
          No electronic system or method of transmission can be guaranteed to
          be completely secure.
        </p>
      </>
    ),
  },
  {
    title: "Data Retention",
    content: (
      <>
        <p>
          We retain information only for as long as reasonably necessary for
          providing Workkerz services, administrative purposes, security,
          legal compliance, dispute resolution, and legitimate business
          requirements.
        </p>

        <p className="mt-4">
          When information is no longer required, we may delete, anonymize, or
          securely dispose of it, subject to applicable legal and operational
          requirements.
        </p>
      </>
    ),
  },
  {
    title: "Account and Data Deletion",
    content: (
      <>
        <p>
          Where applicable, users may request deletion of their account and
          associated personal information by contacting us through our
          designated support or privacy contact.
        </p>

        <p className="mt-4">
          Certain information may be retained when necessary to comply with
          legal obligations, prevent fraud, resolve disputes, establish or
          defend legal claims, or maintain required business records.
        </p>
      </>
    ),
  },
  {
    title: "Children's Privacy",
    content: (
      <>
        <p>
          Workkerz Admin is an administrative application and is not directed
          toward children.
        </p>

        <p className="mt-4">
          We do not knowingly request children to create administrative
          accounts or use administrative functionality.
        </p>
      </>
    ),
  },
  {
    title: "Cookies and Similar Technologies",
    content: (
      <>
        <p>
          Associated Workkerz web services may use cookies, local storage,
          session technologies, or similar technologies for authentication,
          session management, security, preferences, performance, and service
          functionality.
        </p>

        <p className="mt-4">
          Workkerz Admin may use authentication and session mechanisms necessary
          to securely operate the application.
        </p>
      </>
    ),
  },
  {
    title: "Third-Party Services",
    content: (
      <>
        <p>
          Workkerz Admin may rely on third-party infrastructure and services.
          These providers may have their own privacy policies governing
          information processed through their services.
        </p>

        <p className="mt-4">
          We take reasonable steps to select service providers appropriate for
          the services they provide and to protect information processed on our
          behalf.
        </p>
      </>
    ),
  },
  {
    title: "International or Cross-Border Processing",
    content: (
      <p>
        Depending on the infrastructure and service providers used, information
        may be processed or stored in locations outside the user's state or
        country. Where applicable, we take reasonable measures to ensure that
        such processing is conducted in accordance with applicable law and
        appropriate contractual and security requirements.
      </p>
    ),
  },
  {
    title: "Your Privacy Rights",
    content: (
      <>
        <p>Subject to applicable law, individuals may have rights to:</p>

        <ul>
          <li>Request access to personal information.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request deletion where legally applicable.</li>
          <li>Request information about processing.</li>
          <li>Raise privacy-related concerns.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>

        <p className="mt-4">
          Privacy requests can be submitted through our privacy contact
          mechanism.
        </p>
      </>
    ),
  },
  {
    title: "Indian Data Protection Laws",
    content: (
      <>
        <p>
          We intend to handle personal data in accordance with applicable
          Indian laws and regulations, including where applicable:
        </p>

        <ul>
          <li>Digital Personal Data Protection Act, 2023</li>
          <li>Information Technology Act, 2000</li>
          <li>Applicable rules and regulations</li>
          <li>Consumer Protection Act, 2019, where applicable</li>
        </ul>

        <p className="mt-4">
          The specific rights and obligations applicable to an individual may
          depend on the nature of the processing and applicable law.
        </p>
      </>
    ),
  },
  {
    title: "Data Accuracy",
    content: (
      <p>
        We take reasonable measures to maintain accurate information.
        Authorized administrators may update or correct information when they
        have appropriate permissions and when such changes are necessary for
        legitimate operational purposes.
      </p>
    ),
  },
  {
    title: "Changes to This Privacy Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. When changes are
        made, we will update the Last Updated date shown at the beginning of
        this policy. Material changes may also be communicated through
        appropriate channels where required by law.
      </p>
    ),
  },
];

export default function AdminPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f6f8f7] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <ShieldCheck size={24} />
              </div>

              <div>
                <p className="text-base font-bold tracking-tight">
                  Workkerz Admin
                </p>
                <p className="text-xs text-slate-500">
                  Privacy & Data Protection
                </p>
              </div>
            </Link>

            <Link
              href="/admin"
              className="hidden items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex"
            >
              Admin
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <LockKeyhole size={14} />
              Privacy Policy
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Workkerz Admin Privacy Policy
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              This Privacy Policy explains how Worish Ecosystem Private
              Limited collects, accesses, uses, stores, protects, and shares
              information through the Workkerz Admin application.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <span className="rounded-xl bg-slate-100 px-4 py-2 text-slate-600">
                Effective Date: <strong>July 1, 2026</strong>
              </span>

              <span className="rounded-xl bg-slate-100 px-4 py-2 text-slate-600">
                Last Updated: <strong>August 9, 2026</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick info */}
      <section className="mx-auto max-w-5xl px-5 py-7 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<UserCheck size={20} />}
            title="Authorized Access"
            text="Administrative access is restricted according to user roles and permissions."
          />

          <InfoCard
            icon={<Database size={20} />}
            title="Data Protection"
            text="We use reasonable technical and organizational safeguards."
          />

          <InfoCard
            icon={<FileText size={20} />}
            title="Your Rights"
            text="Privacy and data requests can be submitted through our contact mechanism."
          />
        </div>
      </section>

      {/* Policy */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {sections.map((section, index) => (
              <article
                key={section.title}
                id={section.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}
                className="scroll-mt-24 px-6 py-8 sm:px-10 sm:py-10"
              >
                <div className="flex gap-4">
                  <div className="hidden shrink-0 pt-1 text-sm font-bold text-emerald-600 sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                      {section.title}
                    </h2>

                    <div className="policy-content mt-5 text-[15px] leading-7 text-slate-600">
                      {section.content}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <div className="rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500">
                  <Mail size={21} />
                </div>

                <h2 className="text-2xl font-bold">
                  Privacy Contact
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  For privacy questions, data requests, or concerns regarding
                  Workkerz Admin, please contact Worish Ecosystem Private
                  Limited through the official Workkerz contact channel.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
                <p className="font-semibold text-white">
                  Worish Ecosystem Private Limited
                </p>

                <p className="mt-2 text-slate-400">
                  Application: Workkerz Admin
                </p>

                <a
                  href="https://workkerz.com"
                  className="mt-3 inline-block text-emerald-400 hover:text-emerald-300"
                >
                  workkerz.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} Worish Ecosystem Private Limited.
            All rights reserved.
          </p>

          <div className="flex gap-4">
            <Link
              href="/privacy-policy"
              className="hover:text-slate-900"
            >
              Workkerz Privacy Policy
            </Link>

            <Link
              href="/admin"
              className="hover:text-slate-900"
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .policy-content p {
          margin: 0;
        }

        .policy-content h3 {
          margin-top: 28px;
          margin-bottom: 10px;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 700;
          color: #0f172a;
        }

        .policy-content ul {
          margin-top: 14px;
          padding-left: 20px;
          list-style: disc;
        }

        .policy-content li {
          margin: 6px 0;
          padding-left: 3px;
        }
      `}</style>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}
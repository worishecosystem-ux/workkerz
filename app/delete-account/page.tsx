export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">
          Delete Your Workkerz Account
        </h1>

        <p className="mt-6 text-slate-600 leading-7">
          You can permanently delete your Workkerz account directly from the
          Workkerz mobile application.
        </p>

        <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">How to delete your account</h2>

          <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
            <li>Open the Workkerz app.</li>
            <li>Sign in with your Google account.</li>
            <li>Go to <strong>Profile</strong>.</li>
            <li>Tap <strong>Delete Account</strong>.</li>
            <li>Confirm the deletion request.</li>
          </ol>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Data that will be deleted</h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Your Workkerz account.</li>
            <li>Your profile information.</li>
            <li>Your authentication information.</li>
            <li>Your personal information linked to your account.</li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Data that may be retained</h2>

          <p className="mt-4 text-slate-700 leading-7">
            Certain booking records, invoices, payment records and security logs
            may be retained for up to 90 days or longer where required by
            applicable law, fraud prevention, dispute resolution or regulatory
            compliance.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Support</h2>

          <p className="mt-4 text-slate-700">
            For any questions, contact us at{" "}
            <a
              href="mailto:support@workkerz.com"
              className="font-semibold text-green-600"
            >
              support@workkerz.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
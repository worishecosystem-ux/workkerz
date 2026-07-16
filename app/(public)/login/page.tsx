"use client";

import { supabase } from "@/lib/supabase";
import { Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";
import { Capacitor } from "@capacitor/core";

const WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID!;

export default function LoginPage() {
  console.log("Platform:", Capacitor.getPlatform());
  console.log("Is Native:", Capacitor.isNativePlatform());
  const signInWithGoogle = async () => {
  alert("1. Button clicked");

  try {
    alert(
      `Platform: ${Capacitor.getPlatform()} | Native: ${Capacitor.isNativePlatform()}`
    );

    if (Capacitor.isNativePlatform()) {
      alert("2. Native App");

      // 👇 YAHAN ADD KARO
      alert(`WEB_CLIENT_ID = ${WEB_CLIENT_ID}`);

      alert("3. Initializing Google Sign-In");

      await GoogleSignIn.initialize({
        clientId: WEB_CLIENT_ID,
      });

      alert("4. Google initialized");

      const result = await GoogleSignIn.signIn();

      // ...
    }

    // ...
  } catch (e: any) {
    console.error(e);
    alert(e?.message || JSON.stringify(e));
  }
};
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 pb-0">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          {/* Top Section */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center">
                <img
                  src="/workkerzapp.png"
                  alt="Workkerz"
                  className="w-14 h-14 rounded-2xl object-cover"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>

            <p className="text-slate-500 mt-3 leading-relaxed">
              Sign in to access bookings, workers, projects and your Workkerz
              dashboard.
            </p>
          </div>

          {/* Features */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <Briefcase className="w-5 h-5 mx-auto text-orange-500 mb-2" />
                <p className="text-xs font-medium text-slate-600">Jobs</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <svg
                  className="w-5 h-5 mx-auto text-orange-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5V4H2v16h5"
                  />
                </svg>

                <p className="text-xs font-medium text-slate-600">Booking</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <svg
                  className="w-5 h-5 mx-auto text-orange-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"
                  />
                </svg>

                <p className="text-xs font-medium text-slate-600">Workers</p>
              </div>
            </div>
          </div>

          {/* Google Button */}
          <div className="px-8 pb-8">
            <button
              onClick={signInWithGoogle}
              className="w-full h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-semibold text-slate-700 shadow-sm hover:shadow-md"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-400 mt-5">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">Powered by Workkerz</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { supabase } from "@/lib/supabase";
import { Briefcase, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
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

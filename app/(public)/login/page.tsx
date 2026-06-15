"use client";

import { supabase } from "@/lib/supabase";
import { ArrowRight, ShieldCheck, Users, Briefcase } from "lucide-react";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://workkerz.com/dashboard",
      },
    });

    if (error) {
      console.error("Google Login Error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
          {/* Top */}
          <div className="p-8 text-center">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-orange-100 flex items-center justify-center mb-6">
              <img
                src="/workkerzapp.png"
                alt="Workkerz"
                className="w-16 h-16 rounded-2xl object-cover"
              />
            </div>

            <h1 className="text-4xl font-black text-slate-900">
              Welcome Back
            </h1>

            <p className="text-slate-500 mt-4 leading-relaxed">
              Find trusted workers, manage bookings and access your Workkerz dashboard.
            </p>
          </div>

          {/* Features */}
          <div className="px-8">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <Users className="w-5 h-5 mx-auto text-[#FF5C39] mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Verified
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <Briefcase className="w-5 h-5 mx-auto text-[#FF5C39] mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Skilled
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <ShieldCheck className="w-5 h-5 mx-auto text-[#FF5C39] mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Trusted
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div className="px-8 py-8">
            <button
              onClick={signInWithGoogle}
              className="
                w-full
                h-14
                rounded-2xl
                border
                border-slate-200
                bg-white
                hover:bg-slate-50
                flex
                items-center
                justify-center
                gap-3
                font-semibold
                text-slate-700
                shadow-sm
                hover:shadow-md
                transition-all
              "
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />

              Continue with Google

              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#FF5C39]" />

                <p className="text-sm text-slate-700 font-medium">
                  Trusted by thousands of workers and customers across India
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Powered by Workkerz
        </p>
      </div>
    </div>
  );
}
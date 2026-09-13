"use client";

import { supabase } from "@/lib/supabase";
import { Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";
import { Capacitor } from "@capacitor/core";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";

const WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID!;

const IOS_APP_BUNDLE_ID = "com.workkerz.app";

/* =========================================
   SIMPLE RANDOM STRING
   iOS WebView compatible
========================================= */
function generateNonce(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
}

export default function LoginPage() {
  const router = useRouter();

  /* =========================================
     GOOGLE LOGIN
     ANDROID
========================================= */
  const signInWithGoogle = async () => {
    try {
      await GoogleSignIn.initialize({
        clientId: WEB_CLIENT_ID,
      });

      const result = await GoogleSignIn.signIn();

      if (!result.idToken) {
        throw new Error("Google ID Token not received.");
      }

      const { error } =
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: result.idToken,
        });

      if (error) {
        throw error;
      }

      router.replace("/");
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);

      const message =
        err?.errorMessage ||
        err?.message ||
        "Unable to sign in with Google.";

      if (
        message.toLowerCase().includes("cancel")
      ) {
        return;
      }

      alert(message);
    }
  };

  /* =========================================
     APPLE LOGIN
     iOS
========================================= */
  const signInWithApple = async () => {
    try {
      const nonce = generateNonce(32);
      const state = generateNonce(32);

      const result =
        await SignInWithApple.authorize({
          clientId: IOS_APP_BUNDLE_ID,
          redirectURI: "",
          scopes: "email name",
          state,
          nonce,
        });

      const identityToken =
        result?.response?.identityToken;

      if (!identityToken) {
        throw new Error(
          "Apple ID Token not received."
        );
      }

      const { data, error } =
        await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: identityToken,
          nonce,
        });

      if (error) {
        throw error;
      }

      /* =========================================
         APPLE NAME
         Apple normally provides name only
         during the first authorization.
      ========================================= */
      const givenName =
        result?.response?.givenName || "";

      const familyName =
        result?.response?.familyName || "";

      const fullName = [
        givenName,
        familyName,
      ]
        .filter(Boolean)
        .join(" ");

      if (fullName) {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            given_name: givenName,
            family_name: familyName,
          },
        });
      }

      console.log(
        "Apple Login Success:",
        data
      );

      router.replace("/");
    } catch (err: any) {
      console.error(
        "Apple Sign-In Error:",
        err
      );

      const message =
        err?.errorMessage ||
        err?.message ||
        "Unable to sign in with Apple.";

      if (
        message.toLowerCase().includes("cancel")
      ) {
        return;
      }

      alert(message);
    }
  };

  /* =========================================
     PLATFORM LOGIN
========================================= */
  const signIn = async () => {
    const platform = Capacitor.getPlatform();

    /* iOS → APPLE */
    if (platform === "ios") {
      await signInWithApple();
      return;
    }

    /* Android → GOOGLE */
    if (platform === "android") {
      await signInWithGoogle();
      return;
    }

    /* Website → GOOGLE */
    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error(
        "Web Google Sign-In Error:",
        err
      );

      alert(
        err?.message ||
          "Unable to sign in. Please try again."
      );
    }
  };

  const isIOS =
    Capacitor.isNativePlatform() &&
    Capacitor.getPlatform() === "ios";

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* BACK */}
          <div className="p-6 pb-0">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />

              <span className="text-sm font-medium">
                Back
              </span>
            </button>
          </div>

          {/* HEADER */}
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

            <h1 className="text-3xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="text-slate-500 mt-3 leading-relaxed">
              Sign in to access bookings, workers,
              projects and your Workkerz dashboard.
            </p>
          </div>

          {/* FEATURES */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-3 gap-3">

              {/* JOBS */}
              <div className="bg-slate-50 rounded-2xl p-3 text-center">
                <Briefcase className="w-5 h-5 mx-auto text-orange-500 mb-2" />

                <p className="text-xs font-medium text-slate-600">
                  poeple
                </p>
              </div>

              {/* BOOKING */}
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

                <p className="text-xs font-medium text-slate-600">
                  Product
                </p>
              </div>

              {/* WORKERS */}
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
                    d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-4-4-4-4z"
                  />
                </svg>

                <p className="text-xs font-medium text-slate-600">
                  Movement
                </p>
              </div>

            </div>
          </div>

          {/* LOGIN */}
          <div className="px-8 pb-8">

            <button
              onClick={signIn}
              className="w-full h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-3 font-semibold text-slate-700 shadow-sm hover:shadow-md"
            >

              {/* iOS → APPLE */}
              {isIOS ? (
                <>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.1.81 1.21-.25 2.37-.94 3.65-.84 1.54.12 2.7.74 3.46 1.87-3.18 1.91-2.43 6.1.49 7.77-.58 1.52-1.33 3.03-2.7 4.37zM12.03 7.25C11.88 5 13.7 3.13 15.87 3c.3 2.6-2.35 4.55-3.84 4.25z" />
                  </svg>

                  <span>
                    Continue with Apple
                  </span>
                </>
              ) : (
                <>
                  {/* GOOGLE */}
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />

                  <span>
                    Continue with Google
                  </span>
                </>
              )}

              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-400 mt-5">
              By continuing, you agree to our Terms &
              Privacy Policy.
            </p>

          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Powered by Workkerz
          </p>
        </div>

      </div>
    </div>
  );
}
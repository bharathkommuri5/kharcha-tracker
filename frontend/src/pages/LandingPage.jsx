import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { Spinner } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { BarChart3, Mail, Users, Zap } from "../lib/icons.js";

const HAS_GOOGLE = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

const FEATURES = [
  { Icon: Zap, title: "Quick add", body: "Slider or exact amount, category & payment mode." },
  { Icon: BarChart3, title: "Live charts", body: "Category, payment-mode and daily-trend views." },
  { Icon: Users, title: "Teams", body: "See a group's combined spending in one place." },
  { Icon: Mail, title: "Emailed reports", body: "Month-to-date or a custom range, straight to your inbox." },
];

export default function LandingPage() {
  const { isAuthenticated, loading, token, loginWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  if (loading || (token && !isAuthenticated)) {
    return (
      <div className="flex h-full items-center justify-center bg-bg text-faint">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/app" replace />;

  const handleGoogle = async (cred) => {
    setBusy(true);
    try {
      await loginWithGoogle(cred.credential);
    } catch (e) {
      toast.error(apiErrorMessage(e, "Google sign-in failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-full items-center justify-center bg-bg p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-surface shadow-pop ring-1 ring-line md:grid-cols-[1.05fr_1fr]">
        {/* left / brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-accent p-9 text-white md:flex">
          <BrandMark
            size={360}
            rounded={false}
            className="pointer-events-none absolute -bottom-20 -right-24 opacity-[0.09]"
          />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <BrandMark size={34} className="rounded-[9px] ring-1 ring-white/20" />
              <span className="text-[15px] font-semibold">Kharcha Tracker</span>
            </div>
            <h1 className="mt-10 max-w-xs text-[27px] font-bold leading-tight tracking-tight">
              Know where every rupee goes.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-indigo-100">
              Log daily expenses in seconds and see your whole month at a glance.
            </p>
          </div>

          <ul className="relative mt-10 space-y-5">
            {FEATURES.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/10">
                  <Icon size={17} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-[13px] leading-snug text-indigo-200">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* right / sign-in panel */}
        <div className="flex flex-col justify-center gap-7 p-9">
          <div className="flex items-center gap-2 md:hidden">
            <BrandMark size={30} className="rounded-lg" />
            <span className="text-sm font-bold text-fg">Kharcha Tracker</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-fg">Sign in</h2>
            <p className="mt-1 text-sm text-muted">
              Use your Google account. A new account is created automatically the first time.
            </p>
          </div>

          {HAS_GOOGLE ? (
            <div className="flex">
              {busy ? (
                <Spinner className="h-6 w-6 text-accent" />
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => toast.error("Google sign-in was cancelled or failed")}
                  useOneTap={false}
                  width="280"
                  theme={isDark ? "filled_black" : "outline"}
                />
              )}
            </div>
          ) : (
            <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 ring-1 ring-amber-500/30">
              Google sign-in isn’t configured (<code>VITE_GOOGLE_CLIENT_ID</code> is empty).
            </p>
          )}

          <p className="text-xs leading-relaxed text-faint">
            Your spending data stays private to your account. Reports are only emailed to you when
            you ask.
          </p>
        </div>
      </div>
    </div>
  );
}

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { Button, Field, Spinner, TextInput } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === "true";
const HAS_GOOGLE = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

function Feature({ icon, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="text-xl">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-indigo-200">{children}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, loading, token, loginWithGoogle, loginDev } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();
  const [devEmail, setDevEmail] = useState("");
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

  const handleDev = async (e) => {
    e.preventDefault();
    if (!devEmail.trim()) return;
    setBusy(true);
    try {
      await loginDev(devEmail.trim());
    } catch (err) {
      toast.error(apiErrorMessage(err, "Dev login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-full items-center justify-center bg-bg p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-surface shadow-pop ring-1 ring-line md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-accent p-8 text-white md:flex">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark size={36} className="rounded-[9px] ring-1 ring-white/20" />
              <span className="font-semibold">Kharcha Tracker</span>
            </div>
            <h1 className="mt-8 text-2xl font-bold leading-tight">Know where every rupee goes.</h1>
            <p className="mt-2 text-sm text-indigo-100">
              Log daily expenses in seconds, see your month at a glance, and email yourself a
              report anytime.
            </p>
          </div>
          <div className="space-y-4">
            <Feature icon="⚡" title="Quick add">
              Slider or exact amount, category & payment mode.
            </Feature>
            <Feature icon="📊" title="Live charts">
              Category, payment-mode and daily-trend views.
            </Feature>
            <Feature icon="✉️" title="Emailed reports">
              Month-to-date or a custom range.
            </Feature>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 p-8">
          <div className="flex items-center gap-2 md:hidden">
            <BrandMark size={30} className="rounded-lg" />
            <span className="text-sm font-bold text-fg">Kharcha Tracker</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">Sign in</h2>
            <p className="text-sm text-muted">Use your Google account to continue.</p>
          </div>

          {HAS_GOOGLE ? (
            <div className="flex justify-center">
              {busy ? (
                <Spinner className="h-6 w-6 text-accent" />
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => toast.error("Google sign-in was cancelled or failed")}
                  useOneTap={false}
                  theme={isDark ? "filled_black" : "outline"}
                />
              )}
            </div>
          ) : (
            <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-600 ring-1 ring-amber-500/30">
              Google sign-in isn’t configured (<code>VITE_GOOGLE_CLIENT_ID</code> is empty). Use the
              dev login below.
            </p>
          )}

          {DEV_AUTH && (
            <form onSubmit={handleDev} className="space-y-3 rounded-xl bg-surface-2 p-4 ring-1 ring-line">
              <p className="text-xs font-semibold uppercase tracking-wide text-faint">Dev login</p>
              <Field label="Email">
                <TextInput
                  type="email"
                  required
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Button type="submit" variant="secondary" className="w-full" loading={busy}>
                Continue without Google
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

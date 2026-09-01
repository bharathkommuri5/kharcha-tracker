import { useState } from "react";
import AvatarUploader from "../components/AvatarUploader.jsx";
import { Button, Card, Field, TextInput } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";

function Readonly({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-sm text-fg">{value}</p>
    </div>
  );
}

export default function ProfileView() {
  const { user, updateUsername, uploadAvatar, removeAvatar, logout } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);

  const saveUsername = async () => {
    const v = username.trim();
    if (v.length < 2) return toast.error("Username must be at least 2 characters");
    if (v === user.username) return;
    setSaving(true);
    try {
      await updateUsername(v);
      toast.success("Username updated");
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not update username"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-fg">Profile</h1>

      <Card className="max-w-xl space-y-6 p-5 sm:p-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-fg">Photo</p>
          <AvatarUploader kind="user" entity={user} onUpload={uploadAvatar} onRemove={removeAvatar} />
        </div>

        <div className="h-px bg-line" />

        <Field label="Display username">
          <div className="flex gap-2">
            <TextInput
              value={username}
              maxLength={40}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button onClick={saveUsername} loading={saving} disabled={username.trim() === user?.username}>
              Save
            </Button>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Readonly label="Name (from Google)" value={user?.name} />
          <Readonly label="Email" value={user?.email} />
        </div>

        {user?.is_superadmin && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            ★ Super admin
          </span>
        )}

        <div className="h-px bg-line" />
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}

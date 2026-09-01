import { useRef, useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { TeamAvatar, UserAvatar } from "./Avatar.jsx";
import { Button, Spinner } from "./ui/index.jsx";

// Generic uploader. `kind` = "user" | "team" chooses the avatar shape.
export default function AvatarUploader({ kind = "user", entity, onUpload, onRemove, size = 88 }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const Avatar = kind === "team" ? TeamAvatar : UserAvatar;
  const prop = kind === "team" ? { team: entity } : { user: entity };
  const hasImage = Boolean(entity?.avatar_url);

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file");
    if (file.size > 4 * 1024 * 1024) return toast.error("Image must be under 4 MB");
    run(() => onUpload(file));
  };

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Upload failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar {...prop} size={size} className={busy ? "opacity-40" : ""} />
        {busy && (
          <span className="absolute inset-0 grid place-items-center">
            <Spinner className="h-5 w-5 text-accent" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
          {hasImage ? "Change photo" : "Upload photo"}
        </Button>
        {hasImage && onRemove && (
          <button
            onClick={() => run(onRemove)}
            disabled={busy}
            className="text-left text-xs font-medium text-muted hover:text-negative"
          >
            Remove photo
          </button>
        )}
        <p className="text-xs text-faint">JPG or PNG, up to 4 MB.</p>
      </div>
    </div>
  );
}

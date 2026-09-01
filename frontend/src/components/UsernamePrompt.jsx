import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { Button, Field, Modal, TextInput } from "./ui/index.jsx";

const SEEN_KEY = "kharcha_username_prompt_seen";

export default function UsernamePrompt() {
  const { user, updateUsername } = useAuth();
  const toast = useToast();
  const seen = localStorage.getItem(SEEN_KEY) === "1";
  const [open, setOpen] = useState(!seen);
  const [value, setValue] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);

  const close = () => {
    localStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  };

  const save = async () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      toast.error("Username must be at least 2 characters");
      return;
    }
    setSaving(true);
    try {
      await updateUsername(trimmed);
      toast.success("Display name saved");
      close();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not save username"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Welcome, ${user?.name?.split(" ")[0] || "there"}! 👋`}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Skip for now
          </Button>
          <Button loading={saving} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <Field label="Display username (optional)" hint="You can change this later from your profile.">
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={40}
          autoFocus
        />
      </Field>
    </Modal>
  );
}

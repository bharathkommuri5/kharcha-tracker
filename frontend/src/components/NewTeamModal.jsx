import { useState } from "react";
import { useTeams } from "../context/TeamsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import { Button, Field, Modal, TextInput } from "./ui/index.jsx";

export default function NewTeamModal({ open, onClose, onCreated }) {
  const { createTeam } = useTeams();
  const toast = useToast();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return toast.error("Enter a team name");
    setBusy(true);
    try {
      const team = await createTeam(name.trim());
      toast.success("Team created");
      setName("");
      onClose();
      onCreated?.(team);
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not create team"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New team"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            Create
          </Button>
        </>
      }
    >
      <Field label="Team name" hint="You can add members and a photo next.">
        <TextInput
          value={name}
          maxLength={60}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. Roommates, Goa trip"
        />
      </Field>
    </Modal>
  );
}

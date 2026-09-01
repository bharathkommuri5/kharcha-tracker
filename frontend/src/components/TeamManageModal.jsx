import { useEffect, useState } from "react";
import api from "../lib/api.js";
import { useTeams } from "../context/TeamsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { apiErrorMessage } from "../lib/api.js";
import AvatarUploader from "./AvatarUploader.jsx";
import { UserAvatar } from "./Avatar.jsx";
import MemberPicker from "./MemberPicker.jsx";
import { Button, Field, Modal, Spinner, TextInput } from "./ui/index.jsx";

export default function TeamManageModal({ teamId, open, onClose, onChanged, onDeleted }) {
  const { refresh: refreshTeams } = useTeams();
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const r = await api.get(`/teams/${teamId}`);
    setDetail(r.data);
    setName(r.data.name);
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, teamId]);

  const apply = (data) => {
    setDetail(data);
    setName(data.name);
    onChanged?.();
    refreshTeams();
  };

  const guard = async (fn) => {
    setBusy(true);
    try {
      apply((await fn()).data);
    } catch (e) {
      toast.error(apiErrorMessage(e, "Something went wrong"));
    } finally {
      setBusy(false);
    }
  };

  const rename = () => {
    if (name.trim() && name.trim() !== detail.name) guard(() => api.patch(`/teams/${teamId}`, { name: name.trim() }));
  };
  const uploadAvatar = (file) => {
    const form = new FormData();
    form.append("file", file);
    return guard(() => api.post(`/teams/${teamId}/avatar`, form));
  };
  const removeAvatar = () => guard(() => api.delete(`/teams/${teamId}/avatar`));
  const addMember = (u) => guard(() => api.post(`/teams/${teamId}/members`, { user_id: u.id }));
  const removeMember = (uid) => guard(() => api.request({ method: "delete", url: `/teams/${teamId}/members/${uid}` }));

  const del = async () => {
    if (!window.confirm("Delete this team for everyone?")) return;
    setBusy(true);
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success("Team deleted");
      refreshTeams();
      onDeleted?.();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not delete"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage team" size="lg">
      {!detail ? (
        <div className="flex justify-center py-10 text-faint">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold text-fg">Team photo</p>
            <AvatarUploader kind="team" entity={detail} onUpload={uploadAvatar} onRemove={removeAvatar} />
          </div>

          <Field label="Team name">
            <div className="flex gap-2">
              <TextInput value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
              <Button onClick={rename} loading={busy} disabled={name.trim() === detail.name}>
                Save
              </Button>
            </div>
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-fg">Members ({detail.members.length})</p>
              <Button size="sm" variant="secondary" onClick={() => setAdding((a) => !a)}>
                {adding ? "Done" : "＋ Add member"}
              </Button>
            </div>

            {adding && (
              <div className="mb-3">
                <MemberPicker
                  existingIds={detail.members.map((m) => m.user.id)}
                  onPick={addMember}
                />
              </div>
            )}

            <ul className="divide-y divide-line rounded-xl border border-line">
              {detail.members.map((m) => (
                <li key={m.user.id} className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar user={m.user} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">{m.user.name}</span>
                    <span className="block truncate text-xs text-faint">{m.user.email}</span>
                  </span>
                  {m.role === "admin" && (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                      admin
                    </span>
                  )}
                  <button
                    onClick={() => removeMember(m.user.id)}
                    disabled={busy}
                    className="rounded-lg p-1.5 text-faint hover:bg-negative/15 hover:text-negative"
                    aria-label="Remove member"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-line" />
          <button
            onClick={del}
            disabled={busy}
            className="text-sm font-semibold text-negative hover:underline"
          >
            Delete team
          </button>
        </div>
      )}
    </Modal>
  );
}

import { useState } from "react";
import Modal from "./Modal";
import modalStyles from "./modalStyles";
import { createUser } from "../../services/userAdmin";
import { errorMessage } from "../../services/errors";
import styles from "./SmallModals.module.css";

interface ConfirmProps {
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** "Are you sure?" for deleting a plant or a user. */
export function ConfirmModal({ title, message, confirmLabel, busy, onConfirm, onClose }: ConfirmProps) {
  return (
    <Modal title={title} width={400} onClose={onClose}>
      <p className={styles.message}>{message}</p>
      <div className={modalStyles.footBar}>
        <span></span>
        <div className={modalStyles.footButtons}>
          <button type="button" className={modalStyles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={modalStyles.danger} onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface InviteProps {
  onCreated: (email: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

/** "Invite user": creates an account with a temporary password. */
export function InviteModal({ onCreated, onError, onClose }: InviteProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 8) {
      return onError("Enter an email and a temporary password of at least 8 characters.");
    }
    setSaving(true);
    try {
      await createUser({ email, name, password });
      onCreated(email.trim());
    } catch (err) {
      onError(errorMessage(err, "Could not create the account."));
      setSaving(false);
    }
  };

  return (
    <Modal title="Invite user" width={440} onClose={onClose}>
      <form onSubmit={submit}>
        <div className={styles.form}>
          <label className={styles.field}>
            Email
            <input type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@nddu.edu.ph" />
          </label>
          <label className={styles.field}>
            Name
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className={styles.field}>
            Temporary password
            <input type="text" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
            <span className={styles.helper}>At least 8 characters. Share it with them so they can sign in.</span>
          </label>
        </div>
        <div className={modalStyles.footBar}>
          <span></span>
          <div className={modalStyles.footButtons}>
            <button type="button" className={modalStyles.secondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={modalStyles.primary} disabled={saving}>
              {saving ? "Creating…" : "Create account"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

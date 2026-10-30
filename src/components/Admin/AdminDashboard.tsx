import { useState } from "react";
import pb from "../../back-end/db";
import type { Plant } from "../../types/plant";
import type { UserRecord } from "../../services/userAdmin";
import { deletePlant } from "../../services/plantAdmin";
import { deleteUser, setUserAdmin } from "../../services/userAdmin";
import { downloadPlantQRCode, generatePlantQRCode, printPlantQRCode } from "../../services/qrCodeService";
import { errorMessage } from "../../services/errors";
import { useIsMobile } from "../../hooks/useMediaQuery";
import OverviewTab from "./OverviewTab";
import PlantsTab from "./PlantsTab";
import TaxonomyTab from "./TaxonomyTab";
import UsersTab from "./UsersTab";
import PlantModal from "./PlantModal";
import QRModal from "./QRModal";
import { ConfirmModal, InviteModal } from "./SmallModals";
import Toasts from "./Toasts";
import { useToasts } from "./useToasts";
import { useAdminData } from "./useAdminData";
import styles from "./AdminDashboard.module.css";

type Tab = "overview" | "plants" | "taxonomy" | "users";

const TABS: Array<{ key: Tab; label: string; icon: string; sub: string }> = [
  { key: "overview", label: "Overview", icon: "bi-house", sub: "What needs your attention today" },
  { key: "plants", label: "Plants", icon: "bi-tree", sub: "Every plant profile and its QR tag" },
  { key: "taxonomy", label: "Taxonomy", icon: "bi-diagram-3", sub: "Create and manage the biological classification system" },
  { key: "users", label: "Users", icon: "bi-people", sub: "People who can sign in to Flora" },
];

interface Props {
  onLogout?: () => void;
}

/** Initials for the account chip: "BioSoc Admin" -> "BA", an email -> its first two letters. */
const accountInitials = (name: string, email: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (name || email).slice(0, 2).toUpperCase();
};

export default function AdminDashboard({ onLogout }: Props) {
  const isMobile = useIsMobile();
  const data = useAdminData();
  const { toasts, push, dismiss } = useToasts();

  const [tab, setTab] = useState<Tab>("overview");
  const [qrPlant, setQrPlant] = useState<Plant | null>(null);
  const [qrImage, setQrImage] = useState("");
  const [qrBusy, setQrBusy] = useState(false);
  const [editing, setEditing] = useState<Plant | "new" | null>(null);
  const [deletingPlant, setDeletingPlant] = useState<Plant | null>(null);
  const [roleChange, setRoleChange] = useState<{ user: UserRecord; makeAdmin: boolean } | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [inviting, setInviting] = useState(false);
  const [busy, setBusy] = useState(false);

  const account = pb.authStore.record;
  const accountEmail = String(account?.email ?? "");
  const accountName = String(account?.name ?? "") || accountEmail.split("@")[0];
  const current = TABS.find((t) => t.key === tab)!;
  const isUsers = tab === "users";

  const openNew = () => setEditing("new");

  /* ---------- QR ---------- */
  const openQr = async (plant: Plant) => {
    setQrPlant(plant);
    setQrImage("");
    try {
      setQrImage(await generatePlantQRCode({ plantId: plant.id, width: 400 }));
    } catch (err) {
      setQrPlant(null);
      push("error", "QR tag", errorMessage(err, "Failed to generate QR code"));
    }
  };

  const qrAction = async (action: (plant: Plant) => Promise<void>, failed: string) => {
    if (!qrPlant) return;
    setQrBusy(true);
    try {
      await action(qrPlant);
    } catch (err) {
      push("error", "QR tag", errorMessage(err, failed));
    } finally {
      setQrBusy(false);
    }
  };

  /* ---------- confirmations ---------- */
  const confirmDeletePlant = async () => {
    if (!deletingPlant) return;
    setBusy(true);
    try {
      await deletePlant(deletingPlant.id);
      await data.reloadPlants();
      push("success", "Plant deleted", `${deletingPlant.commonName} was removed.`);
    } catch (err) {
      push("error", "Plant", errorMessage(err, "Failed to delete plant"));
    } finally {
      setDeletingPlant(null);
      setBusy(false);
    }
  };

  const confirmRole = async () => {
    if (!roleChange) return;
    setBusy(true);
    try {
      await setUserAdmin(roleChange.user.id, roleChange.makeAdmin);
      await data.reloadUsers();
      push("success", "Role changed", `${roleChange.user.email} is now ${roleChange.makeAdmin ? "an admin" : "a user"}.`);
    } catch (err) {
      push("error", "Users", errorMessage(err, "Failed to change the role"));
    } finally {
      setRoleChange(null);
      setBusy(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    setBusy(true);
    try {
      await deleteUser(deletingUser.id);
      await data.reloadUsers();
      push("success", "User deleted", `${deletingUser.email} was removed.`);
    } catch (err) {
      push("error", "Users", errorMessage(err, "Failed to delete user"));
    } finally {
      setDeletingUser(null);
      setBusy(false);
    }
  };

  /* ---------- content ---------- */
  const genera = (data.taxonomy?.genus ?? [])
    .map((g) => ({ id: g.id, name: g.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const content = data.loading ? (
    <p className={styles.state}>Loading…</p>
  ) : data.error ? (
    <div className={styles.stateBox} role="alert">
      <p>{data.error}</p>
      <button type="button" onClick={data.reload}>
        Try again
      </button>
    </div>
  ) : tab === "overview" ? (
    <OverviewTab plants={data.plants} users={data.users} isMobile={isMobile} onEditPlant={setEditing} />
  ) : tab === "plants" ? (
    <PlantsTab plants={data.plants} isMobile={isMobile} onQr={openQr} onEdit={setEditing} onDelete={setDeletingPlant} />
  ) : tab === "taxonomy" ? (
    <TaxonomyTab
      taxonomy={data.taxonomy}
      isMobile={isMobile}
      create={data.createTaxonomy}
      onCreated={data.reloadTaxonomy}
      notify={push}
    />
  ) : (
    <UsersTab
      users={data.users}
      currentUserId={account?.id}
      isMobile={isMobile}
      onRole={(user, makeAdmin) => setRoleChange({ user, makeAdmin })}
      onDelete={setDeletingUser}
    />
  );

  const modals = (
    <>
      {qrPlant && (
        <QRModal
          plant={{ name: qrPlant.commonName, scientificName: qrPlant.scientificName, code: qrPlant.code }}
          qrCodeDataUrl={qrImage}
          busy={qrBusy || !qrImage}
          onDownload={() => qrAction((p) => downloadPlantQRCode(p.id, p.commonName), "Failed to download QR code")}
          onPrint={() => qrAction((p) => printPlantQRCode(p.id, p.commonName, p.scientificName), "Failed to print QR code")}
          onClose={() => setQrPlant(null)}
        />
      )}
      {editing && (
        <PlantModal
          plant={editing === "new" ? null : editing}
          plants={data.plants}
          genera={genera}
          onSaved={async (name) => {
            setEditing(null);
            await data.reloadPlants();
            push("success", "Plant saved", `${name} was saved.`);
          }}
          onError={(message) => push("error", "Plant", message)}
          onClose={() => setEditing(null)}
        />
      )}
      {deletingPlant && (
        <ConfirmModal
          title="Delete plant"
          message={`Delete ${deletingPlant.commonName}? Its profile and QR tag will stop working. This can't be undone.`}
          confirmLabel="Delete"
          busy={busy}
          onConfirm={confirmDeletePlant}
          onClose={() => setDeletingPlant(null)}
        />
      )}
      {roleChange && (
        <ConfirmModal
          title="Change role"
          message={
            roleChange.makeAdmin
              ? `Make ${roleChange.user.email} an admin? They will be able to edit plants and manage users.`
              : `Remove admin access from ${roleChange.user.email}?`
          }
          confirmLabel={roleChange.makeAdmin ? "Make admin" : "Remove admin"}
          busy={busy}
          onConfirm={confirmRole}
          onClose={() => setRoleChange(null)}
        />
      )}
      {deletingUser && (
        <ConfirmModal
          title="Delete user"
          message={`Delete ${deletingUser.email}? They will no longer be able to sign in. This can't be undone.`}
          confirmLabel="Delete"
          busy={busy}
          onConfirm={confirmDeleteUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
      {inviting && (
        <InviteModal
          onCreated={async (email) => {
            setInviting(false);
            await data.reloadUsers();
            push("success", "User created", `${email} can now sign in.`);
          }}
          onError={(message) => push("error", "Users", message)}
          onClose={() => setInviting(false)}
        />
      )}
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </>
  );

  /* ---------------- phone ---------------- */
  if (isMobile) {
    return (
      <div className={`flora ${styles.mobile}`}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileTitleBlock}>
            <span>Flora admin</span>
            <h1>{current.label}</h1>
          </div>
          {!isUsers && (
            <button type="button" className={styles.mobilePlus} onClick={openNew} title="New plant" aria-label="New plant">
              <i className="bi bi-plus-lg"></i>
            </button>
          )}
        </div>
        <div className={styles.mobileContent}>{content}</div>
        <nav className={styles.mobileTabs} aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`${styles.mobileTab} ${tab === t.key ? styles.mobileTabOn : ""}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`bi ${t.icon}`}></i>
              {t.label}
            </button>
          ))}
        </nav>
        {modals}
      </div>
    );
  }

  /* ---------------- desktop ---------------- */
  const badge = (key: Tab) => (key === "plants" ? data.plants.length : key === "users" ? data.users.length : "");

  return (
    <div className={`flora ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/logo-biosoc.png" alt="BioSoc" />
          <div>
            <span className={styles.brandName}>Flora</span>
            <span className={styles.brandSub}>Admin console</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`${styles.navItem} ${tab === t.key ? styles.navOn : ""}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`bi ${t.icon}`}></i>
              <span>{t.label}</span>
              <span className={styles.navBadge}>{badge(t.key)}</span>
            </button>
          ))}
        </nav>
        <div className={styles.account}>
          <span className={styles.avatar}>{accountInitials(accountName, accountEmail)}</span>
          <div className={styles.accountText}>
            <span>{accountName}</span>
            <span>{accountEmail}</span>
          </div>
          {onLogout && (
            <button type="button" className={styles.logout} onClick={onLogout} title="Log out" aria-label="Log out">
              <i className="bi bi-box-arrow-right"></i>
            </button>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.pageHead}>
          <div className={styles.pageTitle}>
            <h1>{current.label}</h1>
            <span>{current.sub}</span>
          </div>
          {isUsers ? (
            <button type="button" className={styles.headBtn} onClick={() => setInviting(true)}>
              <i className="bi bi-person-plus"></i>Invite user
            </button>
          ) : (
            <button type="button" className={styles.headBtn} onClick={openNew}>
              <i className="bi bi-plus-lg"></i>New plant
            </button>
          )}
        </div>
        <div className={styles.content}>{content}</div>
      </main>
      {modals}
    </div>
  );
}

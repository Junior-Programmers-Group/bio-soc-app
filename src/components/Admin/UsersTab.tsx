import { useEffect, useState } from "react";
import type { UserRecord } from "../../services/userAdmin";
import { formatMonthYear, initialsOf } from "../../lib/format";
import statusStyles from "../../lib/status.module.css";
import styles from "./tabs.module.css";

interface Props {
  users: UserRecord[];
  currentUserId?: string;
  isMobile: boolean;
  onRole: (user: UserRecord, makeAdmin: boolean) => void;
  onDelete: (user: UserRecord) => void;
}

const verificationClass = (verified: boolean) => (verified ? statusStyles.lc : statusStyles.vu);

export default function UsersTab({ users, currentUserId, isMobile, onRole, onDelete }: Props) {
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // close the "more" menu when clicking anywhere else
  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  const menu = (user: UserRecord, mobile: boolean) => {
    const isYou = user.id === currentUserId;
    return (
      <div className={styles.moreWrap}>
        <button
          type="button"
          className={mobile ? styles.mIcon : styles.moreBtn}
          onClick={(e) => {
            e.stopPropagation();
            setMenuFor(menuFor === user.id ? null : user.id);
          }}
          title="More"
          aria-label="More"
          aria-expanded={menuFor === user.id}
        >
          <i className={`bi ${mobile ? "bi-three-dots-vertical" : "bi-three-dots"}`}></i>
        </button>
        {menuFor === user.id && (
          <div className={styles.menu}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                setMenuFor(null);
                onDelete(user);
              }}
              disabled={isYou}
              title={isYou ? "You can't delete your own account" : undefined}
            >
              <i className="bi bi-trash3"></i>Delete user
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        {users.map((user) => (
          <div key={user.id} className={`${styles.mCard} ${verificationClass(user.verified)}`}>
            <span className={styles.mAvatar}>{initialsOf(user.email || "??")}</span>
            <div className={styles.mName}>
              <b className={styles.email}>{user.email || "hidden"}</b>
              <span className={styles.mUserLine}>
                <span>{user.isAdmin ? "Admin" : "User"}</span>
                <span>{user.verified ? "Verified" : "Pending"}</span>
              </span>
            </div>
            {menu(user, true)}
          </div>
        ))}
      </>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.userHead}>
        <span>User</span>
        <span>Role</span>
        <span>Status</span>
        <span>Joined</span>
        <span></span>
      </div>
      {users.map((user) => {
        const isYou = user.id === currentUserId;
        return (
          <div key={user.id} className={`${styles.userRow} ${verificationClass(user.verified)}`}>
            <div className={styles.userCell}>
              <span className={styles.avatar}>{initialsOf(user.email || "??")}</span>
              <span className={styles.email}>
                {user.email || <em>hidden</em>}
                {isYou && " (you)"}
              </span>
            </div>
            <span className={styles.roleWrap}>
              <select
                className={styles.role}
                value={user.isAdmin ? "admin" : "user"}
                onChange={(e) => onRole(user, e.target.value === "admin")}
                disabled={isYou}
                title={isYou ? "You can't change your own role" : undefined}
                aria-label={`Role of ${user.email}`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <i className="bi bi-chevron-down"></i>
            </span>
            <span className={styles.verified}>
              <span className={styles.pillDot}></span>
              {user.verified ? "Verified" : "Pending"}
            </span>
            <span className={styles.joined}>{formatMonthYear(user.created)}</span>
            {menu(user, false)}
          </div>
        );
      })}
    </div>
  );
}

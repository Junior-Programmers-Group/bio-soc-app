import type { Plant } from "../../types/plant";
import type { UserRecord } from "../../services/userAdmin";
import { statusOf } from "../../lib/status";
import { formatMonthDay } from "../../lib/format";
import styles from "./tabs.module.css";

interface Props {
  plants: Plant[];
  users: UserRecord[];
  isMobile: boolean;
  onEditPlant: (plant: Plant) => void;
}

interface Activity {
  icon: string;
  text: string;
  when: string;
  time: number;
}

const toTime = (value?: string) => (value ? new Date(value.replace(" ", "T")).getTime() : 0);

/** "Added" and "updated" events, newest first, from the records' own timestamps. */
const recentActivity = (plants: Plant[]): Activity[] => {
  const events: Activity[] = [];
  for (const plant of plants) {
    const created = toTime(plant.created);
    const updated = toTime(plant.updated);
    events.push({ icon: "bi-plus", text: `${plant.commonName} was added`, when: formatMonthDay(plant.created), time: created });
    if (updated - created > 60_000) {
      events.push({
        icon: "bi-pencil",
        text: `${plant.commonName} profile was updated`,
        when: formatMonthDay(plant.updated),
        time: updated,
      });
    }
  }
  return events.sort((a, b) => b.time - a.time).slice(0, 4);
};

export default function OverviewTab({ plants, users, isMobile, onEditPlant }: Props) {
  const missing = plants.filter((p) => !p.image);
  const now = new Date();
  const addedThisMonth = plants.filter((p) => {
    const created = new Date(toTime(p.created));
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  }).length;
  const threatened = plants.filter((p) => ["VU", "EN"].includes(statusOf(p.conservationStatus).key)).length;
  const verified = users.filter((u) => u.verified).length;

  const stats = [
    { label: "Plant profiles", value: String(plants.length), note: `${addedThisMonth} added this month` },
    { label: "Missing photos", value: String(missing.length), note: "Shown below" },
    { label: "Threatened species", value: String(threatened), note: "Vulnerable or endangered" },
    { label: "Verified users", value: `${verified}/${users.length}`, note: `${users.length - verified} waiting for verification` },
  ];

  if (isMobile) {
    return (
      <>
        <div className={styles.mStats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.mStat}>
              <span>{stat.label}</span>
              <span>{stat.value}</span>
            </div>
          ))}
        </div>
        <span className={styles.mHeading}>Needs a photo · {missing.length}</span>
        {missing.slice(0, 4).map((plant) => (
          <div key={plant.id} className={`${styles.mCard} ${styles.mCardPlain}`}>
            <div className={styles.mName}>
              <b>{plant.commonName}</b>
              <small className={styles.mono}>{plant.code}</small>
            </div>
            <button type="button" className={styles.mAddPhoto} onClick={() => onEditPlant(plant)}>
              Add photo
            </button>
          </div>
        ))}
      </>
    );
  }

  const activity = recentActivity(plants);

  return (
    <>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statNote}>{stat.note}</span>
          </div>
        ))}
      </div>

      <div className={styles.twoCols}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3>Needs attention</h3>
              <span>Profiles without a photo</span>
            </div>
            <span className={styles.amber}>{missing.length}</span>
          </div>
          {missing.length === 0 && <p className={styles.empty}>Every profile has a photo.</p>}
          {missing.map((plant) => (
            <div key={plant.id} className={styles.attentionRow}>
              <div className={styles.attentionName}>
                <b>{plant.commonName}</b>
                <i>{plant.scientificName}</i>
              </div>
              <button type="button" className={styles.addPhoto} onClick={() => onEditPlant(plant)}>
                Add photo
              </button>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Recent activity</h3>
          </div>
          {activity.map((event) => (
            <div key={`${event.icon}${event.text}${event.time}`} className={styles.activityRow}>
              <span className={styles.activityIcon}>
                <i className={`bi ${event.icon}`}></i>
              </span>
              <span className={styles.activityText}>{event.text}</span>
              <span className={styles.activityWhen}>{event.when}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

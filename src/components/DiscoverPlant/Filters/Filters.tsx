import styles from "./Filters.module.css";

export default function Filters() {
  return (
    <aside className={styles.filters}>
      <FilterGroup title="Plant Type" />
      <FilterGroup title="Ecological Role" />
      <FilterGroup title="Status" />
      <FilterGroup title="Location" />
    </aside>
  );
}

function FilterGroup({ title }: { title: string }) {
  return (
    <div className={styles.group}>
      <h4>{title}</h4>
      <label><input type="radio" /> Option A</label>
      <label><input type="radio" /> Option B</label>
      <label><input type="radio" /> Option C</label>
    </div>
  );
}

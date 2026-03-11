import { useState } from "react";
import styles from "./Filters.module.css";

export default function Filters() {
  return (
    <aside className={styles.filters}>
      <FilterGroup 
        title="Plant Type" 
        options={["Herb", "Shrub", "Tree", "Aquatic"]}
      />
      <FilterGroup 
        title="Ecological Role" 
        options={["Food Source", "Medicinal", "Shelter", "Pollinator"]}
      />
      <FilterGroup 
        title="Status" 
        options={["Native", "Endemic", "Endangered", "Common"]}
      />
      <FilterGroup 
        title="Season" 
        options={["Spring", "Summer", "Fall", "Winter"]}
      />
    </aside>
  );
}

function FilterGroup({ title, options }: { title: string; options: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className={styles.group}>
      <h4>{title}</h4>
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            checked={selected === option}
            onChange={() => setSelected(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

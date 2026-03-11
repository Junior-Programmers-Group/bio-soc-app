import styles from "./SearchBar.module.css";

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function SearchBar({ search, setSearch }: Props) {
  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        placeholder="Search by name, species, or botanical term..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
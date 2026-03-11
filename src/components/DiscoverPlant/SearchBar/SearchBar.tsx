import styles from "./SearchBar.module.css";

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function SearchBar({ search, setSearch }: Props) {
  return (
    <div className={styles.searchWrapper}>
      <svg
        className={styles.searchIcon}
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
      <input
        type="text"
        placeholder="Search by name, species, or botanical term..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
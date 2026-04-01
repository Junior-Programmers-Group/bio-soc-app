import { useRef, useCallback } from "react";
import styles from "./SearchBar.module.css";

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function SearchBar({ search, setSearch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Trigger search on Enter key
      e.currentTarget.blur();
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, [setSearch]);

  return (
    <div className={styles.searchWrapper}>
      <button
        type="button"
        className={styles.searchIconBtn}
        onClick={handleSearchClick}
        aria-label="Search"
        tabIndex={-1}
      >
        <svg
          className={styles.searchIcon}
          xmlns="http://www.w3.org/2000/svg"
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
      </button>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search plants by name, species, or family..."
        value={search}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={styles.searchInput}
      />
    </div>
  );
}
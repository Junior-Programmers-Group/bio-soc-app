import { useRef, useCallback, useState } from "react";
import styles from "./SearchBar.module.css";

export type SearchType = "all" | "name" | "scientific";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
}

export default function SearchBar({ search, setSearch, searchType, setSearchType }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

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

  const getPlaceholder = (): string => {
    switch (searchType) {
      case "name":
        return "Search by common name...";
      case "scientific":
        return "Search by scientific name...";
      default:
        return "Search by name or scientific name...";
    }
  };

  const toggleFilterOptions = useCallback(() => {
    setShowFilterOptions((prev) => !prev);
  }, []);

  return (
    <div>
      {/* Search Bar with Filter Toggle Button */}
      <div className={styles.searchBarContainer}>
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
            placeholder={getPlaceholder()}
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={styles.searchInput}
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          className={styles.filterToggleBtn}
          onClick={toggleFilterOptions}
          aria-label="Toggle search filter"
          title="Toggle search filter options"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Search Type Filter - Collapsible */}
      {showFilterOptions && (
        <div className={styles.searchTypeFilter}>
          <label className={styles.filterLabel}>Search by:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="searchType"
                value="all"
                checked={searchType === "all"}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
              />
              <span>All</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="searchType"
                value="name"
                checked={searchType === "name"}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
              />
              <span>Common Name</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="searchType"
                value="scientific"
                checked={searchType === "scientific"}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
              />
              <span>Scientific Name</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
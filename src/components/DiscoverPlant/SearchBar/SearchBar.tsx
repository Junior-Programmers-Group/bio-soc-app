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
placeholder="search plants by species, name, or taxonomy..."
value={search}
onChange={(e) => setSearch(e.target.value)}
/>
</div>
);
}
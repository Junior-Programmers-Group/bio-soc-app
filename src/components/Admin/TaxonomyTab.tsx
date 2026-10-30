import { useState } from "react";
import type { TaxonomyData } from "../../back-end/hooks/useFetchTaxonomy";
import type { BaseTaxonomyRecord } from "../../back-end/types/taxonomyClass";
import { errorMessage } from "../../services/errors";
import styles from "./tabs.module.css";

type RankKey = keyof TaxonomyData;
type TaxRecord = BaseTaxonomyRecord & Record<string, unknown>;

interface Rank {
  key: RankKey;
  name: string;
  plural: string;
  /** The rank above, whose record this one belongs to. */
  parent: RankKey | "";
  /** Domain and Family also take an optional "date discovered". */
  hasDate: boolean;
  example: string;
}

const RANKS: Rank[] = [
  { key: "domain", name: "Domain", plural: "domains", parent: "", hasDate: true, example: "Eukarya" },
  { key: "kingdom", name: "Kingdom", plural: "kingdoms", parent: "domain", hasDate: false, example: "Plantae" },
  { key: "phylum", name: "Phylum", plural: "phyla", parent: "kingdom", hasDate: false, example: "Tracheophyta" },
  { key: "class", name: "Class", plural: "classes", parent: "phylum", hasDate: false, example: "Magnoliopsida" },
  { key: "order", name: "Order", plural: "orders", parent: "class", hasDate: false, example: "Fabales" },
  { key: "family", name: "Family", plural: "families", parent: "order", hasDate: true, example: "Fabaceae" },
  { key: "genus", name: "Genus", plural: "genera", parent: "family", hasDate: false, example: "Pterocarpus" },
];

interface FormState {
  parentId: string;
  name: string;
  description: string;
  date: string;
}

const EMPTY: FormState = { parentId: "", name: "", description: "", date: "" };

interface Props {
  taxonomy: TaxonomyData | undefined;
  isMobile: boolean;
  create: (category: string, fields: Record<string, string>) => Promise<void>;
  onCreated: () => Promise<void>;
  notify: (type: "success" | "error", title: string, message: string) => void;
}

export default function TaxonomyTab({ taxonomy, isMobile, create, onCreated, notify }: Props) {
  const [rankKey, setRankKey] = useState<RankKey>("genus");
  const [forms, setForms] = useState<Partial<Record<RankKey, FormState>>>({});
  const [saving, setSaving] = useState(false);

  const records = (key: RankKey) => ((taxonomy?.[key] ?? []) as unknown as TaxRecord[]).slice().sort((a, b) => a.name.localeCompare(b.name));
  const rank = RANKS.find((r) => r.key === rankKey)!;
  const parentRank = RANKS.find((r) => r.key === rank.parent);
  const form = forms[rankKey] ?? EMPTY;
  const setField = (field: keyof FormState, value: string) =>
    setForms((all) => ({ ...all, [rankKey]: { ...(all[rankKey] ?? EMPTY), [field]: value } }));

  const valid = !!form.name.trim() && !!form.description.trim() && (!rank.parent || !!form.parentId);
  const rows = records(rankKey);
  const parentName = parentRank?.name.toLowerCase() ?? "";
  const parentRecords = parentRank ? records(parentRank.key) : [];
  const nameOf = (id: unknown) => parentRecords.find((r) => r.id === id)?.name || "—";

  const submit = async () => {
    if (!valid) {
      return notify("error", rank.name, rank.parent ? `Select a ${parentName} and fill in Name and Description.` : "Fill in Name and Description.");
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        description: form.description.trim(),
      };
      if (rank.parent) payload[rank.parent] = form.parentId;
      if (rank.hasDate && form.date.trim()) payload.date_discovered = form.date.trim();

      await create(rank.key, payload);
      await onCreated();
      setForms((all) => ({ ...all, [rankKey]: EMPTY }));
      notify("success", `${rank.name} created`, `${form.name.trim()} was added to the classification.`);
    } catch (err) {
      notify("error", rank.name, errorMessage(err, "Could not create it. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const parentField = rank.parent && (
    <label className={styles.field}>
      <span>
        Select {parentName}
        <span className={styles.req}> *</span>
      </span>
      <div className={styles.selectWrap}>
        <select className={styles.select} value={form.parentId} onChange={(e) => setField("parentId", e.target.value)}>
          <option value="">Choose a {parentName}…</option>
          {parentRecords.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <i className="bi bi-chevron-down"></i>
      </div>
    </label>
  );

  const nameField = (
    <label className={styles.field}>
      <span>
        Name<span className={styles.req}> *</span>
      </span>
      <input className={styles.input} value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder={`e.g. ${rank.example}`} />
    </label>
  );

  const dateField = rank.hasDate && (
    <label className={styles.field}>
      <span>Date discovered</span>
      <input className={styles.input} value={form.date} onChange={(e) => setField("date", e.target.value)} placeholder="e.g. 1836" />
    </label>
  );

  const descriptionField = (
    <label className={styles.field}>
      <span>
        Description<span className={styles.req}> *</span>
      </span>
      <textarea
        className={styles.textarea}
        rows={3}
        value={form.description}
        onChange={(e) => setField("description", e.target.value)}
        placeholder={`A short description of this ${rank.name.toLowerCase()}`}
      />
    </label>
  );

  /* ---------------- phone ---------------- */
  if (isMobile) {
    return (
      <>
        <div className={styles.mRankChips}>
          {RANKS.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`${styles.mChip} ${rankKey === r.key ? styles.mChipOn : ""}`}
              onClick={() => setRankKey(r.key)}
            >
              {r.name}
              <span>{records(r.key).length}</span>
            </button>
          ))}
        </div>

        <div className={styles.mCreate}>
          <div className={styles.mCreateHead}>
            <h3>Create {rank.name}</h3>
            <span>{rank.key}</span>
          </div>
          {parentField}
          {nameField}
          {dateField}
          {descriptionField}
          <button
            type="button"
            className={`${styles.mCreateBtn} ${valid ? "" : styles.mCreateBtnOff}`}
            onClick={submit}
            disabled={saving}
          >
            Create {rank.name}
          </button>
        </div>

        <span className={styles.mHeading}>
          Existing {rank.plural} · {rows.length}
        </span>
        {rows.map((row) => (
          <div key={row.id} className={styles.mExisting}>
            <b className={rank.key === "genus" ? styles.italic : undefined}>{row.name}</b>
            <span>{parentRank ? `${parentRank.name}: ${nameOf(row[parentRank.key])}` : "Top level"}</span>
          </div>
        ))}
      </>
    );
  }

  /* ---------------- desktop ---------------- */
  return (
    <div className={styles.taxLayout}>
      <div className={styles.hierarchy}>
        <span className={styles.hierarchyLabel}>Hierarchy</span>
        {RANKS.map((r, i) => (
          <button
            key={r.key}
            type="button"
            className={`${styles.rankBtn} ${rankKey === r.key ? styles.rankOn : ""}`}
            onClick={() => setRankKey(r.key)}
          >
            <span className={styles.rankNum}>{i + 1}</span>
            <span className={styles.rankName}>{r.name}</span>
            <span className={styles.rankCount}>{records(r.key).length}</span>
          </button>
        ))}
        <p className={styles.hierarchyNote}>Create from the top down. Each level needs its parent to exist first.</p>
      </div>

      <div className={styles.taxMain}>
        <div className={styles.createCard}>
          <div className={styles.createHead}>
            <div>
              <h3>Create {rank.name}</h3>
              <span>{rank.parent ? `Belongs to a ${parentName} · ${rows.length} existing` : "Top level of the classification"}</span>
            </div>
            <span className={styles.keyTag}>{rank.key}</span>
          </div>
          <div className={styles.createBody}>
            <div className={styles.col}>
              {parentField}
              {nameField}
              {dateField}
            </div>
            <div className={styles.col}>{descriptionField}</div>
          </div>
          <div className={styles.createFoot}>
            <span>
              <span className={styles.req}>*</span> Required
            </span>
            <div className={styles.createFootButtons}>
              <button type="button" className={styles.clearBtn} onClick={() => setForms((all) => ({ ...all, [rankKey]: EMPTY }))}>
                Clear
              </button>
              <button
                type="button"
                className={`${styles.createBtn} ${valid ? "" : styles.createBtnOff}`}
                onClick={submit}
                disabled={saving}
              >
                Create {rank.name}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.existingHead}>
            <h3>Existing {rank.plural}</h3>
            <span>{rows.length}</span>
          </div>
          <div className={styles.existingCols}>
            <span>Name</span>
            <span>{parentRank ? parentRank.name : "Date discovered"}</span>
            <span>Description</span>
          </div>
          {rows.map((row) => (
            <div key={row.id} className={styles.existingRow}>
              <b className={rank.key === "genus" ? styles.italic : undefined}>{row.name}</b>
              <span>{parentRank ? nameOf(row[parentRank.key]) : String(row.date_discovered || "—")}</span>
              <span className={styles.ellipsis}>{row.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

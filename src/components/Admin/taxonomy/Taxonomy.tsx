import { useEffect, useState } from "react";
import styles from "./Taxonomy.module.css";
import { useFetchTaxonomy, type TaxonomyData } from "../../../back-end/hooks/useFetchTaxonomy";
import type { BaseTaxonomyRecord } from "../../../back-end/types/taxonomyClass";
interface Field {
  name : string
  collectionName : string
  collectionParent : string
  fields : string[]
}
const collections = [
  {
    name: 'Domain',
    collectionName: "domain",
    collectionParent: '',
    fields: [
      'name', 'description', 'date_discovered'
    ]
  },
  {
    name: 'Kingdom',
    collectionName: "kingdom",
    collectionParent: 'domain',
    fields: [
      'name', 'description'
    ]
  },
  {
    name: 'Phylum',
    collectionName: "phylum",
    collectionParent: 'kingdom',
    fields: [
      'name', 'description'
    ]
  },
  {
    name: 'Class',
    collectionName: "class",
    collectionParent: 'phylum',
    fields: [
      'name', 'description'
    ]
  },
  {
    name: 'Order',
    collectionName: "order",
    collectionParent: 'class',
    fields: [
      'name', 'description'
    ]
  },
  {
    name: 'Family',
    collectionName: "family",
    collectionParent: 'order',
    fields: [
      'name', 'description', 'date_discovered'
    ]
  },
  {
    name: 'Genus',
    collectionName: "genus",
    collectionParent: 'family',
    fields: [
      'name', 'description'
    ]
  }
] as Field[];

export default function Taxonomy() {
  const [createData, setCreateData] = useState<
  Record<string, Record<string, string>>
>({})
  const [taxonomyData, setTaxonomyData] = useState<TaxonomyData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetch , create} = useFetchTaxonomy();

  useEffect(() => {
    const fetchData = async () => {
      await fetchAnalytics();
      const taxonomyData = await fetch();
      setTaxonomyData(taxonomyData);
    }

    fetchData();
  }, []);

  const handleChange = (
    collection: string,
    field: string,
    value: string
  ) => {
    setCreateData(prev => ({
      ...prev,
      [collection]: {
        ...prev[collection],
        [field]: value
      }
    }))
  }

  const handleCreate = async (collection: Field) => {
    try {
      const data = createData[collection.collectionName] || {};

      await create(collection.collectionName, data);

      const updated = await fetch();
      setTaxonomyData(updated);

      // clear the form for that card
      setCreateData(prev => ({
        ...prev,
        [collection.collectionName]: {}
      }));

    } catch (err: any) {
      console.error(err.message);
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      
    } catch (err: any) {
      setError(err.message || "Failed to fetch taxonomy data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading taxonomy list...</div>;

  if (error)
    return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.cardGrid}>
        {
          collections.map( e => {
            return (
              <div className={styles.card}>
                <div className="d-flex flex-row">
                  <h3 className={styles.card_title}>
                    <i className="bi bi-people" style={{marginRight: '8px'}}></i>
                    Create {e.name}
                  </h3>

                  <div className="d-flex">
                    
                  </div>
                </div>

                <div className={styles.formGroup}>
                  
                  {e.collectionParent && (
                    <div className="d-flex flex-row w-100">
                      <label htmlFor={`select-${e.collectionName}`}>
                        Select {e.collectionParent}
                      </label>

                      <select
                        value={
                          createData[e.collectionName]?.[e.collectionParent] ?? ""
                        }
                        onChange={(ev) =>
                          handleChange(
                            e.collectionName,
                            e.collectionParent,
                            ev.target.value
                          )
                        }
                      >
                        <option value="">Select {e.collectionParent}</option>

                        {taxonomyData?.[
                          e.collectionParent as keyof TaxonomyData
                        ]?.map((parent: BaseTaxonomyRecord) => (
                          <option key={parent.id} value={parent.id}>
                            {parent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="" style={{marginTop: '12px'}}>

                      <div style={{ marginTop: "12px" }}>

                        {e.fields.map((field) => (
                          <input
                            key={field}
                            placeholder={field}
                            type="text"
                            className={styles.formGroupInput}
                            style={{ margin: "4px 0px" }}
                            value={createData[e.collectionName]?.[field] ?? ""}
                            onChange={(ev) =>
                              handleChange(e.collectionName, field, ev.target.value)
                            }
                          />
                        ))}
                    </div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'right', margin: '12px 0px 0px 0px'}}>
                    <button
                      style={{ maxWidth: "240px" }}
                      onClick={() => handleCreate(e)}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

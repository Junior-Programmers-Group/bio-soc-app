import { useEffect, useState } from "react";
import styles from "./Taxonomy.module.css";
import { useFetchTaxonomy, type TaxonomyData } from "../../../back-end/hooks/useFetchTaxonomy";
import type { BaseTaxonomyRecord } from "../../../back-end/types/taxonomyClass";

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
  taxonomyName: string;
  iconClass: string;
}
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

const getTaxonomyMessages = (taxonomyName: string, action: 'success' | 'error') => {
  const messages: Record<string, { success: { message: string; icon: string }; error: { message: string; icon: string } }> = {
    'Domain': {
      'success': { message: 'Domain created successfully! New top-level classification added.', icon: 'bi-globe' },
      'error': { message: 'Please fill in all required fields: Name and Description.', icon: 'bi-exclamation-circle' }
    },
    'Kingdom': {
      'success': { message: 'Kingdom created successfully! Major organism group established.', icon: 'bi-diagram-3' },
      'error': { message: 'Please select a Domain and fill in Name and Description.', icon: 'bi-exclamation-circle' }
    },
    'Phylum': {
      'success': { message: 'Phylum created successfully! Major body plan group added.', icon: 'bi-diagram-2' },
      'error': { message: 'Please select a Kingdom and fill in Name and Description.', icon: 'bi-exclamation-circle' }
    },
    'Class': {
      'success': { message: 'Class created successfully! New classification tier added.', icon: 'bi-layers' },
      'error': { message: 'Please select a Phylum and fill in Name and Description.', icon: 'bi-exclamation-circle' }
    },
    'Order': {
      'success': { message: 'Order created successfully! Taxonomic grouping established.', icon: 'bi-list-ul' },
      'error': { message: 'Please select a Class and fill in Name and Description.', icon: 'bi-exclamation-circle' }
    },
    'Family': {
      'success': { message: 'Family created successfully! Close relatives grouped together.', icon: 'bi-bezier' },
      'error': { message: 'Please select an Order and fill in Name and Description.', icon: 'bi-exclamation-circle' }
    },
    'Genus': {
      'success': { message: 'Genus created successfully! Generic grouping completed.', icon: 'bi-tag' },
      'error': { message: 'Please select a Family and fill in Name and Description.', icon: 'bi-exclamation-circle' }
    }
  };
  const result = messages[taxonomyName]?.[action];
  return result || { message: (action === 'success' ? 'Created successfully!' : 'Please fill in all required fields.'), icon: action === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle' };
};

export default function Taxonomy() {
  const [createData, setCreateData] = useState<
  Record<string, Record<string, string>>
>({})
  const [taxonomyData, setTaxonomyData] = useState<TaxonomyData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [creatingCollection, setCreatingCollection] = useState<string | null>(null);
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

  const isFormValid = (collection: Field): boolean => {
    const data = createData[collection.collectionName] || {};
    
    // Check if required fields are filled
    const requiredFields = ['name', 'description'];
    const hasRequired = requiredFields.every(field => data[field]?.trim());
    
    // Check if parent is selected (if collection has a parent)
    const hasParent = !collection.collectionParent || !!data[collection.collectionParent];
    
    return hasRequired && hasParent;
  };

  const addToast = (type: 'success' | 'error', taxonomyName: string) => {
    const id = Date.now().toString();
    const { message, icon } = getTaxonomyMessages(taxonomyName, type);
    setToasts(prev => [...prev, { id, type, message, taxonomyName, iconClass: icon }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleCreate = async (collection: Field) => {
    try {
      const data = createData[collection.collectionName] || {};
      
      // Validation: Check if required fields are filled
      const requiredFields = ['name', 'description'];
      const missingFields = requiredFields.filter(field => !data[field]?.trim());
      
      if (missingFields.length > 0) {
        addToast('error', collection.name);
        return;
      }
      
      // Validation: Check if parent is selected (if collection has a parent)
      if (collection.collectionParent && !data[collection.collectionParent]) {
        addToast('error', collection.name);
        return;
      }

      setCreatingCollection(collection.collectionName);

      await create(collection.collectionName, data);

      const updated = await fetch();
      setTaxonomyData(updated);

      // Show success toast
      addToast('success', collection.name);

      // clear the form for that card
      setCreateData(prev => ({
        ...prev,
        [collection.collectionName]: {}
      }));

    } catch (err: any) {
      console.error(err.message);
      addToast('error', collection.name);
    } finally {
      setCreatingCollection(null);
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
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>Taxonomy Management</h2>
        <p className={styles.pageSubtitle}>Create and manage the biological classification system</p>
      </div>

      {/* Toast Notifications */}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <div className={styles.toastContent}>
              <i className={`bi ${toast.iconClass} ${styles.toastIcon}`}></i>
              <div className={styles.toastMessage}>
                <strong>{toast.taxonomyName}</strong>
                <p>{toast.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cardGrid}>
        {
          collections.map( e => {
            return (
              <div key={e.collectionName} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.card_title}>
                    Create {e.name}
                  </h3>
                  <span className={styles.cardBadge}>{e.collectionName}</span>
                </div>

                <div className={styles.formGroup}>
                  {e.collectionParent && (
                    <div className={styles.formField}>
                      <label htmlFor={`select-${e.collectionName}`} className={styles.fieldLabel}>
                        Select {e.collectionParent.charAt(0).toUpperCase() + e.collectionParent.slice(1)}
                      </label>

                      <div className={styles.selectWrapper}>
                        <select
                          id={`select-${e.collectionName}`}
                          className={styles.customSelect}
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
                          <option value="">Select {e.collectionParent}...</option>

                          {taxonomyData?.[
                            e.collectionParent as keyof TaxonomyData
                          ]?.map((parent: BaseTaxonomyRecord) => (
                            <option key={parent.id} value={parent.id}>
                              {parent.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className={styles.inputsContainer}>
                    {e.fields.map((field) => (
                      <div key={field} className={styles.formField}>
                        <label className={styles.fieldLabel}>
                          {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}
                          {['name', 'description'].includes(field) && <span className={styles.required}>*</span>}
                        </label>
                        <input
                          placeholder={`Enter ${field}...`}
                          type="text"
                          className={styles.formGroupInput}
                          value={createData[e.collectionName]?.[field] ?? ""}
                          onChange={(ev) =>
                            handleChange(e.collectionName, field, ev.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className={styles.createBtn}
                    onClick={() => handleCreate(e)}
                    disabled={creatingCollection === e.collectionName || !isFormValid(e)}
                  >
                    {creatingCollection === e.collectionName ? (
                      <>
                        <span className={styles.spinner}></span>
                        Creating...
                      </>
                    ) : (
                      <>Create {e.name}</>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

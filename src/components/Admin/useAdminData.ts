import { useCallback, useEffect, useRef, useState } from "react";
import type { Plant } from "../../types/plant";
import { fetchPlants } from "../../services/plantService";
import { getUsers, type UserRecord } from "../../services/userAdmin";
import { errorMessage } from "../../services/errors";
import { useFetchTaxonomy, type TaxonomyData } from "../../back-end/hooks/useFetchTaxonomy";

/** Everything the admin screens show, loaded together and refreshable one part at a time. */
export function useAdminData() {
  const taxonomyApi = useRef(useFetchTaxonomy());

  const [plants, setPlants] = useState<Plant[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyData | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [plantList, userList, taxonomyData] = await Promise.all([
        fetchPlants(),
        getUsers(),
        taxonomyApi.current.fetch(),
      ]);
      setPlants(plantList);
      setUsers(userList);
      setTaxonomy(taxonomyData);
    } catch (err) {
      setError(errorMessage(err, "We couldn't load the admin data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reloadPlants = useCallback(async () => setPlants(await fetchPlants()), []);
  const reloadUsers = useCallback(async () => setUsers(await getUsers()), []);
  const reloadTaxonomy = useCallback(async () => setTaxonomy(await taxonomyApi.current.fetch()), []);

  return {
    plants,
    users,
    taxonomy,
    loading,
    error,
    reload: load,
    reloadPlants,
    reloadUsers,
    reloadTaxonomy,
    createTaxonomy: taxonomyApi.current.create,
  };
}

import pb from "../db";
import { clearPlantCache } from "../../services/plantService";
import type { ClassTaxonomy, Domain, Family, Genus, Kingdom, OrderTaxonomy, Phylum } from "../types/taxonomyClass";

export interface TaxonomyData {
    domain : Domain[],
    kingdom : Kingdom[],
    phylum : Phylum[],
    class : ClassTaxonomy[],
    order : OrderTaxonomy[],
    family : Family[],
    genus : Genus[]
}

export const useFetchTaxonomy = () => {
    const fetch = async () => {
        try {
            const domainList = await pb.collection('domain').getFullList({ requestKey: null }) as Domain[];

            const kingdomList = await pb.collection('kingdom').getFullList({ requestKey: null }) as Kingdom[];

            const phylumList = await pb.collection('phylum').getFullList({ requestKey: null }) as Phylum[];

            const classList = await pb.collection('class').getFullList({ requestKey: null }) as ClassTaxonomy[];

            const orderList = await pb.collection('order').getFullList({ requestKey: null }) as OrderTaxonomy[];

            const familyList = await pb.collection('family').getFullList({ requestKey: null }) as Family[];

            const genusList = await pb.collection('genus').getFullList({ requestKey: null }) as Genus[];

            return {
                domain : domainList,
                kingdom : kingdomList,
                phylum : phylumList,
                class : classList,
                order : orderList,
                family : familyList,
                genus : genusList
            } as TaxonomyData;
        } catch (err) {
            console.error('Error loading taxonomy:', err);
            throw err;
        }
    }

  const create = async (
        category: string,
        fields: Record<string, string>
    ) => {
        await pb.collection(category).create(fields);
        clearPlantCache(); // filter lists and plant pages must pick up the new entry
    }

    return { fetch, create };
}


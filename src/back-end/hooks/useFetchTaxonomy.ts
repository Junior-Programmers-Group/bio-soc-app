import pb from "../db";
import type { ClassTaxonomy, Domain, Family, Genus, Kingdom, OrderTaxonomy, Phylum } from "../types/taxonomyClass";

type TaxonomyKey = keyof TaxonomyData

interface Field {
  name: string
  collectionName: TaxonomyKey
  collectionParent: TaxonomyKey | ""
  fields: string[]
}

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
        const domainList = await pb.collection('domain').getFullList() as Domain[];
        console.log(domainList);

        const kingdomList = await pb.collection('kingdom').getFullList() as Kingdom[];
        console.log(kingdomList);

        const phylumList = await pb.collection('phylum').getFullList() as Phylum[];
        console.log(phylumList);

        const classList = await pb.collection('class').getFullList() as ClassTaxonomy[];
        console.log(classList);

        const orderList = await pb.collection('order').getFullList() as OrderTaxonomy[];
        console.log(orderList);

        const familyList = await pb.collection('family').getFullList() as Family[];
        console.log(familyList);

        const genusList = await pb.collection('genus').getFullList() as Genus[];
        console.log(genusList);

        return {
            domain : domainList,
            kingdom : kingdomList,
            phylum : phylumList,
            class : classList,
            order : orderList,
            family : familyList,
            genus : genusList
        } as TaxonomyData;
    }

  const create = async (
        category: string,
        fields: Record<string, string>
    ) => {
        try {
        await pb.collection(category).create(fields);
        }
        catch (e: any) {
        console.error(e.message);
        throw e;
        }
    }

    return { fetch, create };
}


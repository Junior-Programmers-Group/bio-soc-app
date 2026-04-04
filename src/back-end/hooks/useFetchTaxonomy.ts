import pb from "../db";
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
            console.log('✓ Domains loaded:', domainList.length);

            const kingdomList = await pb.collection('kingdom').getFullList({ requestKey: null }) as Kingdom[];
            console.log('✓ Kingdoms loaded:', kingdomList.length);

            const phylumList = await pb.collection('phylum').getFullList({ requestKey: null }) as Phylum[];
            console.log('✓ Phylums loaded:', phylumList.length);

            const classList = await pb.collection('class').getFullList({ requestKey: null }) as ClassTaxonomy[];
            console.log('✓ Classes loaded:', classList.length);

            const orderList = await pb.collection('order').getFullList({ requestKey: null }) as OrderTaxonomy[];
            console.log('✓ Orders loaded:', orderList.length);

            const familyList = await pb.collection('family').getFullList({ requestKey: null }) as Family[];
            console.log('✓ Families loaded:', familyList.length);

            const genusList = await pb.collection('genus').getFullList({ requestKey: null }) as Genus[];
            console.log('✓ Genus loaded:', genusList.length);

            return {
                domain : domainList,
                kingdom : kingdomList,
                phylum : phylumList,
                class : classList,
                order : orderList,
                family : familyList,
                genus : genusList
            } as TaxonomyData;
        } catch (err: any) {
            if (!err.message?.includes('aborted')) {
                console.error('Error loading taxonomy:', err);
            }
            throw err;
        }
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


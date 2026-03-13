import type { RecordModel } from "pocketbase";

export interface BaseTaxonomyRecord extends RecordModel {
  name: string;
  description: string;
}

export interface Domain extends BaseTaxonomyRecord {
  date_discovered: string;
}

export interface Kingdom extends BaseTaxonomyRecord {
  domain: string; // relation id
}

export interface Phylum extends BaseTaxonomyRecord {
  kingdom: string;
}

export interface ClassTaxonomy extends BaseTaxonomyRecord {
  Phylum: string;
  image?: string;
}

export interface OrderTaxonomy extends BaseTaxonomyRecord {
  class: string;
}

export interface Family extends BaseTaxonomyRecord {
  order: string;
}

export interface Genus extends BaseTaxonomyRecord {
  family: string;
}
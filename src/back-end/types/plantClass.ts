import type { RecordModel } from "pocketbase";

export type PlantClass = RecordModel & {
  name: string;
  description: string;
  image: string;
  phylum_id: number;
};

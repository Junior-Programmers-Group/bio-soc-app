import pb from "../back-end/db";

export interface AnalyticsData {
  totalPlants: number;
  totalUsers: number;
  verifiedUsers: number;
}

const countRecords = async (collection: string, filter?: string): Promise<number> => {
  const result = await pb.collection(collection).getList(1, 1, {
    filter,
    fields: "id",
    requestKey: null,
  });
  return result.totalItems;
};

/** Totals for the admin dashboard, counted by the server. Throws if any count fails. */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [totalPlants, totalUsers, verifiedUsers] = await Promise.all([
    countRecords("species"),
    countRecords("users"),
    countRecords("users", "verified = true"),
  ]);
  return { totalPlants, totalUsers, verifiedUsers };
}

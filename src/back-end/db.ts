import PocketBase from "pocketbase";
import { PB_URL } from "../config";

const pb = new PocketBase(PB_URL);

// If the server rejects our login token, drop it so the admin screen returns to the login form.
pb.afterSend = (response, data) => {
  if (response.status === 401 && pb.authStore.isValid) pb.authStore.clear();
  return data;
};

export default pb;

// services/apiClient.js
export async function apiClient(url, method = "GET", data) {
   const token = await getIdToken(); // Firebase Auth token

   const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
   };

   const options = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
   };

   const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`,
      options
   );
   const json = await res.json();

   if (!res.ok) throw new Error(json?.message || "API error");
   return json.data;
}

async function getIdToken() {
   const { getAuth } = await import("firebase/auth");
   const user = getAuth().currentUser;
   return user ? user.getIdToken() : null;
}

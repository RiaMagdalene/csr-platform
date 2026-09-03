const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://csr-platform-production.up.railway.app";

export async function getDistricts() {
  const response = await fetch(`${API_URL}/districts`);

  if (!response.ok) {
    throw new Error("Failed to load districts");
  }

  return response.json();
}

export async function getDistrictDetails(districtId) {
  const response = await fetch(`${API_URL}/districts/${districtId}`);

  if (!response.ok) {
    throw new Error("Failed to load district details");
  }

  return response.json();
}

export async function getDistrictMatches(districtId) {
  const response = await fetch(
    `${API_URL}/districts/${districtId}/matches`
  );

  if (!response.ok) {
    throw new Error("Failed to load NGO matches");
  }

  return response.json();
}

export async function getCsrMatches({
  target_district,
  sectors,
  budget,
  required_capacity,
}) {
  const response = await fetch(`${API_URL}/matches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target_district,
      sectors,
      budget,
      required_capacity,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to find CSR matches");
  }

  return response.json();
}

export default API_URL;
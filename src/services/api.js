export const API_BASE = "https://api.secuvion.com";

export const fetchThreats = async () => {
  const res = await fetch(`${API_BASE}/threats`);
  return res.json();
};
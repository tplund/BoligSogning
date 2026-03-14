const BASE = "https://api.boliga.dk/api/v2";

export interface BoligaResult {
  id: number;
  price: number;
  street: string;
  zipCode: number;
  city: string;
  rooms: number;
  size: number;
  propertyType: number;
  ouId: number;
  buildYear: number;
  daysForSale: number;
  squaremeterPrice: number;
  latitude: number;
  longitude: number;
}

export interface BoligaResponse {
  meta: {
    totalCount: number;
    totalPages: number;
    pageIndex: number;
    pageSize: number;
  };
  results: BoligaResult[];
}

export interface BoligaSearchParams {
  municipality?: number;
  zipCodes?: string;
  propertyType?: number;
  priceMin?: number;
  priceMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  rooms?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

const PROPERTY_TYPES: Record<number, string> = {
  1: "Villa",
  2: "Rækkehus",
  3: "Ejerlejlighed",
  4: "Fritidshus",
  5: "Andelsbolig",
  6: "Helårsgrund",
  7: "Fritidsgrund",
  8: "Landejendom",
  9: "Andet",
};

export function getPropertyTypeName(type: number): string {
  return PROPERTY_TYPES[type] || "Ukendt";
}

export async function searchBoliga(
  params: BoligaSearchParams
): Promise<BoligaResponse> {
  const url = new URL(`${BASE}/search/results`);

  if (params.municipality) url.searchParams.set("municipality", String(params.municipality));
  if (params.zipCodes) url.searchParams.set("zipCodes", params.zipCodes);
  if (params.propertyType) url.searchParams.set("propertyType", String(params.propertyType));
  if (params.priceMin) url.searchParams.set("salesPriceMin", String(params.priceMin));
  if (params.priceMax) url.searchParams.set("salesPriceMax", String(params.priceMax));
  if (params.sizeMin) url.searchParams.set("sizeMin", String(params.sizeMin));
  if (params.sizeMax) url.searchParams.set("sizeMax", String(params.sizeMax));
  if (params.rooms) url.searchParams.set("rooms", String(params.rooms));
  if (params.sort) url.searchParams.set("sort", params.sort);

  url.searchParams.set("page", String(params.page || 1));
  url.searchParams.set("pageSize", String(params.pageSize || 25));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Boliga API error: ${res.status}`);
  return res.json();
}

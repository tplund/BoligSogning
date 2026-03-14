const BASE = "https://api.boligsiden.dk";

export interface RentalCase {
  caseID: string;
  addressType: string;
  monthlyExpense: number;
  housingArea: number;
  numberOfRooms: number;
  daysOnMarket: number;
  yearBuilt: number;
  energyLabel: string;
  coordinates?: { lat: number; lon: number };
  address: {
    roadName: string;
    houseNumber: string;
    floor?: string;
    door?: string;
    zip: { zipCode: string };
    city: { name: string };
  };
}

export interface RentalsResponse {
  cases: RentalCase[];
  totalHits: number;
}

export interface SearchParams {
  municipalities?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  sortBy?: string;
  sortAscending?: boolean;
  page?: number;
  perPage?: number;
}

export async function searchRentals(
  params: SearchParams
): Promise<RentalsResponse> {
  const url = new URL(`${BASE}/search/rentals`);

  if (params.municipalities?.length) {
    params.municipalities.forEach((m) =>
      url.searchParams.append("municipalities", m)
    );
  }
  if (params.minPrice) url.searchParams.set("minMonthlyExpense", String(params.minPrice));
  if (params.maxPrice) url.searchParams.set("maxMonthlyExpense", String(params.maxPrice));
  if (params.minRooms) url.searchParams.set("minNumberOfRooms", String(params.minRooms));
  if (params.maxRooms) url.searchParams.set("maxNumberOfRooms", String(params.maxRooms));

  const sortMap: Record<string, string> = {
    price: "rent",
    rent: "rent",
    createdAt: "createdAt",
    date: "createdAt",
    timeOnMarket: "createdAt",
  };
  if (params.sortBy) {
    url.searchParams.set("sortBy", sortMap[params.sortBy] || "rent");
  }
  if (params.sortAscending !== undefined) {
    url.searchParams.set("sortAscending", String(params.sortAscending));
  }
  if (params.page) url.searchParams.set("page", String(params.page));
  url.searchParams.set("perPage", String(params.perPage || 25));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Boligsiden API error: ${res.status}`);
  return res.json();
}

export interface Municipality {
  name: string;
  code: number;
}

export async function getMunicipalities(): Promise<Municipality[]> {
  const res = await fetch(`${BASE}/municipalities`);
  if (!res.ok) throw new Error(`Municipalities API error: ${res.status}`);
  const data = await res.json();
  // The API returns an array of municipality objects
  return data.map((m: any) => ({ name: m.name, code: m.code }));
}

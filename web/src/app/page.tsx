"use client";

import { useState, useEffect, useCallback } from "react";

interface RentalResult {
  caseID: string;
  addressType: string;
  monthlyExpense: number;
  housingArea: number;
  numberOfRooms: number;
  daysOnMarket: number;
  yearBuilt: number;
  energyLabel: string;
  address: {
    roadName: string;
    houseNumber: string;
    floor?: string;
    door?: string;
    zip: { zipCode: string };
    city: { name: string };
  };
}

const POPULAR_MUNICIPALITIES = [
  "Aarhus",
  "Skanderborg",
  "Odder",
  "Horsens",
  "Silkeborg",
  "Randers",
  "Favrskov",
  "Syddjurs",
  "Norddjurs",
  "Viborg",
];

function formatAddress(r: RentalResult): string {
  const parts = [r.address.roadName, r.address.houseNumber];
  if (r.address.floor) parts.push(r.address.floor);
  if (r.address.door) parts.push(r.address.door);
  return `${parts.join(" ")}, ${r.address.zip.zipCode} ${r.address.city.name}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString("da-DK") + " kr/md";
}

export default function Home() {
  // Search state
  const [municipalities, setMunicipalities] = useState<string[]>(["Aarhus"]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("7000");
  const [minRooms, setMinRooms] = useState("2");
  const [maxRooms, setMaxRooms] = useState("2");
  const [sortBy, setSortBy] = useState("price");
  const [sortAscending, setSortAscending] = useState(true);

  // Results state
  const [results, setResults] = useState<RentalResult[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const params = new URLSearchParams();
      municipalities.forEach((m) => params.append("municipalities", m));
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (minRooms) params.set("minRooms", minRooms);
      if (maxRooms) params.set("maxRooms", maxRooms);
      params.set("sortBy", sortBy);
      params.set("sortAscending", String(sortAscending));
      params.set("perPage", "50");

      const res = await fetch(`/api/rentals?${params}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // Filter to only show results with the correct number of rooms
      const minR = minRooms ? parseInt(minRooms) : 0;
      const maxR = maxRooms ? parseInt(maxRooms) : 99;
      const filtered = (data.cases || []).filter(
        (r: RentalResult) =>
          r.numberOfRooms >= minR && r.numberOfRooms <= maxR
      );

      setResults(filtered);
      setTotalHits(data.totalHits || 0);
    } catch (err: any) {
      setError("Kunne ikke hente data. Prøv igen.");
    } finally {
      setLoading(false);
    }
  }, [municipalities, minPrice, maxPrice, minRooms, maxRooms, sortBy, sortAscending]);

  const toggleMunicipality = (name: string) => {
    setMunicipalities((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🏠 Boligsøgning
      </h1>
      <p className="text-gray-500 mb-8">
        Find lejeboliger via Boligsiden.dk
      </p>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        {/* Municipalities */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kommuner
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_MUNICIPALITIES.map((name) => (
              <button
                key={name}
                onClick={() => toggleMunicipality(name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  municipalities.includes(name)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Rooms */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. pris (kr/md)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max. pris (kr/md)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="10000"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. værelser
            </label>
            <input
              type="number"
              value={minRooms}
              onChange={(e) => setMinRooms(e.target.value)}
              min="1"
              max="10"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max. værelser
            </label>
            <input
              type="number"
              value={maxRooms}
              onChange={(e) => setMaxRooms(e.target.value)}
              min="1"
              max="10"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Sort & Search */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sortering
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="price">Pris</option>
              <option value="createdAt">Nyeste først</option>
              <option value="timeOnMarket">Tid på markedet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retning
            </label>
            <select
              value={String(sortAscending)}
              onChange={(e) => setSortAscending(e.target.value === "true")}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="true">Stigende ↑</option>
              <option value="false">Faldende ↓</option>
            </select>
          </div>
          <button
            onClick={search}
            disabled={loading || municipalities.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Søger..." : "Søg"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="mb-4 text-sm text-gray-500">
          Viser {results.length} af {totalHits} resultater
        </div>
      )}

      <div className="space-y-3">
        {results.map((r) => (
          <div
            key={r.caseID}
            className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {formatAddress(r)}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <span>{r.housingArea} m²</span>
                  <span>{r.numberOfRooms} vær.</span>
                  <span>{r.addressType}</span>
                  {r.yearBuilt > 0 && <span>Bygget {r.yearBuilt}</span>}
                  {r.energyLabel && r.energyLabel !== "-" && (
                    <span>Energi: {r.energyLabel}</span>
                  )}
                  <span className="text-gray-400">
                    {r.daysOnMarket} dage på markedet
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {formatPrice(r.monthlyExpense)}
                </div>
                <a
                  href={`https://www.boligsiden.dk/adresse/${r.caseID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline mt-1 inline-block"
                >
                  Se på Boligsiden →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {searched && !loading && results.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400">
          Ingen boliger fundet med de valgte filtre.
        </div>
      )}
    </main>
  );
}

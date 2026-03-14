import { NextRequest, NextResponse } from "next/server";
import { searchRentals } from "@/lib/boligsiden";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  try {
    const data = await searchRentals({
      municipalities: sp.getAll("municipalities"),
      minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
      maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
      minRooms: sp.get("minRooms") ? Number(sp.get("minRooms")) : undefined,
      maxRooms: sp.get("maxRooms") ? Number(sp.get("maxRooms")) : undefined,
      sortBy: sp.get("sortBy") || "price",
      sortAscending: sp.get("sortAscending") !== "false",
      page: sp.get("page") ? Number(sp.get("page")) : 1,
      perPage: sp.get("perPage") ? Number(sp.get("perPage")) : 25,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "API fejl" },
      { status: 500 }
    );
  }
}

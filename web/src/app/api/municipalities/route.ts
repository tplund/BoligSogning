import { NextResponse } from "next/server";
import { getMunicipalities } from "@/lib/boligsiden";

export async function GET() {
  try {
    const data = await getMunicipalities();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "API fejl" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { getProjectData } from "@/lib/project-data";
import { getSheetsSetupSummary } from "@/lib/server/google-sheets";

export async function GET() {
  const data = await getProjectData();
  const setup = getSheetsSetupSummary();

  return NextResponse.json({
    ...data,
    setup
  });
}

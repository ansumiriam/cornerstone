import { NextResponse } from "next/server";

import { getProjectData } from "@/lib/project-data";
import { isSupportedResource } from "@/lib/project-resources";
import { createProjectRecord } from "@/lib/server/project-store";

export async function POST(request, context) {
  const resource = context.params.resource;

  if (!isSupportedResource(resource)) {
    return NextResponse.json({ error: "Unsupported resource" }, { status: 404 });
  }

  try {
    const payload = await request.json();
    const record = await createProjectRecord(resource, payload);
    const projectData = await getProjectData();

    return NextResponse.json({
      record,
      projectData
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to create record" },
      { status: 400 }
    );
  }
}

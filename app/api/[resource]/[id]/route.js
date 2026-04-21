import { NextResponse } from "next/server";

import { getProjectData } from "@/lib/project-data";
import { isSupportedResource } from "@/lib/project-resources";
import { deleteProjectRecord, updateProjectRecord } from "@/lib/server/project-store";

function getParams(context) {
  return {
    resource: context.params.resource,
    id: decodeURIComponent(context.params.id)
  };
}

export async function PATCH(request, context) {
  const { resource, id } = getParams(context);

  if (!isSupportedResource(resource)) {
    return NextResponse.json({ error: "Unsupported resource" }, { status: 404 });
  }

  try {
    const payload = await request.json();
    const record = await updateProjectRecord(resource, id, payload);
    const projectData = await getProjectData();

    return NextResponse.json({
      record,
      projectData
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to update record" },
      { status: error.message === "Record not found" ? 404 : 400 }
    );
  }
}

export async function DELETE(_request, context) {
  const { resource, id } = getParams(context);

  if (!isSupportedResource(resource)) {
    return NextResponse.json({ error: "Unsupported resource" }, { status: 404 });
  }

  try {
    await deleteProjectRecord(resource, id);
    const projectData = await getProjectData();

    return NextResponse.json({
      projectData
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to delete record" },
      { status: error.message === "Record not found" ? 404 : 400 }
    );
  }
}

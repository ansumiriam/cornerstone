import { ProjectDashboard } from "@/components/project-dashboard";
import { getProjectData } from "@/lib/project-data";

export default async function HomePage() {
  const data = await getProjectData();

  return <ProjectDashboard initialData={data} />;
}

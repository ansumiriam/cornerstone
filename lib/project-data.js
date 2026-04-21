import { readDemoProjectData } from "@/lib/server/demo-store";
import { getProjectDataFromSheets, isGoogleSheetsConfigured } from "@/lib/server/google-sheets";

export async function getProjectData() {
  if (isGoogleSheetsConfigured()) {
    try {
      const liveData = await getProjectDataFromSheets();
      return {
        ...liveData,
        project: {
          ...(liveData.project || {}),
          mode: "google-sheets"
        }
      };
    } catch (error) {
      console.error("Falling back to demo data because Google Sheets sync failed.", error);
    }
  }

  return readDemoProjectData();
}

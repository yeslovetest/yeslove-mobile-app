import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const FILE_NAME = "yeslove-my-data.json";

export type ExportResult = { status: "shared" } | { status: "unavailable" };

/**
 * Downloads a copy of the member's personal data and opens the share sheet so they can
 * save it to Files, email it to themselves, and so on.
 */
export const exportMyData = async (): Promise<ExportResult> => {
  const response = await axios.get("/api/auth/export_data");
  const text = JSON.stringify(response.data, null, 2);

  const uri = `${FileSystem.cacheDirectory}${FILE_NAME}`;
  await FileSystem.writeAsStringAsync(uri, text);

  if (!(await Sharing.isAvailableAsync())) {
    return { status: "unavailable" };
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/json",
    dialogTitle: "Your YesLove data",
    UTI: "public.json",
  });
  return { status: "shared" };
};

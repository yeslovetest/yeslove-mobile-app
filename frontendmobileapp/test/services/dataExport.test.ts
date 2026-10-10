import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { exportMyData } from "@/app/services/dataExport";

jest.mock("axios");
jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  writeAsStringAsync: jest.fn(),
}));
jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSharing = Sharing as jest.Mocked<typeof Sharing>;
const mockedFs = FileSystem as jest.Mocked<typeof FileSystem>;

describe("exportMyData", () => {
  beforeEach(() => jest.clearAllMocks());

  it("saves the export as a JSON file and opens the share sheet", async () => {
    mockedAxios.get.mockResolvedValue({ data: { account: { username: "jane" }, posts: [] } });
    mockedSharing.isAvailableAsync.mockResolvedValue(true);

    const result = await exportMyData();

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/auth/export_data");
    const [uri, text] = mockedFs.writeAsStringAsync.mock.calls[0];
    expect(uri).toBe("file:///cache/yeslove-my-data.json");
    expect(JSON.parse(text as string).account.username).toBe("jane");
    expect(mockedSharing.shareAsync).toHaveBeenCalledWith(
      "file:///cache/yeslove-my-data.json",
      expect.objectContaining({ mimeType: "application/json" }),
    );
    expect(result).toEqual({ status: "shared" });
  });

  it("reports when sharing is not available", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    mockedSharing.isAvailableAsync.mockResolvedValue(false);

    expect(await exportMyData()).toEqual({ status: "unavailable" });
    expect(mockedSharing.shareAsync).not.toHaveBeenCalled();
  });

  it("lets a failed download reach the caller without writing a file", async () => {
    mockedAxios.get.mockRejectedValue(new Error("network"));

    await expect(exportMyData()).rejects.toThrow("network");
    expect(mockedFs.writeAsStringAsync).not.toHaveBeenCalled();
  });
});

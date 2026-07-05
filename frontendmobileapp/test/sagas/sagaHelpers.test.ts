import { getApiMessage, getHttpStatus, normalizeMediaFiles } from "@/app/store/sagas/sagaHelpers";

const axiosError = (status: number, data?: unknown) => ({
  isAxiosError: true,
  response: { status, data },
});

describe("getHttpStatus", () => {
  it("returns the status for an axios error", () => {
    expect(getHttpStatus(axiosError(404))).toBe(404);
  });

  it("returns undefined for a non-axios error", () => {
    expect(getHttpStatus(new Error("plain"))).toBeUndefined();
    expect(getHttpStatus("nope")).toBeUndefined();
  });
});

describe("getApiMessage", () => {
  it("reads a { message } payload", () => {
    expect(getApiMessage(axiosError(400, { message: "bad request" }))).toBe("bad request");
  });

  it("falls back to an { error } payload", () => {
    expect(getApiMessage(axiosError(400, { error: "boom" }))).toBe("boom");
  });

  it("returns undefined for a non-axios error", () => {
    expect(getApiMessage(new Error("plain"))).toBeUndefined();
  });
});

describe("normalizeMediaFiles", () => {
  it("returns an empty array when given nothing", () => {
    expect(normalizeMediaFiles()).toEqual([]);
    expect(normalizeMediaFiles([])).toEqual([]);
  });

  it("drops entries missing a uri or type", () => {
    const result = normalizeMediaFiles([
      { uri: "", type: "image/jpeg" },
      { uri: "file://a.jpg", type: "" },
      { uri: "file://ok.jpg", type: "image/jpeg" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].uri).toBe("file://ok.jpg");
  });

  it("defaults the filename from the mime type", () => {
    const [image] = normalizeMediaFiles([{ uri: "file://a", type: "image/jpeg" }]);
    expect(image.name).toBe("photo.jpg");

    const [video] = normalizeMediaFiles([{ uri: "file://b", type: "video/mp4" }]);
    expect(video.name).toBe("video.mp4");
  });

  it("keeps an explicit filename", () => {
    const [file] = normalizeMediaFiles([
      { uri: "file://a", type: "image/jpeg", name: "custom.png" },
    ]);
    expect(file.name).toBe("custom.png");
  });
});

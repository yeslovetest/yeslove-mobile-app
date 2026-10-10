import { getMediaHeaders, isApiMediaUri } from "@/app/services/mediaAuth";
import { BASE_URL } from "@/app/config/baseUrl";

describe("media auth headers", () => {
  const apiFile = `${BASE_URL}/api/media/abc-123`;

  it("recognises files served by our own API", () => {
    expect(isApiMediaUri(apiFile)).toBe(true);
    expect(isApiMediaUri("https://cdn.example.test/media/abc/file.png")).toBe(false);
    expect(isApiMediaUri("file:///cache/photo.jpg")).toBe(false);
  });

  it("adds the bearer token for our API's media", () => {
    expect(getMediaHeaders(apiFile, "tok")).toEqual({ Authorization: "Bearer tok" });
  });

  it("sends nothing to other hosts, so the token is never leaked", () => {
    expect(getMediaHeaders("https://cdn.example.test/media/abc/file.png", "tok")).toBeUndefined();
    expect(getMediaHeaders("file:///cache/photo.jpg", "tok")).toBeUndefined();
  });

  it("sends nothing when there is no token", () => {
    expect(getMediaHeaders(apiFile, null)).toBeUndefined();
    expect(getMediaHeaders(apiFile, undefined)).toBeUndefined();
  });
});

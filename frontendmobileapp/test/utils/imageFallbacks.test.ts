import {
  resolveRemoteImageUri,
  getImageSource,
  DEFAULT_PROFILE_IMAGE,
  DEFAULT_GENERIC_IMAGE,
} from "@/constants/imageFallbacks";
import { BASE_URL } from "@/app/config/baseUrl";

describe("resolveRemoteImageUri", () => {
  it("returns an empty string for empty/whitespace input", () => {
    expect(resolveRemoteImageUri(undefined)).toBe("");
    expect(resolveRemoteImageUri("   ")).toBe("");
  });

  it("passes absolute and data/file/content URIs through untouched", () => {
    const abs = "https://cdn.example.com/a.jpg";
    expect(resolveRemoteImageUri(abs)).toBe(abs);
    expect(resolveRemoteImageUri("data:image/png;base64,xxx")).toBe("data:image/png;base64,xxx");
  });

  it("prefixes root-relative paths with the base URL", () => {
    expect(resolveRemoteImageUri("/media/a.jpg")).toBe(`${BASE_URL}/media/a.jpg`);
  });

  it("treats a bare value as a media id only when asked", () => {
    expect(resolveRemoteImageUri("abc123", true)).toBe(`${BASE_URL}/api/media/abc123`);
    // without the flag a bare value is treated as a relative path
    expect(resolveRemoteImageUri("abc123", false)).toBe(`${BASE_URL}/abc123`);
  });
});

describe("getImageSource", () => {
  it("returns the profile fallback when there is no value", () => {
    expect(getImageSource(undefined, "profile")).toBe(DEFAULT_PROFILE_IMAGE);
  });

  it("returns the generic fallback when there is no value", () => {
    expect(getImageSource("", "generic")).toBe(DEFAULT_GENERIC_IMAGE);
  });

  it("wraps a resolved uri in a source object", () => {
    expect(getImageSource("https://cdn.example.com/a.jpg", "profile")).toEqual({
      uri: "https://cdn.example.com/a.jpg",
    });
  });
});

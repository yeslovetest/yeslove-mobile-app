import { formatSizeMb, MEDIA_UPLOAD_LIMITS } from "@/constants/mediaLimits";

describe("formatSizeMb", () => {
  it("formats an exact megabyte value to one decimal place", () => {
    expect(formatSizeMb(1024 * 1024)).toBe("1.0MB");
  });

  it("rounds to one decimal place", () => {
    expect(formatSizeMb(1.5 * 1024 * 1024)).toBe("1.5MB");
    expect(formatSizeMb(3.25 * 1024 * 1024)).toBe("3.3MB");
  });

  it("formats zero bytes", () => {
    expect(formatSizeMb(0)).toBe("0.0MB");
  });

  it("formats the configured post media limit as 3.0MB", () => {
    expect(formatSizeMb(MEDIA_UPLOAD_LIMITS.postMediaFileMaxBytes)).toBe("3.0MB");
  });
});

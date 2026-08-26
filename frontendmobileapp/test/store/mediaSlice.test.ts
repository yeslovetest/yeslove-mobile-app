import mediaReducer, {
  setMediaItems,
  setUploadedMediaId,
} from "@/app/store/Profile-store/mediaSlice";
import type { MediaFile } from "@/generated-api";

describe("mediaSlice", () => {
  it("stores the fetched media list", () => {
    const items = [{ id: 1 }, { id: 2 }] as unknown as MediaFile[];
    const state = mediaReducer(undefined, setMediaItems(items));
    expect(state.mediaList).toEqual(items);
  });

  it("records uploaded media ids (initially null)", () => {
    const initial = mediaReducer(undefined, { type: "@@INIT" });
    expect(initial.uploadedMediaId).toBeNull();

    const state = mediaReducer(initial, setUploadedMediaId(["a", "b"]));
    expect(state.uploadedMediaId).toEqual(["a", "b"]);
  });
});

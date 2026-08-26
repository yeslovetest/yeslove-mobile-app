import profileReducer, {
  setProfileInformationAction,
  setActiveTabAction,
  setEmailNotification,
  setProfileVisibility,
  fetchUserTimelineAction,
  setUserTimelineAction,
  setUserTimelineFailedAction,
} from "@/app/store/Profile-store/profileSlice";
import type { UserPost, UserProfile } from "@/generated-api";

const posts = (ids: number[]): UserPost[] => ids.map((id) => ({ id }) as unknown as UserPost);

describe("profileSlice", () => {
  it("stores a profile keyed by id", () => {
    const data = { username: "ada" } as unknown as UserProfile;
    const state = profileReducer(undefined, setProfileInformationAction({ id: "kc1", data }));
    expect(state.profiles.kc1).toEqual(data);
  });

  it("switches the active profile tab", () => {
    const state = profileReducer(undefined, setActiveTabAction("Media"));
    expect(state.view.activeTab).toBe("Media");
  });

  describe("email notification setting", () => {
    it("adds a new setting when it does not exist", () => {
      const state = profileReducer(undefined, setEmailNotification({ id: 5 }));
      const setting = state.settings.emailNotificationSettings.find((s) => s.setting_id === "5");
      expect(setting).toBeDefined();
    });

    it("toggles an existing setting's value", () => {
      const added = profileReducer(undefined, setEmailNotification({ id: 5 }));
      const initialValue = added.settings.emailNotificationSettings[0].value;
      const toggled = profileReducer(added, setEmailNotification({ id: 5 }));
      expect(toggled.settings.emailNotificationSettings[0].value).toBe(!initialValue);
    });
  });

  describe("profile visibility setting", () => {
    it("flips visible <-> hidden for an existing setting", () => {
      let state = profileReducer(undefined, setProfileVisibility({ id: 2, category: "email" }));
      // first insert defaults to hidden
      expect(state.settings.profileVisibilitySettings[0].value).toBe("hidden");

      state = profileReducer(state, setProfileVisibility({ id: 2, category: "email" }));
      expect(state.settings.profileVisibilitySettings[0].value).toBe("visible");
    });
  });

  describe("timeline state machine", () => {
    it("resets timeline state when fetching the first page", () => {
      const primed = profileReducer(
        undefined,
        setUserTimelineAction({
          id: "kc1",
          posts: posts([1, 2]),
          total: 2,
          perPage: 10,
          currentPage: 1,
        }),
      );

      const state = profileReducer(
        primed,
        fetchUserTimelineAction({ id: "kc2", page: 1, reset: true }),
      );

      expect(state.timeline.loading).toBe(true);
      expect(state.timeline.posts).toEqual([]);
      expect(state.timeline.keycloakId).toBe("kc2");
      expect(state.timeline.initialized).toBe(false);
    });

    it("stores posts, de-duplicates, and computes hasMore", () => {
      const state = profileReducer(
        undefined,
        setUserTimelineAction({
          id: "kc1",
          posts: posts([1, 1, 2]),
          total: 5,
          perPage: 10,
          currentPage: 1,
        }),
      );

      expect(state.timeline.posts.map((p) => p.id)).toEqual([1, 2]);
      expect(state.timeline.hasMore).toBe(true); // 2 loaded < total 5
      expect(state.timeline.loading).toBe(false);
      expect(state.timeline.initialized).toBe(true);
    });

    it("records an error and stops loading on failure", () => {
      const loading = profileReducer(
        undefined,
        fetchUserTimelineAction({ id: "kc1", page: 1, reset: true }),
      );
      const state = profileReducer(
        loading,
        setUserTimelineFailedAction({ message: "network down" }),
      );

      expect(state.timeline.error).toBe("network down");
      expect(state.timeline.loading).toBe(false);
      expect(state.timeline.initialized).toBe(true);
    });
  });
});

import userReducer, {
  setName,
  setUserId,
  setPassword,
  setUserDBID,
} from "@/app/store/Profile-store/userSlice";

describe("userSlice", () => {
  it("sets the display name", () => {
    const state = userReducer(undefined, setName("Ada"));
    expect(state.name).toBe("Ada");
  });

  it("sets the keycloak id and database id independently", () => {
    let state = userReducer(undefined, setUserId("kc-123"));
    state = userReducer(state, setUserDBID(7));

    expect(state.id).toBe("kc-123");
    expect(state.userDBID).toBe(7);
  });

  it("sets the password", () => {
    const state = userReducer(undefined, setPassword("secret"));
    expect(state.password).toBe("secret");
  });
});

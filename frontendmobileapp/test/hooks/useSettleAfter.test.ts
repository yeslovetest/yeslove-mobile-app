import { act, renderHook } from "@testing-library/react-native";
import { useSettleAfter } from "@/app/Universal-components/List-state/useSettleAfter";

describe("useSettleAfter", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("starts unsettled (false)", () => {
    const { result } = renderHook(() => useSettleAfter(600));
    expect(result.current).toBe(false);
  });

  it("stays false before the delay elapses", () => {
    const { result } = renderHook(() => useSettleAfter(600));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe(false);
  });

  it("flips to true once the delay elapses", () => {
    const { result } = renderHook(() => useSettleAfter(600));
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(result.current).toBe(true);
  });
});

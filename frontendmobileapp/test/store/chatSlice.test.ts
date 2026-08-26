import chatReducer, {
  setChatMessages,
  sendChatMessageStarted,
  sendChatMessageSucceeded,
  sendChatMessageFailed,
  resetSendChatMessageStatus,
  setFriendList,
  setMessagesScrollViewPosition,
  setChatbotResponse,
} from "@/app/store/Chat/chatSlice";
import type { Chat, FriendInfo } from "@/generated-api";

describe("chatSlice", () => {
  it("stores chat messages and the friend list", () => {
    const messages = [{ id: 1 }] as unknown as Chat[];
    const friends = [{ id: "f1" }] as unknown as FriendInfo[];

    let state = chatReducer(undefined, setChatMessages(messages));
    state = chatReducer(state, setFriendList(friends));

    expect(state.messages).toEqual(messages);
    expect(state.friends).toEqual(friends);
  });

  describe("send-message status machine", () => {
    it("moves idle -> sending -> succeeded and clears errors", () => {
      let state = chatReducer(undefined, sendChatMessageFailed("boom"));
      expect(state.sendMessageStatus).toBe("failed");
      expect(state.sendMessageError).toBe("boom");

      state = chatReducer(state, sendChatMessageStarted());
      expect(state.sendMessageStatus).toBe("sending");
      expect(state.sendMessageError).toBe("");

      state = chatReducer(state, sendChatMessageSucceeded());
      expect(state.sendMessageStatus).toBe("succeeded");
    });

    it("resets back to idle", () => {
      const failed = chatReducer(undefined, sendChatMessageFailed("boom"));
      const state = chatReducer(failed, resetSendChatMessageStatus());
      expect(state.sendMessageStatus).toBe("idle");
      expect(state.sendMessageError).toBe("");
    });
  });

  it("persists the messages scroll position", () => {
    const state = chatReducer(undefined, setMessagesScrollViewPosition(120));
    expect(state.messagesScrollViewPosition).toBe(120);
  });

  describe("setChatbotResponse", () => {
    it("coerces a payload into the stored shape and stamps updated_at", () => {
      const state = chatReducer(
        undefined,
        setChatbotResponse({
          response: "hello",
          user_id: "u1",
          session_id: "s1",
          sources: "kb",
        } as any),
      );

      expect(state.chatbotResponse.response).toBe("hello");
      expect(state.chatbotResponse.user_id).toBe("u1");
      expect(state.chatbotResponse.updated_at).toBeGreaterThan(0);
    });

    it("clears the response when passed null", () => {
      const withValue = chatReducer(undefined, setChatbotResponse({ response: "hello" } as any));
      const state = chatReducer(withValue, setChatbotResponse(null));

      expect(state.chatbotResponse.response).toBe("");
      expect(state.chatbotResponse.session_id).toBe("");
    });
  });
});

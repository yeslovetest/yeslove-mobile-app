import Header from "@/app/Universal-components/Header/Header";
import React, { useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import messagesSharedStyles from "../MessagesSharedStyles";
import OneMessage from "./Messages-root-components/One-message/OneMessage";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice";
import AskChatbotButton from "./Messages-root-components/Ask-chatbot-button/AskChatbotButton";
import { fetchChatMessages, setMessagesScrollViewPosition } from "@/app/store/Chat/chatSlice";
import { useFocusEffect } from "expo-router";

const Messages = () => {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const scrollViewRef = React.useRef<ScrollView>(null);
  const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
  const userName = useAppSelector((state) => state.profile.profiles[userId]?.username ?? "");
  const friendList = useAppSelector((state) => state.chat.friends) || [];
  const messagesScrollViewPosition = useAppSelector(
    (state) => state.chat.messagesScrollViewPosition,
  );

  useFocusEffect(
    React.useCallback(() => {
      let restoreTimer: ReturnType<typeof setTimeout> | undefined;

      if (scrollViewRef.current && messagesScrollViewPosition > 0) {
        restoreTimer = setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: messagesScrollViewPosition, animated: false });
        }, 10);
      }

      return () => {
        if (restoreTimer) {
          clearTimeout(restoreTimer);
        }
      };
    }, []),
  );

  const openConversation = (otherUserId: string, profilePic: string) => {
    dispatch(fetchChatMessages(otherUserId ?? ""));
    dispatch(
      openTabOnTopAction({
        type: TabType.CONVERSATION,
        data: { userId: otherUserId, profile_pic: profilePic },
      }),
    );
  };
  // Apply filter to friendList
  const filteredFriendList = friendList.filter((friend) => {
    if (filter === "all") return true;
    if (filter === "read") return friend.unread === false;
    if (filter === "unread") return friend.unread === true;
    return true;
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    dispatch(setMessagesScrollViewPosition(event.nativeEvent.contentOffset.y));
  };

  return (
    <>
      <Header mainTitle={userName}></Header>
      <View style={messagesSharedStyles.container}>
        <Text style={messagesSharedStyles.messagesText}>Messages</Text>
        <AskChatbotButton onClick={() => dispatch(openTabOnTopAction({ type: TabType.CHATBOT }))} />

        <View style={messagesSharedStyles.filterBar}>
          <TouchableOpacity onPress={() => setFilter("all")}>
            <View
              style={[
                messagesSharedStyles.filterButton,
                filter === "all"
                  ? messagesSharedStyles.filterButtonActive
                  : messagesSharedStyles.filterButtonInactive,
              ]}
            >
              <Text
                style={[
                  messagesSharedStyles.filterButtonText,
                  filter === "all"
                    ? messagesSharedStyles.filterButtonTextActive
                    : messagesSharedStyles.filterButtonTextInactive,
                ]}
              >
                All
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilter("read")}>
            <View
              style={[
                messagesSharedStyles.filterButton,
                filter === "read"
                  ? messagesSharedStyles.filterButtonActive
                  : messagesSharedStyles.filterButtonInactive,
              ]}
            >
              <Text
                style={[
                  messagesSharedStyles.filterButtonText,
                  filter === "read"
                    ? messagesSharedStyles.filterButtonTextActive
                    : messagesSharedStyles.filterButtonTextInactive,
                ]}
              >
                Read
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilter("unread")}>
            <View
              style={[
                messagesSharedStyles.filterButton,
                filter === "unread"
                  ? messagesSharedStyles.filterButtonActive
                  : messagesSharedStyles.filterButtonInactive,
              ]}
            >
              <Text
                style={[
                  messagesSharedStyles.filterButtonText,
                  filter === "unread"
                    ? messagesSharedStyles.filterButtonTextActive
                    : messagesSharedStyles.filterButtonTextInactive,
                ]}
              >
                Unread
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={messagesSharedStyles.contentContainer}
          style={{ width: "100%" }}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={{ width: "100%" }}>
            {filteredFriendList.map((friend, key) => (
              <TouchableOpacity
                onPress={() => openConversation(friend.id ?? "", friend.profile_pic ?? "")}
                key={friend.id ?? key}
              >
                <OneMessage message={friend}></OneMessage>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Messages;

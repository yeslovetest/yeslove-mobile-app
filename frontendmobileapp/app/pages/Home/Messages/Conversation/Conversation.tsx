import Header from '@/app/Universal-components/Header/Header';
import React, { useEffect, useCallback, useState, useRef } from 'react';
import * as ImagePicker from "expo-image-picker";
import { View, KeyboardAvoidingView, Platform, FlatList, Alert, Keyboard, Animated } from 'react-native';
import ChatResponse from './Conversation-components/Chat-response/ChatResponse';
import Message from './Conversation-components/Message/Message';
import ConversationTextInput from './Conversation-components/Conversation-text-input/ConversationTextInput';
import styles from './ConversationStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { sendChatMessage, markChatOpened, setChatMessages, fetchFriendList } from '@/app/store/Chat/chatSlice';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import MediaFilePreview from './Conversation-components/MediaPreview/mediaPreview';
import LoadingOverlay from '@/app/Universal-components/LoadingScreen/Screen';
import { MEDIA_UPLOAD_LIMITS, formatSizeMb } from '@/constants/mediaLimits';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Conversation = () => {

  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const messages = useAppSelector(state => state.chat.messages ?? []);
  const userName = useAppSelector(state => state.user.name ?? "");
  const currentUserId = useAppSelector(state => state.user.id ?? "");
  const otherUserId = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data?.userId
  );
  const otherUserProfilePic = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data?.profile_pic);
  const otherUserName = useAppSelector((state) =>
    state.chat.friends.find((friend) => friend.id === otherUserId)?.username ||
    (otherUserId ? state.profile.profiles[otherUserId]?.username : '') ||
    'Conversation'
  );
  const [selectedFiles, setSelectedFiles] = useState<Array<{ uri: string; type: string; name?: string }> | null>(null);
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const hasSelectedMedia = (selectedFiles?.length ?? 0) > 0;
  const mediaTrayAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {

      return () => {
        // Runs when screen loses focus
        dispatch(setChatMessages([]));  
      };
    }, [])
  );
  
  //console.log(messages)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only run if there’s a last message and it hasn’t been opened by the current user
    if (lastMessage?.opened === false && lastMessage?.sender !== userName) {
      dispatch(markChatOpened(otherUserId ?? ''));
      dispatch(fetchFriendList(currentUserId ?? ''));  // Refresh friend list
    }

    // This effect will run once when messages become available
  }, [messages.length]);

  useEffect(() => {
    //hide loading screen once messages are loaded
    setLoadingVisible(false)
  }, [messages])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(mediaTrayAnim, {
      toValue: hasSelectedMedia ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [hasSelectedMedia, mediaTrayAnim]);
  
  const handleSend = async (text: string) => {
      const trimmedText = (text ?? '').trim();
      const filesToUpload = selectedFiles ?? [];

      if (!otherUserId) {
        Alert.alert('Unable to send', 'Conversation recipient is missing. Please reopen the chat.');
        return;
      }

      if (!trimmedText && filesToUpload.length === 0) {
        return;
      }

    try {
      // Send text and media in one request so message creation is atomic from the client perspective.
      setLoadingVisible(true);

      await new Promise<void>((resolve, reject) => {
        dispatch(
          sendChatMessage({
            id: otherUserId,
            message: trimmedText,
            mediaFiles: filesToUpload.length > 0 ? filesToUpload : undefined,
            resolve,
            reject,
          })
        );
      });

      setSelectedFiles([]);
    } catch (error) {
      console.error('failed to send chat message', error);
      setLoadingVisible(false);
      Alert.alert('Send failed', 'Unable to send your message right now. Please try again.');
      return;
    }

    // Keep latest sent message visible after keyboard interaction.
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 70);
    Keyboard.dismiss();
    
  };

  const selectMedia = async (type: string ) => {
    try {
      if (type === "media") {
        // Allow both images and videos
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All, 
          quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
          const asset = result.assets[0];
          if (
            typeof asset.fileSize === 'number' &&
            asset.fileSize > MEDIA_UPLOAD_LIMITS.chatMediaFileMaxBytes
          ) {
            Alert.alert(
              'File too large',
              `Please choose a file up to ${formatSizeMb(MEDIA_UPLOAD_LIMITS.chatMediaFileMaxBytes)}.`
            );
            return;
          }

          setSelectedFiles((prev) => [
            ...(prev || []),
            {
              uri: asset.uri,
              type: asset.type === "video" ? "video/mp4" : "image/jpeg",
              name:
                asset.fileName ??
                (asset.type === "video" ? "video.mp4" : "photo.jpg"),
            },
          ]);
        }
      }
    }  
    catch (err) {
      console.error("File picking error:", err);
    }};

    const deleteSelectedFile = (index: number) => {
      setSelectedFiles(prev => {
        if (!prev) return prev;
        const copy = [...prev];
        copy.splice(index, 1);     
        return copy;
      });
    };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
    >
      <LoadingOverlay visible={loadingVisible}/>
      <Header mainTitle={otherUserName} />
      <View style={styles.chatContainer}>
       
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={[
            styles.contentContainer,
            hasSelectedMedia ? { paddingBottom: 182 } : { paddingBottom: 96 },
          ]}
          renderItem={({ item }) =>
            item?.sender !== userName ? (
              <ChatResponse text={item?.content ?? ''} 
              time={dayjs(item?.timestamp ?? '').format('MMM D, YYYY h:mm A')}
              profilePic={otherUserProfilePic}
              media={item?.media ?? []}/>
            ) : (
              <Message prompt={item?.content ?? ''} 
              time={dayjs(item?.timestamp ?? '').format('MMM D, YYYY h:mm A')}
               media={item?.media ?? []}/>
            )
          }
          
          onContentSizeChange={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 90);
          }}
        />

        {hasSelectedMedia && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                zIndex: 12,
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#d7deea',
                borderRadius: 14,
                paddingHorizontal: 10,
                paddingTop: 8,
                paddingBottom: 4,
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 6,
              },
              {
                bottom: 64 + (keyboardHeight > 0 ? Math.max(insets.bottom, 8) : 0),
                opacity: mediaTrayAnim,
                transform: [
                  {
                    translateY: mediaTrayAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <MediaFilePreview file={selectedFiles ?? []} editable={true} deleteMedia={deleteSelectedFile} />
          </Animated.View>
        )}
       
        <View
          style={[
            styles.inputDock,
            {
              // Keep the full composer above keyboard edge on both platforms.
              marginBottom: keyboardHeight > 0 ? Math.max(insets.bottom, 8) : 0,
            },
          ]}
        >
          <ConversationTextInput onSend={handleSend} openMedia={selectMedia}/>
        </View>
        
      </View>
    </KeyboardAvoidingView>
  );
};

export default Conversation;


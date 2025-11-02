import Header from '@/app/Universal-components/Header/Header';
import React, { useEffect, useCallback, useState } from 'react';
import * as ImagePicker from "expo-image-picker";
import { View, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import ChatResponse from './Conversation-components/Chat-response/ChatResponse';
import Message from './Conversation-components/Message/Message';
import ConversationTextInput from './Conversation-components/Conversation-text-input/ConversationTextInput';
import styles from './ConversationStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { sendChatMessage, markChatOpened, setChatMessages, fetchFriendList, setMediaFormData } from '@/app/store/Chat/chatSlice';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { uploadBulkMedia, uploadMedia } from '@/app/store/Profile-store/mediaSlice';
import MediaFilePreview from './Conversation-components/MediaPreview/mediaPreview';


  function dataURLtoFile(dataUrl: string, filename: string) {
      // covert base64/URLEncoded data component to raw binary data held in a string - 
      // for web browser testing (not needed on mobile)
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
  }

const Conversation = () => {

  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.chat.messages ?? []);
  const userName = useAppSelector(state => state.user.name ?? "");
  const currentUserId = useAppSelector(state => state.user.id ?? "");
  const otherUserId = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data?.userId
  );
  const uploadedMediaId = useAppSelector(state => state.media.uploadedMediaId);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ uri: string; type: string; name?: string }> | null>(null);

  useFocusEffect(
    useCallback(() => {

      return () => {
        // Runs when screen loses focus
        dispatch(setChatMessages([]));  
      };
    }, [])
  );
  
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only run if there’s a last message and it hasn’t been opened by the current user
    if (lastMessage?.opened === false && lastMessage?.sender !== userName) {
      dispatch(markChatOpened(otherUserId ?? ''));
      dispatch(fetchFriendList(currentUserId ?? ''));  // Refresh friend list
    }

  // This effect will run once when messages become available
  }, [messages.length]);
     

  const handleSend = (text: string) => {
      const mediaData = new FormData(); // form data for Media upload
  
      if (selectedFiles) {
        const fieldName = "file"; 
        

        selectedFiles.forEach((selectedFile) => {
           // detect if it's base64 or file URI
          if (selectedFile.uri.startsWith("file:")) {
            // handle both image and video here
            const file = selectedFile;
            mediaData.append(fieldName, file as any);
          } 
          else if (selectedFile.uri.startsWith("data:")) {
            // handle base64 (e.g., for web)
            const file: File | any = dataURLtoFile(
              selectedFile.uri,
              selectedFile.name ??
                (selectedFile.type.startsWith("video") ? "video.mp4" : "photo.jpg") 
            );
            mediaData.append(fieldName, file);
          }
        });  

        if (mediaData.getAll(fieldName).length === 1) {
          dispatch(uploadMedia({requestBody: mediaData}));  
        } else if (mediaData.getAll(fieldName).length > 1) {
          dispatch(uploadBulkMedia({requestBody: mediaData}));  
        }
      
      }
    
    if (uploadedMediaId && uploadedMediaId.length > 0) {
      uploadedMediaId.forEach((mediaId) => {
        dispatch(sendChatMessage({id: otherUserId, message: text, mediaID: mediaId}));
      });
    } else {
      dispatch(sendChatMessage({id: otherUserId, message: text}));
    }
  };

  const selectMedia = async (type: "media" ) => {
    try {
      if (type === "media") {
        // Allow both images and videos
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All, // 👈 allows both
          quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
          const asset = result.assets[0];
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      <Header />
      <View style={styles.chatContainer}>
       
        <FlatList
          data={messages}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) =>
            item?.sender !== userName ? (
              <ChatResponse text={item?.content ?? ''} 
              time={dayjs(item?.timestamp ?? '').format('MMM D, YYYY h:mm A')}
              media={item?.media ?? []}/>
            ) : (
              <Message prompt={item?.content ?? ''} 
              time={dayjs(item?.timestamp ?? '').format('MMM D, YYYY h:mm A')}
               media={item?.media ?? []}/>
            )
          }
          contentContainerStyle={styles.contentContainer}
        />

        {selectedFiles && (
          <MediaFilePreview file={selectedFiles}/>
        )}
       
      <View style={{justifyContent: "center", width: "100%", alignItems: "center"}}>
        <ConversationTextInput onSend={handleSend} openMedia={selectMedia}/>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Conversation;


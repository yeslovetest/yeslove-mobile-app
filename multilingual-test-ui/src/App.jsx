import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./App.css";


const VOICE_API_URL =
  "http://127.0.0.1:5000/api/v1/multilingual/voice";

const TEXT_API_URL =
  "http://127.0.0.1:5000/api/v1/multilingual/text";


const LANGUAGES = [
  {
    code: "eng",
    name: "English",
    flag: "🇬🇧",
  },
  {
    code: "pan",
    name: "Punjabi",
    flag: "🇵🇰",
  },
  {
    code: "urd",
    name: "Urdu",
    flag: "🇵🇰",
  },
  {
    code: "ben",
    name: "Bengali",
    flag: "🇧🇩",
  },
  {
    code: "ara",
    name: "Arabic",
    flag: "🌍",
  },
  {
    code: "som",
    name: "Somali",
    flag: "🇸🇴",
  },
  {
    code: "yor",
    name: "Yoruba",
    flag: "🇳🇬",
  },
  {
    code: "ibo",
    name: "Igbo",
    flag: "🇳🇬",
  },
  {
    code: "swh",
    name: "Swahili",
    flag: "🌍",
  },
];


function createSessionId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}


function App() {
  const [
    selectedLanguage,
    setSelectedLanguage,
  ] = useState("eng");

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false);

  const [
    status,
    setStatus,
  ] = useState("Ready");

  const [
    sessionId,
  ] = useState(createSessionId);

  const [
    recordingSeconds,
    setRecordingSeconds,
  ] = useState(0);

  const [
    textInput,
    setTextInput,
  ] = useState("");

  const [
    playingMessageId,
    setPlayingMessageId,
  ] = useState(null);


  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const streamRef =
    useRef(null);

  const timerRef =
    useRef(null);

  const bottomRef =
    useRef(null);

  // Keep a reference to the currently playing Web Audio source
  // so we can stop/clean it safely when needed.
  const playbackSourceRef =
    useRef(null);

  const playbackContextRef =
    useRef(null);


  const currentLanguage =
    LANGUAGES.find(
      (item) =>
        item.code === selectedLanguage
    ) || LANGUAGES[0];


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    isProcessing,
  ]);


  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

      if (playbackSourceRef.current) {
        try {
          playbackSourceRef.current.stop();
        } catch {
          // Source may already have finished.
        }

        playbackSourceRef.current = null;
      }

      if (playbackContextRef.current) {
        playbackContextRef.current.close();
        playbackContextRef.current = null;
      }
    };
  }, []);


  // --------------------------------------------------
  // START MICROPHONE RECORDING
  // --------------------------------------------------

  const startRecording = async () => {
    if (isProcessing) {
      return;
    }

    try {
      setStatus(
        "Requesting microphone..."
      );

      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            audio: true,
          });

      streamRef.current =
        stream;

      audioChunksRef.current =
        [];

      const recorder =
        new MediaRecorder(
          stream
        );

      mediaRecorderRef.current =
        recorder;


      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            audioChunksRef.current.push(
              event.data
            );
          }
        };


      recorder.onstop =
        async () => {
          const blob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  recorder.mimeType ||
                  "audio/webm",
              }
            );

          stream
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );

          streamRef.current =
            null;

          await sendAudio(
            blob
          );
        };


      recorder.start();

      setRecordingSeconds(
        0
      );

      setIsRecording(
        true
      );

      setStatus(
        `Listening in ${currentLanguage.name}...`
      );


      timerRef.current =
        setInterval(
          () => {
            setRecordingSeconds(
              (previous) =>
                previous + 1
            );
          },
          1000
        );

    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      setStatus(
        "Microphone access failed"
      );

      alert(
        "Could not access your microphone. Please allow microphone permission in the browser."
      );
    }
  };


  // --------------------------------------------------
  // STOP RECORDING
  // --------------------------------------------------

  const stopRecording = () => {
    if (
      !mediaRecorderRef.current
    ) {
      return;
    }

    if (
      mediaRecorderRef.current
        .state === "inactive"
    ) {
      return;
    }

    mediaRecorderRef.current
      .stop();

    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;
    }

    setIsRecording(
      false
    );

    setStatus(
      "Processing speech..."
    );
  };


  // --------------------------------------------------
  // NORMALISE AUDIO FROM BACKEND
  // --------------------------------------------------

  const getAudioChunks = (
    data
  ) => {
    if (
      Array.isArray(
        data.audio_chunks_base64
      ) &&
      data.audio_chunks_base64
        .length > 0
    ) {
      return (
        data.audio_chunks_base64
      );
    }

    if (
      data.audio_base64
    ) {
      return [
        data.audio_base64,
      ];
    }

    return [];
  };


  // --------------------------------------------------
  // SEND VOICE MESSAGE
  // --------------------------------------------------

  const sendAudio = async (
    blob
  ) => {
    setIsProcessing(
      true
    );

    setStatus(
      "Transcribing..."
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "audio",
        blob,
        "recording.webm"
      );

      formData.append(
        "language",
        selectedLanguage
      );

      formData.append(
        "session_id",
        sessionId
      );


      const response =
        await fetch(
          VOICE_API_URL,
          {
            method: "POST",
            body: formData,
          }
        );


      const data =
        await response.json();


      console.log(
        "===== VOICE RESPONSE ====="
      );

      console.log(
        data
      );

      console.log(
        "tts_available:",
        data.tts_available
      );

      console.log(
        "audio chunks:",
        data
          .audio_chunks_base64
          ?.length || 0
      );


      if (!response.ok) {
        throw new Error(
          data.error ||
          "The server returned an error."
        );
      }


      const userText =
        data.user_text ||
        data.text ||
        "";


      if (userText) {
        setMessages(
          (previous) => [
            ...previous,
            {
              id:
                `${Date.now()}-user`,

              role:
                "user",

              text:
                userText,

              language:
                data.language ||
                selectedLanguage,

              inputType:
                "voice",

              createdAt:
                new Date(),
            },
          ]
        );
      }


      if (data.bot_text) {
        const audioChunks =
          getAudioChunks(
            data
          );

        setMessages(
          (previous) => [
            ...previous,
            {
              id:
                `${Date.now()}-assistant`,

              role:
                "assistant",

              text:
                data.bot_text,

              language:
                data.language ||
                selectedLanguage,

              audioChunks,

              createdAt:
                new Date(),
            },
          ]
        );
      }


      if (
        data.requires_language ||
        data
          .requires_language_confirmation
      ) {
        setStatus(
          "Please confirm the language"
        );
      } else {
        setStatus(
          "Ready"
        );
      }

    } catch (error) {
      console.error(
        "Voice request error:",
        error
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              `${Date.now()}-error`,

            role:
              "system",

            text:
              error.message ||
              "Something went wrong.",

            createdAt:
              new Date(),
          },
        ]
      );

      setStatus(
        "Request failed"
      );

    } finally {
      setIsProcessing(
        false
      );

      setRecordingSeconds(
        0
      );
    }
  };


  // --------------------------------------------------
  // SEND TEXT MESSAGE
  // --------------------------------------------------

  const sendTextMessage =
    async () => {

      const message =
        textInput.trim();

      if (
        !message ||
        isProcessing
      ) {
        return;
      }


      setTextInput(
        ""
      );

      setIsProcessing(
        true
      );

      setStatus(
        "Searching knowledge base..."
      );


      const userMessage = {
        id:
          `${Date.now()}-user`,

        role:
          "user",

        text:
          message,

        language:
          selectedLanguage,

        inputType:
          "text",

        createdAt:
          new Date(),
      };


      setMessages(
        (previous) => [
          ...previous,
          userMessage,
        ]
      );


      try {
        const response =
          await fetch(
            TEXT_API_URL,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  message,

                  language:
                    selectedLanguage,

                  session_id:
                    sessionId,
                }),
            }
          );


        const data =
          await response.json();


        console.log(
          "===== TEXT RESPONSE ====="
        );

        console.log(
          data
        );


        if (!response.ok) {
          throw new Error(
            data.error ||
            "The server returned an error."
          );
        }


        const audioChunks =
          getAudioChunks(
            data
          );


        setMessages(
          (previous) => [
            ...previous,
            {
              id:
                `${Date.now()}-assistant`,

              role:
                "assistant",

              text:
                data.bot_text ||
                data.response ||
                "No response was returned.",

              language:
                data.language ||
                selectedLanguage,

              audioChunks,

              createdAt:
                new Date(),
            },
          ]
        );


        setStatus(
          "Ready"
        );

      } catch (error) {
        console.error(
          "Text request error:",
          error
        );

        setMessages(
          (previous) => [
            ...previous,
            {
              id:
                `${Date.now()}-error`,

              role:
                "system",

              text:
                error.message ||
                "Something went wrong.",

              createdAt:
                new Date(),
            },
          ]
        );

        setStatus(
          "Request failed"
        );

      } finally {
        setIsProcessing(
          false
        );
      }
    };


  // --------------------------------------------------
  // TTS AUDIO HELPERS
  // --------------------------------------------------

  const base64ToArrayBuffer = (
    base64Value
  ) => {
    if (!base64Value) {
      throw new Error(
        "Received an empty audio chunk."
      );
    }

    // Support both raw base64 strings and complete
    // data URLs returned by the backend.
    const cleanBase64 =
      base64Value.includes(",")
        ? base64Value.split(",").pop()
        : base64Value;

    const binaryString =
      window.atob(cleanBase64);

    const bytes =
      new Uint8Array(
        binaryString.length
      );

    for (
      let index = 0;
      index < binaryString.length;
      index += 1
    ) {
      bytes[index] =
        binaryString.charCodeAt(index);
    }

    return bytes.buffer;
  };


  const concatenateAudioBuffers = (
    audioContext,
    buffers
  ) => {
    if (!buffers.length) {
      throw new Error(
        "No decoded audio buffers were available."
      );
    }

    const channelCount =
      Math.max(
        ...buffers.map(
          (buffer) =>
            buffer.numberOfChannels
        )
      );

    const sampleRate =
      audioContext.sampleRate;

    // decodeAudioData normally converts all buffers to the
    // AudioContext sample rate, so their frame lengths can be
    // safely added together.
    const totalLength =
      buffers.reduce(
        (sum, buffer) =>
          sum + buffer.length,
        0
      );

    const combinedBuffer =
      audioContext.createBuffer(
        channelCount,
        totalLength,
        sampleRate
      );

    let writeOffset = 0;

    buffers.forEach(
      (buffer) => {
        for (
          let channel = 0;
          channel < channelCount;
          channel += 1
        ) {
          const outputChannel =
            combinedBuffer.getChannelData(
              channel
            );

          // If a chunk has fewer channels than the combined
          // buffer, reuse its last available channel.
          const sourceChannelIndex =
            Math.min(
              channel,
              buffer.numberOfChannels - 1
            );

          outputChannel.set(
            buffer.getChannelData(
              sourceChannelIndex
            ),
            writeOffset
          );
        }

        writeOffset +=
          buffer.length;
      }
    );

    return combinedBuffer;
  };


  // --------------------------------------------------
  // PLAY COMPLETE TTS RESPONSE
  // --------------------------------------------------

  const playAssistantAudio =
    async (
      audioChunks,
      messageId
    ) => {

      if (
        !Array.isArray(audioChunks) ||
        audioChunks.length === 0
      ) {
        console.warn(
          "No TTS audio chunks are available for this message."
        );

        return;
      }


      if (playingMessageId) {
        return;
      }


      setPlayingMessageId(
        messageId
      );


      try {
        console.log(
          `Preparing ${audioChunks.length} TTS audio chunks`
        );


        // Stop a previous source if one somehow still exists.
        if (playbackSourceRef.current) {
          try {
            playbackSourceRef.current.stop();
          } catch {
            // It may already have ended.
          }

          playbackSourceRef.current =
            null;
        }


        // Close an old context before creating a new one.
        if (playbackContextRef.current) {
          try {
            await playbackContextRef.current.close();
          } catch {
            // Ignore cleanup failure.
          }

          playbackContextRef.current =
            null;
        }


        const AudioContextClass =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContextClass) {
          throw new Error(
            "Web Audio API is not supported by this browser."
          );
        }


        const audioContext =
          new AudioContextClass();

        playbackContextRef.current =
          audioContext;


        // This call is made directly from the Play button click.
        // Keeping one AudioContext avoids browsers treating every
        // later chunk as a separate autoplay request.
        if (
          audioContext.state ===
          "suspended"
        ) {
          await audioContext.resume();
        }


        const decodedBuffers =
          [];

        for (
          let index = 0;
          index < audioChunks.length;
          index += 1
        ) {
          console.log(
            `Decoding TTS chunk ${index + 1}/${audioChunks.length}`
          );

          const arrayBuffer =
            base64ToArrayBuffer(
              audioChunks[index]
            );

          // .slice(0) gives decodeAudioData its own buffer.
          const decodedBuffer =
            await audioContext.decodeAudioData(
              arrayBuffer.slice(0)
            );

          decodedBuffers.push(
            decodedBuffer
          );
        }


        console.log(
          `Decoded ${decodedBuffers.length}/${audioChunks.length} TTS chunks`
        );


        const completeBuffer =
          concatenateAudioBuffers(
            audioContext,
            decodedBuffers
          );


        console.log(
          `Playing complete TTS response (${completeBuffer.duration.toFixed(1)} seconds)`
        );


        const source =
          audioContext.createBufferSource();

        source.buffer =
          completeBuffer;

        source.connect(
          audioContext.destination
        );

        playbackSourceRef.current =
          source;


        await new Promise(
          (resolve) => {
            source.onended =
              resolve;

            source.start(0);
          }
        );


        console.log(
          "Finished playing complete TTS response"
        );

      } catch (error) {
        console.error(
          "Audio playback failed:",
          error
        );

        alert(
          `Audio playback failed: ${error.message}`
        );

      } finally {
        playbackSourceRef.current =
          null;

        if (playbackContextRef.current) {
          try {
            await playbackContextRef.current.close();
          } catch {
            // Ignore cleanup failure.
          }

          playbackContextRef.current =
            null;
        }

        setPlayingMessageId(
          null
        );
      }
    };


  // --------------------------------------------------
  // CLEAR CHAT
  // --------------------------------------------------

  const clearConversation =
    () => {

      setMessages(
        []
      );

      setTextInput(
        ""
      );

      setStatus(
        "Ready"
      );
    };


  // --------------------------------------------------
  // FORMAT MESSAGE TIME
  // --------------------------------------------------

  const formatTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    return (
      date.toLocaleTimeString(
        [],
        {
          hour:
            "2-digit",

          minute:
            "2-digit",
        }
      )
    );
  };


  return (
    <div className="app-shell">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            Y
          </div>

          <div>
            <h1>
              YesLove
            </h1>

            <p>
              Multilingual Voice Lab
            </p>
          </div>

        </div>


        <div className="side-section">

          <label className="field-label">
            Conversation language
          </label>


          <select
            className="language-select"

            value={
              selectedLanguage
            }

            disabled={
              isRecording ||
              isProcessing
            }

            onChange={
              (event) =>
                setSelectedLanguage(
                  event.target.value
                )
            }
          >

            {LANGUAGES.map(
              (language) => (
                <option
                  key={
                    language.code
                  }

                  value={
                    language.code
                  }
                >
                  {language.flag}
                  {" "}
                  {language.name}
                </option>
              )
            )}

          </select>


          <p className="language-help">
            You can change language
            between messages.
          </p>

        </div>


        <div className="side-section">

          <div className="info-row">
            <span>
              Backend
            </span>

            <strong>
              localhost:5000
            </strong>
          </div>


          <div className="info-row">
            <span>
              ASR
            </span>

            <strong>
              MMS-1B-All
            </strong>
          </div>


          <div className="info-row">
            <span>
              Language
            </span>

            <strong>
              {
                currentLanguage.name
              }
            </strong>
          </div>


          <div className="info-row">
            <span>
              Mode
            </span>

            <strong>
              RAG + Groq LLM POC
            </strong>
          </div>

        </div>


        <button
          className="clear-button"
          onClick={
            clearConversation
          }
        >
          Clear conversation
        </button>


        <div className="privacy-note">
          <span>
            ●
          </span>

          Local development
          environment
        </div>

      </aside>


      {/* ==========================================
          CHAT AREA
      ========================================== */}

      <main className="chat-layout">

        <header className="chat-header">

          <div>

            <h2>
              Multilingual Assistant
            </h2>

            <p>
              Type or speak naturally
              in{" "}
              {
                currentLanguage.name
              }
            </p>

          </div>


          <div
            className={
              `status-pill ${isRecording
                ? "recording"
                : isProcessing
                  ? "processing"
                  : ""
              }`
            }
          >

            <span
              className="status-dot"
            />

            {status}

          </div>

        </header>


        {/* ========================================
            CONVERSATION
        ======================================== */}

        <section className="conversation">

          {
            messages.length === 0
              ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    ♡
                  </div>

                  <h3>
                    How are you feeling today?
                  </h3>

                  <p>
                    Type a message or choose
                    your language and use the
                    microphone.
                  </p>

                  <div className="language-badge">
                    {
                      currentLanguage.flag
                    }
                    {" "}
                    {
                      currentLanguage.name
                    }
                  </div>

                </div>

              )
              : (

                <div className="message-list">

                  {
                    messages.map(
                      (message) => (

                        <div
                          key={
                            message.id
                          }

                          className={
                            `message-row ${message.role}`
                          }
                        >

                          {
                            message.role ===
                            "assistant" && (

                              <div className="assistant-avatar">
                                Y
                              </div>

                            )
                          }


                          <div
                            className={
                              `message-bubble ${message.role}`
                            }
                          >

                            <p>
                              {
                                message.text
                              }
                            </p>


                            <div className="message-meta">

                              <span>
                                {
                                  formatTime(
                                    message.createdAt
                                  )
                                }
                              </span>


                              {
                                message
                                  .inputType ===
                                "voice" && (

                                  <span>
                                    🎙 Voice
                                  </span>

                                )
                              }


                              {
                                message
                                  .audioChunks
                                  ?.length >
                                0 && (

                                  <button
                                    className="audio-button"

                                    disabled={
                                      Boolean(
                                        playingMessageId
                                      )
                                    }

                                    onClick={
                                      () =>
                                        playAssistantAudio(
                                          message.audioChunks,
                                          message.id
                                        )
                                    }
                                  >

                                    {
                                      playingMessageId ===
                                        message.id
                                        ? "🔊 Playing..."
                                        : "🔊 Play"
                                    }

                                  </button>

                                )
                              }

                            </div>

                          </div>

                        </div>

                      )
                    )
                  }


                  {
                    isProcessing && (

                      <div className="message-row assistant">

                        <div className="assistant-avatar">
                          Y
                        </div>

                        <div className="typing-bubble">
                          <span />
                          <span />
                          <span />
                        </div>

                      </div>

                    )
                  }

                </div>

              )
          }


          <div
            ref={
              bottomRef
            }
          />

        </section>


        {/* ========================================
            INPUT AREA
        ======================================== */}

        <footer className="voice-panel">

          {/* TEXT CHAT */}

          <div className="text-chat-row">

            <input
              type="text"

              value={
                textInput
              }

              disabled={
                isProcessing ||
                isRecording
              }

              placeholder={
                `Type a message in ${currentLanguage.name}...`
              }

              onChange={
                (event) =>
                  setTextInput(
                    event.target.value
                  )
              }

              onKeyDown={
                (event) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event
                      .preventDefault();

                    sendTextMessage();
                  }

                }
              }
            />


            <button
              type="button"

              className="send-button"

              disabled={
                isProcessing ||
                isRecording ||
                !textInput.trim()
              }

              onClick={
                sendTextMessage
              }
            >
              Send
            </button>

          </div>


          {/* VOICE INFORMATION */}

          <div className="voice-information">

            <strong>

              {
                isRecording
                  ? "Listening..."
                  : isProcessing
                    ? "Processing your message..."
                    : `Ready for ${currentLanguage.name}`
              }

            </strong>


            <span>

              {
                isRecording
                  ? `${recordingSeconds}s recorded`
                  : "Type a message or use the microphone"
              }

            </span>

          </div>


          {/* MICROPHONE */}

          <button
            className={
              `microphone-button ${isRecording
                ? "recording"
                : ""
              }`
            }

            disabled={
              isProcessing
            }

            onClick={
              isRecording
                ? stopRecording
                : startRecording
            }

            aria-label={
              isRecording
                ? "Stop recording"
                : "Start recording"
            }
          >

            {
              isRecording
                ? "■"
                : "🎙"
            }

          </button>


          {/* SELECTED LANGUAGE */}

          <div className="selected-language">

            <span>
              {
                currentLanguage.flag
              }
            </span>

            <div>

              <small>
                Speaking
              </small>

              <strong>
                {
                  currentLanguage.name
                }
              </strong>

            </div>

          </div>

        </footer>

      </main>

    </div>
  );
}


export default App;
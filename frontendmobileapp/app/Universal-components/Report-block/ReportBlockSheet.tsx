import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  safetyApiFactory,
  type ReportContentType,
  type ReportReason,
} from "@/safety-client-api/api";
import { getApiMessage } from "@/app/store/sagas/sagaHelpers";
import styles from "./ReportBlockSheetStyles";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate", label: "Hate speech" },
  { value: "sexual", label: "Sexual content" },
  { value: "violence", label: "Violence or threats" },
  { value: "self_harm", label: "Self-harm" },
  { value: "spam", label: "Spam or scam" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Something else" },
];

const CONTENT_LABEL: Record<ReportContentType, string> = {
  post: "post",
  comment: "comment",
  message: "message",
  user: "user",
};

type Props = {
  visible: boolean;
  onClose: () => void;
  contentType: ReportContentType;
  // Numeric id of the post/comment/message. For user reports use userKeycloakId.
  contentId?: number;
  userKeycloakId?: string;
  // Keycloak id of the author. Without it the sheet only offers reporting.
  authorId?: string | null;
  authorName?: string;
  onReported?: () => void;
  onBlocked?: () => void;
};

const ReportBlockSheet = ({
  visible,
  onClose,
  contentType,
  contentId,
  userKeycloakId,
  authorId,
  authorName,
  onReported,
  onBlocked,
}: Props) => {
  const [step, setStep] = useState<"menu" | "reasons">("menu");
  const [busy, setBusy] = useState(false);
  const name = authorName || "this user";

  useEffect(() => {
    if (visible) {
      setStep("menu");
      setBusy(false);
    }
  }, [visible]);

  const submitReport = async (reason: ReportReason) => {
    setBusy(true);
    try {
      await safetyApiFactory.report({
        content_type: contentType,
        ...(contentType === "user"
          ? { user_keycloak_id: userKeycloakId }
          : { content_id: contentId }),
        reason,
      });
      onClose();
      Alert.alert("Thanks for letting us know", "Our team will review this report.");
      onReported?.();
    } catch (error) {
      setBusy(false);
      Alert.alert(
        "Couldn't send report",
        getApiMessage(error) || "Please check your connection and try again.",
      );
    }
  };

  const confirmBlock = () => {
    if (!authorId) return;
    Alert.alert(
      `Block ${name}?`,
      `You won't see each other's posts, comments or messages, and any follow between you will be removed. You can unblock ${name} later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await safetyApiFactory.blockUser(authorId);
              onClose();
              onBlocked?.();
            } catch (error) {
              setBusy(false);
              Alert.alert(
                "Couldn't block user",
                getApiMessage(error) || "Please check your connection and try again.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} accessible={false} />
        <View style={styles.sheet}>
          {step === "menu" ? (
            <>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setStep("reasons")}
                accessibilityRole="button"
                accessibilityLabel={`Report this ${CONTENT_LABEL[contentType]}`}
              >
                <Ionicons name="flag-outline" size={22} style={styles.rowIcon} />
                <Text style={styles.rowText}>Report this {CONTENT_LABEL[contentType]}</Text>
              </TouchableOpacity>
              {!!authorId && (
                <TouchableOpacity
                  style={styles.row}
                  onPress={confirmBlock}
                  accessibilityRole="button"
                  accessibilityLabel={`Block ${name}`}
                >
                  <Ionicons name="ban-outline" size={22} style={styles.dangerIcon} />
                  <Text style={styles.dangerText}>Block {name}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.cancelRow}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.reasonHeader}>
                <TouchableOpacity
                  onPress={() => setStep("menu")}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                >
                  <Ionicons name="chevron-back" size={24} style={styles.rowIcon} />
                </TouchableOpacity>
                <Text style={styles.reasonTitle}>Why are you reporting this?</Text>
                <View style={{ width: 24 }} />
              </View>
              {busy && <ActivityIndicator style={styles.spinner} />}
              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={styles.row}
                  disabled={busy}
                  onPress={() => submitReport(reason.value)}
                  accessibilityRole="button"
                  accessibilityLabel={reason.label}
                >
                  <Text style={styles.rowText}>{reason.label}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.footnote}>
                If someone is in immediate danger, call 999.
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReportBlockSheet;

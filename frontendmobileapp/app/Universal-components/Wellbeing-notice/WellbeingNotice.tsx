import React, { useEffect, useState } from "react";
import { Linking, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import styles from "./WellbeingNoticeStyles";

type Resource = { name: string; detail: string; action: string; url: string };

// UK services. Numbers are the published public ones; keep this list short and
// check it periodically.
const RESOURCES: Resource[] = [
  {
    name: "Emergency services",
    detail: "If you or someone else is in immediate danger",
    action: "Call 999",
    url: "tel:999",
  },
  {
    name: "Samaritans",
    detail: "Free, confidential listening, 24 hours a day",
    action: "Call 116 123",
    url: "tel:116123",
  },
  {
    name: "Shout",
    detail: "Free 24/7 crisis text support",
    action: "Text SHOUT to 85258",
    url: "sms:85258?body=SHOUT",
  },
  {
    name: "National Domestic Abuse Helpline",
    detail: "Free, 24 hours a day (Refuge)",
    action: "Call 0808 2000 247",
    url: "tel:08082000247",
  },
  {
    name: "NHS 111",
    detail: "Urgent medical help that is not life-threatening",
    action: "Call 111",
    url: "tel:111",
  },
];

type Props = {
  assistantName?: string;
  // Increment to open the resources sheet programmatically (e.g. on crisis language).
  openSignal?: number;
};

const WellbeingNotice = ({ assistantName = "This assistant", openSignal = 0 }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (openSignal > 0) {
      setVisible(true);
    }
  }, [openSignal]);

  return (
    <>
      <TouchableOpacity
        style={styles.banner}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Notice: this is an AI assistant, not medical or therapy advice. Open crisis support options."
      >
        <Ionicons name="information-circle-outline" size={18} style={styles.bannerIcon} />
        <Text style={styles.bannerText}>
          {assistantName} is an AI, not medical or therapy advice.{" "}
          <Text style={styles.bannerLink}>Need urgent help?</Text>
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>If you need urgent support</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={24} style={styles.bannerIcon} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetIntro}>
              {assistantName} is an AI. It can share information from YesLove, but it is not a
              doctor, counsellor or therapist and cannot assess your situation. If you are in
              danger or thinking about harming yourself, please contact one of these services.
            </Text>
            <ScrollView>
              {RESOURCES.map((resource) => (
                <TouchableOpacity
                  key={resource.name}
                  style={styles.resourceRow}
                  onPress={() => Linking.openURL(resource.url).catch(() => undefined)}
                  accessibilityRole="button"
                  accessibilityLabel={`${resource.name}. ${resource.action}`}
                >
                  <View style={styles.resourceText}>
                    <Text style={styles.resourceName}>{resource.name}</Text>
                    <Text style={styles.resourceDetail}>{resource.detail}</Text>
                  </View>
                  <Text style={styles.resourceAction}>{resource.action}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default WellbeingNotice;

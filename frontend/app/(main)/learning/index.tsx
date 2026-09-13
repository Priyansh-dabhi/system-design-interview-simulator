import { useRouter } from "expo-router";
import { BookOpen, CaretLeft, CheckCircle, Lock } from "phosphor-react-native";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetTopicsQuery } from "../../../src/redux/api/learning_api";
import { useTheme } from "../../../src/theme/useTheme";

export default function LearningHome() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data, isLoading, error } = useGetTopicsQuery();

  const handleTopicPress = (slug: string) => {
    router.push(`/(main)/learning/topic/${slug}` as any);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: insets.top + 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      fontFamily: "Inter-Bold",
    },
    content: {
      padding: 16,
    },
    topicCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    topicIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 16,
    },
    topicInfo: {
      flex: 1,
    },
    topicTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      fontFamily: "Inter-SemiBold",
      marginBottom: 4,
    },
    topicDescription: {
      fontSize: 14,
      color: colors.textDim,
      fontFamily: "Inter-Regular",
    },
    progressContainer: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    progressBarBackground: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginRight: 12,
    },
    progressBarFill: {
      height: 6,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      color: colors.textDim,
      fontFamily: "Inter-Medium",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <CaretLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>System Design Course</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {data?.topics?.map((topic: any, index: number) => {
          const isCompleted = topic.progress?.completed;
          const progressPercentage = topic.progress?.progress || 0;
          const isLocked = index > 0 && !data.topics[index - 1].progress?.completed;

          return (
            <Pressable
              key={topic.id}
              style={[styles.topicCard, isLocked && { opacity: 0.6 }]}
              onPress={() => !isLocked && handleTopicPress(topic.slug)}
            >
              <View style={styles.topicIconContainer}>
                {isCompleted ? (
                  <CheckCircle size={24} color={colors.success || "#10B981"} weight="fill" />
                ) : isLocked ? (
                  <Lock size={24} color={colors.textDim} />
                ) : (
                  <BookOpen size={24} color={colors.primary} />
                )}
              </View>

              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription} numberOfLines={2}>
                  {topic.description}
                </Text>

                {(!isLocked || progressPercentage > 0) && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{progressPercentage}%</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, PlayCircle, CheckCircle, Robot } from "phosphor-react-native";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetTopicLessonsQuery } from "../../../../src/redux/api/learning_api";
import { useTheme } from "../../../../src/theme/useTheme";
import { useDispatch } from "react-redux";
import { setSelectedTopic } from "../../../../src/redux/slices/problem";

export default function TopicScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  const { data, isLoading } = useGetTopicLessonsQuery(slug);

  const handleLessonPress = (id: number) => {
    router.push(`/(main)/learning/lesson/${id}` as any);
  };

  const handlePracticePress = () => {
    if (data?.topic) {
      dispatch(setSelectedTopic({ id: data.topic.slug, title: data.topic.title }));
      router.push("/(interview)/setup");
    }
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
      flex: 1,
    },
    content: {
      padding: 16,
    },
    descriptionContainer: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topicTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 8,
    },
    topicDescription: {
      fontSize: 15,
      color: colors.textDim,
      fontFamily: "Inter-Regular",
      lineHeight: 22,
    },
    lessonsTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      fontFamily: "Inter-SemiBold",
      marginBottom: 16,
    },
    lessonCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    lessonIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    lessonInfo: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    lessonMeta: {
      fontSize: 13,
      color: colors.textDim,
      fontFamily: "Inter-Regular",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    practiceButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      marginTop: 24,
      marginBottom: 32,
    },
    practiceButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
      marginLeft: 8,
    }
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const topic = data?.topic;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <CaretLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {topic?.title || "Topic"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.topicTitle}>{topic?.title}</Text>
          <Text style={styles.topicDescription}>{topic?.description}</Text>
        </View>

        <Text style={styles.lessonsTitle}>Lessons</Text>

        {topic?.lessons?.map((lesson: any, index: number) => {
          const isCompleted = lesson.attempts && lesson.attempts.length > 0;

          return (
            <Pressable
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => handleLessonPress(lesson.id)}
            >
              <View style={styles.lessonIconContainer}>
                {isCompleted ? (
                  <CheckCircle size={20} color={colors.success || "#10B981"} weight="fill" />
                ) : (
                  <PlayCircle size={20} color={colors.primary} />
                )}
              </View>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>
                  {index + 1}. {lesson.title}
                </Text>
                <Text style={styles.lessonMeta}>
                  {lesson.estimatedMinutes} min read
                </Text>
              </View>
            </Pressable>
          );
        })}

        <Pressable style={styles.practiceButton} onPress={handlePracticePress}>
          <Robot size={24} color="#FFF" weight="fill" />
          <Text style={styles.practiceButtonText}>Practice Interview on this Topic</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

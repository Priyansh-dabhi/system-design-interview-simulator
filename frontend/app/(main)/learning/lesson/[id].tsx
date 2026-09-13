import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, PlayCircle } from "phosphor-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import Markdown from 'react-native-markdown-display';
import { useGetLessonDetailQuery, useCompleteLessonQuizMutation } from "../../../../src/redux/api/learning_api";
import { useTheme } from "../../../../src/theme/useTheme";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id, 10);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data, isLoading } = useGetLessonDetailQuery(lessonId);
  const [completeLesson] = useCompleteLessonQuizMutation();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const lesson = data?.lesson;

  const handleOptionSelect = (questionId: number, optionId: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!lesson || !lesson.questions) return;
    
    // Check if all answered
    if (Object.keys(selectedAnswers).length < lesson.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setShowResults(true);

    let correctCount = 0;
    lesson.questions.forEach((q: any) => {
      const selectedOptionId = selectedAnswers[q.id];
      const selectedOption = q.options.find((o: any) => o.id === selectedOptionId);
      if (selectedOption?.isCorrect) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / lesson.questions.length) * 100);

    try {
      await completeLesson({
        lessonId,
        topicId: lesson.topicId,
        score,
        totalQuestions: lesson.questions.length,
        correctAnswers: correctCount,
      }).unwrap();
    } catch (e) {
      console.error("Failed to complete lesson", e);
    }
  };

  const handleContinue = () => {
    router.back();
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
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      fontFamily: "Inter-Bold",
      flex: 1,
    },
    content: {
      paddingBottom: 40,
    },
    videoContainer: {
      width: "100%",
      backgroundColor: "#000",
      aspectRatio: 16 / 9,
    },
    textContent: {
      padding: 16,
    },
    quizSection: {
      padding: 16,
      marginTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    quizTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      fontFamily: "Inter-Bold",
      marginBottom: 16,
    },
    questionContainer: {
      marginBottom: 24,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    questionText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    optionButton: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      backgroundColor: colors.background,
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}20`,
    },
    optionCorrect: {
      borderColor: colors.success || "#10B981",
      backgroundColor: `${colors.success || "#10B981"}20`,
    },
    optionWrong: {
      borderColor: colors.error || "#EF4444",
      backgroundColor: `${colors.error || "#EF4444"}20`,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: "Inter-Medium",
    },
    explanationText: {
      marginTop: 8,
      fontSize: 13,
      color: colors.textDim,
      fontFamily: "Inter-Regular",
      fontStyle: "italic",
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },
    submitButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  const markdownStyles = StyleSheet.create({
    body: {
      color: colors.text,
      fontFamily: "Inter-Regular",
      fontSize: 15,
      lineHeight: 24,
    },
    heading1: {
      color: colors.text,
      fontFamily: "Inter-Bold",
      fontSize: 24,
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      color: colors.text,
      fontFamily: "Inter-SemiBold",
      fontSize: 20,
      marginTop: 16,
      marginBottom: 8,
    },
    paragraph: {
      marginBottom: 12,
    }
  });

  if (isLoading || !lesson) {
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
        <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {lesson.youtubeVideoId && (
          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={220}
              play={false}
              videoId={lesson.youtubeVideoId}
            />
          </View>
        )}

        <View style={styles.textContent}>
          <Markdown style={markdownStyles}>
            {lesson.content}
          </Markdown>
        </View>

        {lesson.questions && lesson.questions.length > 0 && (
          <View style={styles.quizSection}>
            <Text style={styles.quizTitle}>Knowledge Check</Text>
            
            {lesson.questions.map((q: any, index: number) => {
              const selectedOptionId = selectedAnswers[q.id];
              const isAnswered = selectedOptionId !== undefined;

              return (
                <View key={q.id} style={styles.questionContainer}>
                  <Text style={styles.questionText}>{index + 1}. {q.question}</Text>
                  
                  {q.options.map((option: any) => {
                    const isSelected = selectedOptionId === option.id;
                    
                    let optionStyle: any[] = [styles.optionButton];
                    if (isSelected && !showResults) optionStyle.push(styles.optionSelected);
                    if (showResults && option.isCorrect) optionStyle.push(styles.optionCorrect);
                    if (showResults && isSelected && !option.isCorrect) optionStyle.push(styles.optionWrong);

                    return (
                      <Pressable 
                        key={option.id}
                        style={optionStyle}
                        onPress={() => handleOptionSelect(q.id, option.id)}
                      >
                        <Text style={styles.optionText}>{option.text}</Text>
                      </Pressable>
                    );
                  })}

                  {showResults && (
                    <Text style={styles.explanationText}>{q.explanation}</Text>
                  )}
                </View>
              );
            })}

            {!showResults ? (
              <Pressable style={styles.submitButton} onPress={handleSubmitQuiz}>
                <Text style={styles.submitButtonText}>Submit Quiz</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.submitButton} onPress={handleContinue}>
                <Text style={styles.submitButtonText}>Continue Learning</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

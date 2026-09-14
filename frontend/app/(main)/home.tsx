import { useGetTopicsQuery } from '@/src/redux/api/learning_api';
import { useAppSelector } from '@/src/redux/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  CaretRight,
  CheckCircle,
  GraduationCap,
  Lightning,
  Microphone,
  Play,
  PlayCircle,
  Sparkle,
} from 'phosphor-react-native';

import RBSheet from 'react-native-raw-bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/useTheme';

// Core 4-Step System Design Interview Framework
interface FrameworkStep {
  step: string;
  title: string;
  timing: string;
  summary: string;
  checklists: string[];
}

const FRAMEWORK_STEPS: FrameworkStep[] = [
  {
    step: '01',
    title: 'Scope & Estimations',
    timing: '5-8 mins',
    summary: 'Establish boundary conditions, clarify functional features, and calculate back-of-the-envelope scale.',
    checklists: [
      'Ask clarifying questions about target users & out-of-scope requirements',
      'Determine scale: Daily Active Users (DAU), read/write operations per second',
      'Estimate network bandwidth, RAM caching volume, and 5-year persistent storage',
      'Agree on non-functional constraints: Latency (<100ms), High Availability (99.99%)',
    ],
  },
  {
    step: '02',
    title: 'High-Level Architecture',
    timing: '10-15 mins',
    summary: 'Construct end-to-end component topology, define API signatures, and select database paradigms.',
    checklists: [
      'Draft core API endpoints with request payloads and response contracts',
      'Map client traffic path: DNS -> CDN -> Global Load Balancer -> API Gateway',
      'Select appropriate database paradigm (Relational vs Key-Value vs Document vs Time-Series)',
      'Define stateless application service boundaries and auth token validation',
    ],
  },
  {
    step: '03',
    title: 'Deep Dive & Data Flow',
    timing: '15-20 mins',
    summary: 'Detail table schemas, caching strategies, message queues, and end-to-end data pipelines.',
    checklists: [
      'Design concrete relational or document schemas with primary & foreign keys',
      'Position caching layers: Redis Cache-Aside or Write-Through with TTL policies',
      'Integrate message queues (Kafka / SQS) for asynchronous write decoupling',
      'Trace request lifecycle step-by-step for the most critical read and write flows',
    ],
  },
  {
    step: '04',
    title: 'Bottlenecks & Trade-offs',
    timing: '10 mins',
    summary: 'Identify single points of failure, horizontal database sharding, and defend architectural compromises.',
    checklists: [
      'Eliminate Single Points of Failure (SPOF) with active-passive multi-region failover',
      'Database scaling: Choose partition keys and consistent hashing to prevent hot spots',
      'Articulate trade-offs explicitly: Availability vs Consistency (CAP theorem)',
      'Incorporate rate limiting, circuit breakers, and graceful degradation strategies',
    ],
  },
];

// Fallback Learning Curriculum Topics
interface LearningTopicItem {
  id: number;
  title: string;
  description: string;
  slug: string;
  totalLessons: number;
  progress: {
    completed: boolean;
    progress: number;
  };
}

const DEFAULT_LEARNING_TOPICS: LearningTopicItem[] = [
  {
    id: 1,
    title: 'System Design Fundamentals',
    description: 'Core concepts for designing large-scale distributed systems.',
    slug: 'system-design-fundamentals',
    totalLessons: 2,
    progress: { completed: false, progress: 0 },
  },
  {
    id: 2,
    title: 'Horizontal vs Vertical Scaling',
    description: 'Master scaling strategies, bottlenecks, and stateful vs stateless architectures.',
    slug: 'scaling-strategies',
    totalLessons: 2,
    progress: { completed: false, progress: 0 },
  },
  {
    id: 3,
    title: 'Load Balancing & Reverse Proxies',
    description: 'Traffic distribution, health checks, Layer 4 vs Layer 7 routing.',
    slug: 'load-balancing',
    totalLessons: 2,
    progress: { completed: false, progress: 0 },
  },
  {
    id: 4,
    title: 'Caching & Content Delivery (CDN)',
    description: 'Cache invalidation, eviction strategies, Redis, and edge computing.',
    slug: 'caching-and-cdn',
    totalLessons: 2,
    progress: { completed: false, progress: 0 },
  },
  {
    id: 5,
    title: 'Database Sharding & Replication',
    description: 'CAP theorem, ACID vs BASE, partition keys, and replication lag.',
    slug: 'databases-and-sharding',
    totalLessons: 2,
    progress: { completed: false, progress: 0 },
  },
  {
    id: 6,
    title: 'Microservices & Message Queues',
    description: 'Asynchronous event streaming, Kafka, RabbitMQ, and saga patterns.',
    slug: 'microservices-and-queues',
    totalLessons: 2,
    progress: { completed: false, progress: 0 },
  },
];

// Senior Interviewer Principles / Daily Tips
const ARCHITECTURAL_TIPS = [
  'Never jump straight into choosing a database before clarifying read-to-write ratios, throughput, and query access patterns.',
  'In distributed systems, always state your CAP theorem trade-off explicitly (e.g. choosing AP over CP for 99.99% availability).',
  'A single point of failure is not just databases—always evaluate your load balancers, DNS, and third-party auth services.',
  'Cache invalidation is hard: prefer Cache-Aside with sensible TTLs over complex distributed cache synchronizations.',
  'When estimating scale, round conservatively to powers of 10: 1 million requests/day ≈ 12 QPS (assume 2-3x peak).',
];

export default function HomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: learningData } = useGetTopicsQuery();

  const [selectedFrameworkStep, setSelectedFrameworkStep] = useState<FrameworkStep | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const frameworkSheetRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedFrameworkStep) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      frameworkSheetRef.current?.close();
      return true;
    });
    return () => subscription.remove();
  }, [selectedFrameworkStep]);

  const topics = useMemo(() => {
    if (learningData?.topics && learningData.topics.length > 0) {
      return learningData.topics;
    }
    return DEFAULT_LEARNING_TOPICS;
  }, [learningData?.topics]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  const handleStartSimulation = () => {
    router.push('/(interview)/problem-selection' as any);
  };

  const handleCycleTip = () => {
    setTipIndex((prev) => (prev + 1) % ARCHITECTURAL_TIPS.length);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[styles.userNameText, { color: colors.text }]}>
            {user?.fullName || 'Engineer'} 👋
          </Text>
          <View style={styles.rolePill}>
            <View style={styles.statusDot} />
            <Text style={[styles.rolePillText, { color: colors.textSecondary }]}>
              Target: Senior SWE Prep
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Signature Primary CTA: Reimagined Live Interview Simulation Hub */}
        <LinearGradient
          colors={['#2563EB', '#1E3A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.readyBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.readyBadgeText}>SIMULATION READY</Text>
            </View>
            <View style={styles.voiceIndicator}>
              <Microphone size={14} color="#FFFFFF" />
              <Text style={styles.voiceIndicatorText}>Audio Supported</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Live System Design Simulation</Text>
          <Text style={styles.heroSubtitle}>
            Practice real-time architectural decision-making, trade-off articulation, and scalability with an adaptive AI interviewer.
          </Text>

          {/* Feature Highlights Row */}
          <View style={styles.heroChipsRow}>
            <View style={styles.heroChip}>
              <Lightning size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.heroChipText}>Adaptive Questions</Text>
            </View>
            <View style={styles.heroChip}>
              <CheckCircle size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.heroChipText}>5 Evaluation Stages</Text>
            </View>
          </View>

          <Pressable
            onPress={handleStartSimulation}
            style={({ pressed }) => [
              styles.startSimulationBtn,
              { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
            ]}
          >
            <Play size={16} color="#1D4ED8" weight="fill" />
            <Text style={styles.startSimulationBtnText}>Start Mock Interview</Text>
          </Pressable>
        </LinearGradient>


        {/* 4-Step System Design Interview Framework */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Interview Framework</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                The 4-stage methodology expected by FAANG interviewers
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.frameworkScroll}>
            {FRAMEWORK_STEPS.map((step) => (
              <TouchableOpacity
                key={step.step}
                activeOpacity={0.75}
                onPress={() => {
                  setSelectedFrameworkStep(step);
                  requestAnimationFrame(() => {
                    frameworkSheetRef.current?.open();
                  });
                }}
                style={[
                  styles.frameworkCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.frameworkCardTop}>
                  <Text style={styles.frameworkStepNumber}>{step.step}</Text>
                  <View style={[styles.timingBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.timingBadgeText, { color: colors.textSecondary }]}>{step.timing}</Text>
                  </View>
                </View>
                <Text style={[styles.frameworkCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {step.title}
                </Text>
                <Text style={[styles.frameworkCardSummary, { color: colors.textSecondary }]} numberOfLines={2}>
                  {step.summary}
                </Text>
                <View style={styles.frameworkCardFooter}>
                  <Text style={[styles.viewChecklistText, { color: colors.primary }]}>View Checklist</Text>
                  <CaretRight size={13} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Learning Curriculum Modules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Modules</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Guided video lessons & scenario quizzes for real-world mastery
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(main)/learning' as any)}
              style={styles.seeAllButton}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
              <CaretRight size={14} color={colors.primary} />
            </Pressable>
          </View>

          {/* Interactive Topic Modules Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.learningTopicsScroll}
          >
            {topics.map((topic: any, index: number) => {
              const isCompleted = topic.progress?.completed;
              const progressPercentage = topic.progress?.progress || 0;

              return (
                <TouchableOpacity
                  key={topic.id || index}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/(main)/learning/topic/${topic.slug}` as any)}
                  style={[
                    styles.learningTopicCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.learningCardTop}>
                    <View
                      style={[
                        styles.learningBadge,
                        { backgroundColor: colors.background, borderColor: colors.border },
                      ]}
                    >
                      <BookOpen size={12} color={colors.primary} />
                      <Text style={[styles.learningBadgeText, { color: colors.textSecondary }]}>
                        {topic.totalLessons || 2} Lessons
                      </Text>
                    </View>
                    {isCompleted ? (
                      <View style={styles.completedBadge}>
                        <CheckCircle size={14} color="#10B981" weight="fill" />
                        <Text style={styles.completedBadgeText}>Done</Text>
                      </View>
                    ) : (
                      <View style={styles.topicStepBox}>
                        <Text style={styles.topicStepNumber}>{String(index + 1).padStart(2, '0')}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.learningCardBody}>
                    <Text style={[styles.learningTopicTitle, { color: colors.text }]} numberOfLines={2}>
                      {topic.title}
                    </Text>
                    <Text
                      style={[styles.learningTopicDesc, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {topic.description}
                    </Text>
                  </View>

                  {/* Progress Indicator */}
                  <View style={styles.learningCardProgress}>
                    <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${isCompleted ? 100 : progressPercentage}%`,
                            backgroundColor: isCompleted ? '#10B981' : colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.learningCardFooter}>
                    <Text style={[styles.learningActionText, { color: colors.primary }]}>
                      {isCompleted ? 'Review Topic' : progressPercentage > 0 ? `${progressPercentage}% finished` : 'Start Learning'}
                    </Text>
                    <View style={[styles.learningPlayBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.1)' }]}>
                      <Play size={11} color={colors.primary} weight="fill" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Curriculum Pathway Feature Highlight Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(main)/learning' as any)}
            style={[
              styles.curriculumPathwayCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.pathwayHeader}>
              <View style={[styles.pathwayIconContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)' }]}>
                <GraduationCap size={22} color={colors.primary} weight="fill" />
              </View>
              <View style={styles.pathwayTitleContainer}>
                <View style={styles.pathwayBadgeRow}>
                  <Text style={styles.pathwayBadgeText}>STRUCTURED PATH</Text>
                </View>
                <Text style={[styles.pathwayTitle, { color: colors.text }]}>
                  Comprehensive System Design Course
                </Text>
              </View>
            </View>

            <Text style={[styles.pathwaySubtitle, { color: colors.textSecondary }]}>
              Deep dive into scaling, caching, sharding, and messaging with verified FAANG-level video breakdowns & interactive quizzes.
            </Text>

            <View style={styles.pathwayPillsRow}>
              <View style={[styles.pathwayPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <PlayCircle size={12} color={colors.primary} weight="fill" />
                <Text style={[styles.pathwayPillText, { color: colors.textSecondary }]}>Video Lessons</Text>
              </View>
              <View style={[styles.pathwayPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <BookOpen size={12} color={colors.primary} weight="fill" />
                <Text style={[styles.pathwayPillText, { color: colors.textSecondary }]}>Technical Notes</Text>
              </View>
              <View style={[styles.pathwayPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <CheckCircle size={12} color="#10B981" weight="fill" />
                <Text style={[styles.pathwayPillText, { color: colors.textSecondary }]}>Quizzes</Text>
              </View>
            </View>

            <View style={styles.pathwayFooter}>
              <Text style={[styles.pathwayActionText, { color: colors.primary }]}>Explore Full Curriculum</Text>
              <ArrowRight size={14} color={colors.primary} weight="bold" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Architectural Principle / Tip of the Day */}
        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tipHeader}>
            <View style={styles.tipLabelRow}>
              <Sparkle size={16} color="#F59E0B" weight="fill" />
              <Text style={styles.tipLabel}>ARCHITECTURAL PRINCIPLE</Text>
            </View>
            <TouchableOpacity onPress={handleCycleTip} hitSlop={8}>
              <Text style={[styles.nextTipBtnText, { color: colors.primary }]}>Next Tip</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.tipContentText, { color: colors.text }]}>
            {`"${ARCHITECTURAL_TIPS[tipIndex]}"`}
          </Text>
        </View>
      </ScrollView>

      {/* Framework Checklist Instagram-Style Bottom Sheet */}
      <RBSheet
        ref={frameworkSheetRef}
        height={Dimensions.get('window').height * 0.94}
        draggable={true}
        closeOnPressMask={true}
        closeOnPressBack={true}
        onClose={() => setSelectedFrameworkStep(null)}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.65)'
          },
          draggableIcon: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
            width: 42,
            height: 4.5,
            borderRadius: 3,
            marginTop: 10,
          },
          container: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 1,
            borderColor: colors.border,
            paddingTop: insets.top || 10,
          }
        }}
      >
        <View style={styles.sheetHeader}>
          <View style={styles.modalHeaderLeft}>
            <Text style={styles.modalStepBadge}>STAGE {selectedFrameworkStep?.step}</Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedFrameworkStep?.title}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.sheetScrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.modalSummary, { color: colors.textSecondary }]}>
            {selectedFrameworkStep?.summary}
          </Text>

          <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

          <Text style={[styles.checklistSectionTitle, { color: colors.text }]}>
            What Interviewers Look For:
          </Text>

          <View style={styles.checklistItemsList}>
            {selectedFrameworkStep?.checklists.map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <CheckCircle size={16} color="#10B981" weight="fill" style={{ marginTop: 2 }} />
                <Text style={[styles.checklistItemText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              frameworkSheetRef.current?.close();
              handleStartSimulation();
            }}
            style={styles.modalActionBtn}
          >
            <Text style={styles.modalActionBtnText}>Practice This Framework</Text>
          </TouchableOpacity>
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 24,
  },
  // Reimagined Blue Gradient Hero
  heroCard: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  readyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  voiceIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: '#DBEAFE',
    fontSize: 13,
    lineHeight: 18,
    marginTop: -2,
  },
  heroChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroChipText: {
    color: '#EFF6FF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  learningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  learningIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  learningBannerContent: {
    flex: 1,
    marginRight: 12,
  },
  learningBannerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  learningBannerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  startSimulationBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  startSimulationBtnText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '700',
  },
  // Section Headers
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // 4-Step Framework
  frameworkScroll: {
    gap: 12,
    paddingRight: 8,
  },
  frameworkCard: {
    width: 220,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  frameworkCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frameworkStepNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3B82F6',
  },
  timingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  timingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  frameworkCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  frameworkCardSummary: {
    fontSize: 11,
    lineHeight: 15,
  },
  frameworkCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  viewChecklistText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Learning Section
  learningTopicsScroll: {
    gap: 12,
    paddingRight: 8,
  },
  learningTopicCard: {
    width: 230,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  learningCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  learningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  learningBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  topicStepBox: {
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  topicStepNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  learningCardBody: {
    marginVertical: 8,
    gap: 4,
  },
  learningTopicTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  learningTopicDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  learningCardProgress: {
    marginVertical: 4,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  learningCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  learningActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  learningPlayBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pathway Highlight Card
  curriculumPathwayCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginTop: 14,
    gap: 10,
  },
  pathwayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pathwayIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathwayTitleContainer: {
    flex: 1,
    gap: 2,
  },
  pathwayBadgeRow: {
    flexDirection: 'row',
  },
  pathwayBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 0.8,
  },
  pathwayTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pathwaySubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  pathwayPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  pathwayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  pathwayPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pathwayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  pathwayActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Tip Card
  tipCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#F59E0B',
  },
  nextTipBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipContentText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  // Bottom Sheet Styles
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 14,
  },
  modalHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  modalStepBadge: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSummary: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalDivider: {
    height: 1,
    width: '100%',
  },
  checklistSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  checklistItemsList: {
    gap: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checklistItemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

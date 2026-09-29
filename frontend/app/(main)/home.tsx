import { useGetTopicsQuery } from '@/src/redux/api/learning_api';
import { useAppSelector } from '@/src/redux/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  CaretRight,
  CheckCircle,
  Clock,
  Lightning,
  Microphone,
  Play,
  Sparkle,
} from 'phosphor-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/useTheme';

// 4-Stage System Design Interview Framework
interface FrameworkStep {
  step: string;
  title: string;
  shortTitle: string;
  timing: string;
  summary: string;
  checklists: string[];
}

const FRAMEWORK_STEPS: FrameworkStep[] = [
  {
    step: '01',
    title: 'Scope & Estimations',
    shortTitle: 'Scope',
    timing: '5-8 mins',
    summary: 'Clarify requirements, define core features, and calculate back-of-the-envelope scale.',
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
    shortTitle: 'Architecture',
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
    shortTitle: 'Deep Dive',
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
    shortTitle: 'Trade-offs',
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

  // Pick the current active topic (first in-progress or first uncompleted topic)
  const activeTopic = useMemo(() => {
    const inProgress = topics.find(
      (t: any) => t.progress && !t.progress.completed && (t.progress.progress || 0) > 0
    );
    if (inProgress) return inProgress;
    const uncompleted = topics.find((t: any) => !t.progress?.completed);
    return uncompleted || topics[0] || DEFAULT_LEARNING_TOPICS[0];
  }, [topics]);

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
      {/* 1. Header: Clean, Minimalist Candidate Info */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[styles.userNameText, { color: colors.text }]}>
            {user?.fullName || 'Engineer'} 👋
          </Text>
        </View>
        <View style={[styles.targetPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statusDot} />
          <Text style={[styles.targetPillText, { color: colors.textSecondary }]}>
            Senior SWE Prep
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Hub: Focused Launchpad without Text Walls */}
        <LinearGradient
          colors={['#1D4ED8', '#1E3A8A', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.readyBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.readyBadgeText}>SIMULATION READY</Text>
            </View>
            <View style={styles.audioBadge}>
              <Microphone size={12} color="#FFFFFF" />
              <Text style={styles.audioBadgeText}>Voice Input</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Live System Design Interview</Text>
          <Text style={styles.heroSubtitle}>
            Adaptive AI interviewer calibrated for FAANG & senior engineering standards.
          </Text>

          {/* Quick Metrics Bar */}
          <View style={styles.heroSpecsRow}>
            <View style={styles.heroSpecItem}>
              <Lightning size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.heroSpecText}>Real-Time Feedback</Text>
            </View>
            <View style={styles.heroSpecDivider} />
            <View style={styles.heroSpecItem}>
              <Clock size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.heroSpecText}>30-45 Mins</Text>
            </View>
            <View style={styles.heroSpecDivider} />
            <View style={styles.heroSpecItem}>
              <CheckCircle size={12} color="#93C5FD" weight="fill" />
              <Text style={styles.heroSpecText}>5 Rubric Stages</Text>
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

        {/* 3. 4-Stage Interview Framework: Streamlined Interactive Stepper */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Interview Framework</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Tap any stage to review expectations
            </Text>
          </View>

          {/* Compact 4-Step Stepper Cards */}
          <View style={styles.frameworkGrid}>
            {FRAMEWORK_STEPS.map((step) => (
              <TouchableOpacity
                key={step.step}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedFrameworkStep(step);
                  requestAnimationFrame(() => {
                    frameworkSheetRef.current?.open();
                  });
                }}
                style={[
                  styles.frameworkStepCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.frameworkStepTop}>
                  <Text style={styles.frameworkStepNum}>{step.step}</Text>
                  <Text style={[styles.frameworkStepTiming, { color: colors.textSecondary }]}>
                    {step.timing}
                  </Text>
                </View>
                <Text style={[styles.frameworkStepTitle, { color: colors.text }]} numberOfLines={1}>
                  {step.shortTitle}
                </Text>
                <View style={styles.frameworkStepAction}>
                  <Text style={[styles.frameworkStepActionText, { color: colors.primary }]}>
                    Checklist
                  </Text>
                  <CaretRight size={11} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Active Learning Focus (Zero Duplication with Learn Tab) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Up Next</Text>
            <Pressable
              onPress={() => router.push('/(main)/learning' as any)}
              style={styles.seeAllButton}
              hitSlop={8}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>View All in Learn</Text>
              <CaretRight size={13} color={colors.primary} />
            </Pressable>
          </View>

          {/* Single Focused Topic Card */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push(`/(main)/learning/topic/${activeTopic.slug}` as any)}
            style={[
              styles.activeFocusCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.activeFocusTop}>
              <View style={[styles.lessonBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <BookOpen size={12} color={colors.primary} />
                <Text style={[styles.lessonBadgeText, { color: colors.textSecondary }]}>
                  {activeTopic.totalLessons || 2} Lessons
                </Text>
              </View>
              {activeTopic.progress?.completed ? (
                <View style={styles.completedBadge}>
                  <CheckCircle size={13} color="#10B981" weight="fill" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              ) : (
                <Text style={[styles.progressStatusText, { color: colors.textSecondary }]}>
                  {activeTopic.progress?.progress ? `${activeTopic.progress.progress}% finished` : 'Recommended'}
                </Text>
              )}
            </View>

            <Text style={[styles.activeFocusTitle, { color: colors.text }]} numberOfLines={1}>
              {activeTopic.title}
            </Text>
            <Text style={[styles.activeFocusDesc, { color: colors.textSecondary }]} numberOfLines={1}>
              {activeTopic.description}
            </Text>

            {/* Progress Track */}
            <View style={[styles.focusProgressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
              <View
                style={[
                  styles.focusProgressFill,
                  {
                    width: `${activeTopic.progress?.completed ? 100 : activeTopic.progress?.progress || 0}%`,
                    backgroundColor: activeTopic.progress?.completed ? '#10B981' : colors.primary,
                  },
                ]}
              />
            </View>

            <View style={styles.activeFocusFooter}>
              <Text style={[styles.activeFocusAction, { color: colors.primary }]}>
                {activeTopic.progress?.completed
                  ? 'Review Topic'
                  : activeTopic.progress?.progress
                  ? 'Resume Lesson'
                  : 'Start Lesson'}
              </Text>
              <View style={[styles.playPill, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.1)' }]}>
                <Play size={10} color={colors.primary} weight="fill" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Senior Architectural Principle (Compact Daily Insight) */}
        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tipHeader}>
            <View style={styles.tipLabelRow}>
              <Sparkle size={15} color="#F59E0B" weight="fill" />
              <Text style={styles.tipLabel}>ARCHITECTURAL PRINCIPLE</Text>
            </View>
            <TouchableOpacity onPress={handleCycleTip} hitSlop={10}>
              <Text style={[styles.nextTipBtnText, { color: colors.primary }]}>Next Tip</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.tipContentText, { color: colors.text }]}>
            {`"${ARCHITECTURAL_TIPS[tipIndex]}"`}
          </Text>
        </View>
      </ScrollView>

      {/* Framework Checklist Bottom Sheet */}
      <RBSheet
        ref={frameworkSheetRef}
        height={Dimensions.get('window').height * 0.88}
        draggable={true}
        closeOnPressMask={true}
        closeOnPressBack={true}
        onClose={() => setSelectedFrameworkStep(null)}
        customStyles={{
          wrapper: {
            backgroundColor: 'rgba(0,0,0,0.65)',
          },
          draggableIcon: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
            width: 40,
            height: 4,
            borderRadius: 2,
            marginTop: 10,
          },
          container: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderWidth: 1,
            borderColor: colors.border,
            paddingTop: insets.top || 10,
          },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  targetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  targetPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 36,
  },

  /* 2. Hero Hub */
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
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
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  audioBadgeText: {
    color: '#E0E7FF',
    fontSize: 10,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#BFDBFE',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  heroSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroSpecDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroSpecText: {
    color: '#DBEAFE',
    fontSize: 11,
    fontWeight: '600',
  },
  startSimulationBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startSimulationBtnText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
  },

  /* 3. Framework Stepper */
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  frameworkGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  frameworkStepCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  frameworkStepTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  frameworkStepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  frameworkStepTiming: {
    fontSize: 9,
    fontWeight: '500',
  },
  frameworkStepTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  frameworkStepAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  frameworkStepActionText: {
    fontSize: 10,
    fontWeight: '600',
  },

  /* 4. Active Focus Card */
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeFocusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  activeFocusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lessonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  lessonBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  activeFocusTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  activeFocusDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  focusProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  focusProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  activeFocusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeFocusAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  playPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 5. Architectural Tip Card */
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tipLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#F59E0B',
  },
  nextTipBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tipContentText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  /* Bottom Sheet Checklist */
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  modalHeaderLeft: {
    gap: 4,
  },
  modalStepBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#2563EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  modalSummary: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  modalDivider: {
    height: 1,
    marginBottom: 14,
  },
  checklistSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  checklistItemsList: {
    gap: 10,
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checklistItemText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  modalActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

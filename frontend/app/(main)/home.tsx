import { useGetHistoryQuery } from '@/src/redux/api/interview_api';
import { useAppSelector } from '@/src/redux/hooks';
import { setSelectedTopic } from '@/src/redux/slices/problem';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import {
  ArrowRight,
  BookOpen,
  CaretRight,
  CheckCircle,
  Gear,
  Lightning,
  Microphone,
  Play,
  Sparkle,
  Target,
  X,
} from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
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

// Curated Quick-Launch Problem Scenarios
interface CaseStudy {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  domain: string;
  keyChallenge: string;
}

const QUICK_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'whatsapp',
    title: 'Design WhatsApp',
    difficulty: 'Advanced',
    duration: 45,
    domain: 'Real-time Chat',
    keyChallenge: 'WebSockets, E2EE, and message persistence',
  },
  {
    id: 'netflix',
    title: 'Design Netflix',
    difficulty: 'Advanced',
    duration: 45,
    domain: 'Video Streaming',
    keyChallenge: 'Adaptive bitrate, transcoding & global CDN',
  },
  {
    id: 'uber',
    title: 'Design Uber',
    difficulty: 'Advanced',
    duration: 45,
    domain: 'Geospatial',
    keyChallenge: 'Quadtrees, driver matching & live location',
  },
  {
    id: 'tinyurl',
    title: 'Design TinyURL',
    difficulty: 'Beginner',
    duration: 30,
    domain: 'URL Shortener',
    keyChallenge: 'Base62 hashing, caching & high read throughput',
  },
  {
    id: 'instagram',
    title: 'Design Instagram',
    difficulty: 'Intermediate',
    duration: 35,
    domain: 'Social Feed',
    keyChallenge: 'Feed ranking, fan-out on write & S3 storage',
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
  const { data } = useGetHistoryQuery();
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();

  const [selectedFrameworkStep, setSelectedFrameworkStep] = useState<FrameworkStep | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      } catch (e) {
        // Optional permission
      }
    };
    requestPermissions();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  const handleStartSimulation = () => {
    router.push('/(interview)/problem-selection' as any);
  };

  const handleSelectCaseStudy = (study: CaseStudy) => {
    dispatch(setSelectedTopic({ id: study.id, title: study.title }));
    router.push('/(interview)/setup' as any);
  };

  const handleCycleTip = () => {
    setTipIndex((prev) => (prev + 1) % ARCHITECTURAL_TIPS.length);
  };

  // Extract actionable weaknesses from the most recent interview or provide default pillars
  const latestInterview = data?.history && data.history.length > 0 ? data.history[0] : null;
  const recentMissedTopics = latestInterview?.summary?.missed_topics ?? [];

  const focusItems = useMemo(() => {
    if (recentMissedTopics.length > 0) {
      return recentMissedTopics.slice(0, 3).map((topic, i) => ({
        id: `recent-${i}`,
        title: topic,
        reason: `Flagged in recent ${latestInterview?.topic || 'mock interview'}`,
        isFromRecentFeedback: true,
      }));
    }

    return [
      {
        id: 'pillar-1',
        title: 'Distributed Caching & Invalidation',
        reason: 'Essential for high read-to-write ratios & sub-millisecond latency',
        isFromRecentFeedback: false,
      },
      {
        id: 'pillar-2',
        title: 'Database Sharding & Partition Keys',
        reason: 'Critical for horizontal database scaling without hotspot nodes',
        isFromRecentFeedback: false,
      },
      {
        id: 'pillar-3',
        title: 'Asynchronous Decoupling with Queues',
        reason: 'Required for resilient event-driven systems and backpressure',
        isFromRecentFeedback: false,
      },
    ];
  }, [recentMissedTopics, latestInterview?.topic]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
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
          <Pressable
            onPress={() => router.push('/(main)/preferences' as any)}
            style={[styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Gear size={20} color={colors.textSecondary} />
          </Pressable>
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
                onPress={() => setSelectedFrameworkStep(step)}
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

        {/* Target Architectural Focus Areas (Data-Driven Real Value) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {recentMissedTopics.length > 0 ? 'Target Areas from Evaluation' : 'Core Architecture Focus'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {recentMissedTopics.length > 0
                  ? `Specific areas flagged in your last ${latestInterview?.topic || 'interview'}`
                  : 'High-impact architectural patterns tested in senior rounds'}
              </Text>
            </View>
          </View>

          <View style={styles.focusList}>
            {focusItems.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.focusCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.focusCardHeader}>
                  <View style={styles.focusBadgeDot} />
                  <Text style={[styles.focusCardTitle, { color: colors.text }]}>{item.title}</Text>
                </View>
                <Text style={[styles.focusCardReason, { color: colors.textSecondary }]}>
                  {item.reason}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleStartSimulation}
                  style={styles.focusActionBtn}
                >
                  <Text style={[styles.focusActionText, { color: colors.primary }]}>Practice Related Scenario</Text>
                  <ArrowRight size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Popular System Design Case Studies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Practice Case Studies</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Iconic distributed architectures to test your skills
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(main)/practice' as any)}
              style={styles.seeAllButton}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
              <CaretRight size={14} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.caseStudiesScroll}>
            {QUICK_CASE_STUDIES.map((study) => (
              <TouchableOpacity
                key={study.id}
                activeOpacity={0.75}
                onPress={() => handleSelectCaseStudy(study)}
                style={[
                  styles.caseStudyCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.caseStudyHeader}>
                  <View style={[styles.caseDomainBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.caseDomainText, { color: colors.textSecondary }]}>{study.domain}</Text>
                  </View>
                  <Text style={[styles.caseDuration, { color: colors.textDim }]}>{study.duration}m</Text>
                </View>

                <Text style={[styles.caseStudyTitle, { color: colors.text }]}>{study.title}</Text>
                <Text style={[styles.caseStudyChallenge, { color: colors.textSecondary }]} numberOfLines={2}>
                  {study.keyChallenge}
                </Text>

                <View style={styles.caseStudyFooter}>
                  <View
                    style={[
                      styles.difficultyTag,
                      {
                        backgroundColor:
                          study.difficulty === 'Beginner'
                            ? '#10B98118'
                            : study.difficulty === 'Intermediate'
                            ? '#F59E0B18'
                            : '#EF444418',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyTagText,
                        {
                          color:
                            study.difficulty === 'Beginner'
                              ? '#10B981'
                              : study.difficulty === 'Intermediate'
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      {study.difficulty}
                    </Text>
                  </View>

                  <View style={styles.startArrowBox}>
                    <Play size={12} color={colors.primary} weight="fill" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
            "{ARCHITECTURAL_TIPS[tipIndex]}"
          </Text>
        </View>
      </ScrollView>

      {/* Framework Checklist Modal */}
      <Modal
        visible={selectedFrameworkStep !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedFrameworkStep(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalStepBadge}>STAGE {selectedFrameworkStep?.step}</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedFrameworkStep?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFrameworkStep(null)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

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
                setSelectedFrameworkStep(null);
                handleStartSimulation();
              }}
              style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalActionBtnText}>Practice with this Framework</Text>
              <ArrowRight size={16} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    fontSize: 11,
    fontWeight: '600',
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
  // Focus Areas (Real Value)
  focusList: {
    gap: 10,
  },
  focusCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  focusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  focusBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  focusCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  focusCardReason: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 16,
  },
  focusActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 16,
    marginTop: 4,
  },
  focusActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Quick Case Studies
  caseStudiesScroll: {
    gap: 12,
    paddingRight: 8,
  },
  caseStudyCard: {
    width: 220,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  caseStudyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseDomainBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  caseDomainText: {
    fontSize: 10,
    fontWeight: '600',
  },
  caseDuration: {
    fontSize: 11,
    fontWeight: '600',
  },
  caseStudyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  caseStudyChallenge: {
    fontSize: 11,
    lineHeight: 15,
  },
  caseStudyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  difficultyTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  startArrowBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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

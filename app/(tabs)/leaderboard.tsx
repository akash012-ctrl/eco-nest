import { OfflineIndicator } from "@/components";
import {
  hasShownPrivacyPrompt,
  markPrivacyPromptShown,
  PrivacyPrompt,
} from "@/components/privacy-prompt";
import { setPrivacySetting } from "@/components/privacy-toggle";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { useReducedMotion } from "@/contexts/reduced-motion-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  addNetworkListener,
  isOnline,
  leaderboardService,
  type RankingEntry,
  type UserRankInfo,
} from "@/services/leaderboard-service";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type TabType = "global" | "demo";

// ============================================================================
// Skeleton Loader Component
// ============================================================================

const SkeletonLoader = memo(function SkeletonLoader() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Pulse animation
    const interval = setInterval(() => {
      opacity.value = withTiming(opacity.value === 0.3 ? 0.6 : 0.3, {
        duration: 1000,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <ThemedView style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Animated.View key={i} style={[styles.skeletonItem, animatedStyle]}>
          <View style={styles.skeletonCircle} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonPoints} />
        </Animated.View>
      ))}
    </ThemedView>
  );
});

// ============================================================================
// User Rank Card Component (Sticky)
// ============================================================================

interface UserRankCardProps {
  rankInfo: UserRankInfo | null;
  loading: boolean;
}

const UserRankCard = memo(function UserRankCard({
  rankInfo,
  loading,
}: UserRankCardProps) {
  const colorScheme = useColorScheme();
  const { reducedMotion } = useReducedMotion();
  const deltaScale = useSharedValue(1);
  const deltaOpacity = useSharedValue(0);

  useEffect(() => {
    if (rankInfo && rankInfo.delta !== 0) {
      // Animate delta appearance with fade (< 150ms, always allowed)
      deltaOpacity.value = 0;
      deltaOpacity.value = withTiming(1, { duration: 150 });

      // Scale/bounce animation only if reduced motion is disabled
      if (!reducedMotion) {
        deltaScale.value = 0.8;
        deltaScale.value = withSpring(1, {
          damping: 10,
          stiffness: 100,
        });
      } else {
        deltaScale.value = 1;
      }
    }
  }, [rankInfo?.delta, reducedMotion]);

  const deltaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: deltaOpacity.value,
    transform: [{ scale: deltaScale.value }],
  }));

  if (loading || !rankInfo) {
    return (
      <ThemedView style={[styles.userCard, styles.shadow]}>
        <ActivityIndicator size="small" />
      </ThemedView>
    );
  }

  const deltaColor =
    rankInfo.delta > 0
      ? Colors[colorScheme ?? "light"].accent
      : rankInfo.delta < 0
        ? Colors[colorScheme ?? "light"].alert
        : Colors[colorScheme ?? "light"].text;

  const deltaArrow = rankInfo.delta > 0 ? "↑" : rankInfo.delta < 0 ? "↓" : "";

  return (
    <ThemedView
      style={[styles.userCard, styles.shadow]}
      accessible={true}
      accessibilityLabel={`Your rank: ${rankInfo.rank}${rankInfo.delta !== 0 ? `. ${rankInfo.delta > 0 ? "Up" : "Down"} ${Math.abs(rankInfo.delta)} ${Math.abs(rankInfo.delta) === 1 ? "position" : "positions"}` : ""}. ${rankInfo.ecoPoints} EcoPoints`}
      accessibilityRole="summary"
    >
      <ThemedView style={styles.userCardContent}>
        <ThemedView style={styles.userCardLeft}>
          <ThemedText style={styles.userCardLabel}>Your Rank</ThemedText>
          <ThemedView style={styles.userCardRankRow}>
            <ThemedText style={styles.userCardRank}>
              #{rankInfo.rank}
            </ThemedText>
            {rankInfo.delta !== 0 && (
              <Animated.View
                style={deltaAnimatedStyle}
                accessible={true}
                accessibilityLabel={`${rankInfo.delta > 0 ? "Up" : "Down"} ${Math.abs(rankInfo.delta)}`}
              >
                <ThemedText
                  style={[styles.userCardDelta, { color: deltaColor }]}
                >
                  {Math.abs(rankInfo.delta)} {deltaArrow}
                </ThemedText>
              </Animated.View>
            )}
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.userCardRight}>
          <ThemedText style={styles.userCardPoints}>
            {rankInfo.ecoPoints}
          </ThemedText>
          <ThemedText style={styles.userCardPointsLabel}>EcoPoints</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
});

// ============================================================================
// Closest Competitors Carousel Component
// ============================================================================

interface ClosestCompetitorsCarouselProps {
  competitors: RankingEntry[];
  loading: boolean;
}

const ClosestCompetitorsCarousel = memo(function ClosestCompetitorsCarousel({
  competitors,
  loading,
}: ClosestCompetitorsCarouselProps) {
  if (loading) {
    return (
      <ThemedView style={[styles.carouselCard, styles.shadow]}>
        <ActivityIndicator size="small" />
      </ThemedView>
    );
  }

  if (competitors.length === 0) {
    return null;
  }

  return (
    <ThemedView style={[styles.carouselCard, styles.shadow]}>
      <ThemedText type="subtitle" style={styles.carouselTitle}>
        You vs. 3 Closest
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {competitors.map((competitor, index) => (
          <ThemedView key={competitor.userId} style={styles.competitorCard}>
            <ThemedText style={styles.competitorRank}>
              #{competitor.rank}
            </ThemedText>
            <ThemedText
              style={styles.competitorName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {competitor.displayName}
            </ThemedText>
            <ThemedText style={styles.competitorPoints}>
              {competitor.ecoPoints}
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
});

// ============================================================================
// Ranking List Item Component
// ============================================================================

interface RankingListItemProps {
  entry: RankingEntry;
  isCurrentUser: boolean;
}

const RankingListItem = memo(function RankingListItem({
  entry,
  isCurrentUser,
}: RankingListItemProps) {
  const colorScheme = useColorScheme();

  // Rank badges for top 3
  const badge = useMemo(() => {
    if (entry.rank === 1) return "🥇";
    if (entry.rank === 2) return "🥈";
    if (entry.rank === 3) return "🥉";
    return null;
  }, [entry.rank]);

  return (
    <ThemedView
      style={[
        styles.listItem,
        isCurrentUser && {
          backgroundColor: Colors[colorScheme ?? "light"].accent,
        },
      ]}
      accessible={true}
      accessibilityLabel={`${isCurrentUser ? "You are ranked" : ""} ${badge ? `${badge} place` : `Rank ${entry.rank}`}. ${entry.displayName}${entry.isAnonymous ? " (Anonymous)" : ""}. ${entry.ecoPoints} EcoPoints`}
      accessibilityRole="text"
    >
      <ThemedView style={styles.listItemLeft}>
        <ThemedText
          style={[
            styles.listItemRank,
            isCurrentUser && styles.listItemTextWhite,
          ]}
        >
          {badge || `#${entry.rank}`}
        </ThemedText>
        <ThemedText
          style={[
            styles.listItemName,
            isCurrentUser && styles.listItemTextWhite,
          ]}
          numberOfLines={1}
        >
          {entry.displayName}
          {entry.isAnonymous && " (Anonymous)"}
        </ThemedText>
      </ThemedView>
      <ThemedText
        style={[
          styles.listItemPoints,
          isCurrentUser && styles.listItemTextWhite,
        ]}
      >
        {entry.ecoPoints}
      </ThemedText>
    </ThemedView>
  );
});

// ============================================================================
// Main Leaderboard Screen Component
// ============================================================================

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, updatePrivacy } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState<TabType>("global");
  const [globalRankings, setGlobalRankings] = useState<RankingEntry[]>([]);
  const [demoRankings, setDemoRankings] = useState<RankingEntry[]>([]);
  const [userRankInfo, setUserRankInfo] = useState<UserRankInfo | null>(null);
  const [closestCompetitors, setClosestCompetitors] = useState<RankingEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(isOnline());
  const [showPrivacyPrompt, setShowPrivacyPrompt] = useState(false);

  // Check if we need to show privacy prompt on mount
  useEffect(() => {
    const checkPrivacyPrompt = async () => {
      if (!isDemoMode && isAuthenticated) {
        const hasShown = await hasShownPrivacyPrompt();
        if (!hasShown) {
          setShowPrivacyPrompt(true);
        }
      }
    };

    checkPrivacyPrompt();
  }, [isDemoMode, isAuthenticated]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load user rank info
      const rankInfo = await leaderboardService.getUserRank();
      setUserRankInfo(rankInfo);

      // Load closest competitors
      const competitors = await leaderboardService.getClosestCompetitors(3);
      setClosestCompetitors(competitors);

      // Load rankings based on active tab
      if (activeTab === "global") {
        const rankings = await leaderboardService.getGlobalRankings(100);
        setGlobalRankings(rankings);
      } else {
        const rankings = await leaderboardService.getDemoFriendsRankings();
        setDemoRankings(rankings);
      }
    } catch (error) {
      console.error("Failed to load leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Load data on mount and when tab changes
  useEffect(() => {
    loadData();

    // Set up network listener
    const cleanup = addNetworkListener((isOnline) => {
      setOnline(isOnline);
      if (isOnline) {
        loadData();
      }
    });

    return cleanup;
  }, [loadData]);

  const handlePrivacySelection = useCallback(
    async (isAnonymous: boolean) => {
      try {
        // Save to AsyncStorage
        await setPrivacySetting(isAnonymous);

        // Update backend if authenticated
        if (isAuthenticated && !isDemoMode) {
          await updatePrivacy(isAnonymous);
        }

        // Mark prompt as shown
        await markPrivacyPromptShown();

        // Close prompt
        setShowPrivacyPrompt(false);

        // Reload data to reflect privacy change
        await loadData();
      } catch (error) {
        console.error("Failed to update privacy setting:", error);
      }
    },
    [isAuthenticated, isDemoMode, loadData]
  );

  const currentRankings = useMemo(
    () => (activeTab === "global" ? globalRankings : demoRankings),
    [activeTab, globalRankings, demoRankings]
  );

  const renderItem = useCallback(
    ({ item }: { item: RankingEntry }) => (
      <RankingListItem
        entry={item}
        isCurrentUser={item.userId === "current_user"}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: RankingEntry) => item.userId, []);

  return (
    <ThemedView style={styles.container}>
      {/* Privacy Prompt Modal */}
      <PrivacyPrompt
        visible={showPrivacyPrompt}
        onSelectPublic={() => handlePrivacySelection(false)}
        onSelectAnonymous={() => handlePrivacySelection(true)}
      />
      {/* Tab Bar */}
      <ThemedView style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "global" && styles.tabActive]}
          onPress={() => setActiveTab("global")}
          accessible={true}
          accessibilityLabel="Global leaderboard"
          accessibilityHint="View global rankings"
          accessibilityRole="tab"
          accessibilityState={{
            selected: activeTab === "global",
          }}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "global" && styles.tabTextActive,
            ]}
          >
            Global
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "demo" && styles.tabActive]}
          onPress={() => setActiveTab("demo")}
          accessible={true}
          accessibilityLabel="Demo friends leaderboard"
          accessibilityHint="View demo friends rankings"
          accessibilityRole="tab"
          accessibilityState={{
            selected: activeTab === "demo",
          }}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "demo" && styles.tabTextActive,
            ]}
          >
            Demo Friends
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* User Rank Card (Sticky) */}
      <UserRankCard rankInfo={userRankInfo} loading={loading} />

      {/* Closest Competitors Carousel */}
      <ClosestCompetitorsCarousel
        competitors={closestCompetitors}
        loading={loading}
      />

      {/* Rankings List */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <FlatList
          data={currentRankings}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={10}
        />
      )}
    </ThemedView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  tabActive: {
    backgroundColor: "#34C759",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.6,
  },
  tabTextActive: {
    color: "#FFFFFF",
    opacity: 1,
  },
  userCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userCardLeft: {
    flex: 1,
  },
  userCardLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  userCardRankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userCardRank: {
    fontSize: 32,
    fontWeight: "bold",
  },
  userCardDelta: {
    fontSize: 18,
    fontWeight: "700",
  },
  userCardRight: {
    alignItems: "flex-end",
  },
  userCardPoints: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#34C759",
  },
  userCardPointsLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  carouselCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  carouselTitle: {
    marginBottom: 16,
  },
  carouselContent: {
    gap: 12,
  },
  competitorCard: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    alignItems: "center",
  },
  competitorRank: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.6,
    marginBottom: 8,
  },
  competitorName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  competitorPoints: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  listItemRank: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 40,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  listItemPoints: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  listItemTextWhite: {
    color: "#FFFFFF",
  },
  skeletonContainer: {
    paddingHorizontal: 20,
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginRight: 12,
  },
  skeletonText: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  skeletonPoints: {
    width: 60,
    height: 20,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginLeft: 12,
  },
});

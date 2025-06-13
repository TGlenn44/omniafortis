import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAppContext } from "../../app/AppProvider";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Train: undefined;
  Calendar: undefined;
  Mindset: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { logs } = useAppContext();
  const navigation = useNavigation<NavigationProp>();

  // Calculate workout stats
  const workoutLogs = logs.filter(
    (log): log is import("../../app/AppProvider").WorkoutLog =>
      log.type === "workout"
  );
  const totalWorkouts = workoutLogs.length;
  const totalVolume = workoutLogs.reduce(
    (sum: number, log: import("../../app/AppProvider").WorkoutLog) =>
      sum +
      (Array.isArray(log.exercises)
        ? log.exercises.reduce(
            (
              exerciseSum: number,
              exercise: import("../../app/AppProvider").Exercise
            ) =>
              exerciseSum +
              (Array.isArray(exercise.sets)
                ? exercise.sets.reduce(
                    (setSum: number, set: { reps: number; weight: number }) =>
                      setSum + (set.reps || 0) * (set.weight || 0),
                    0
                  )
                : 0),
            0
          )
        : 0),
    0
  );

  // Get today's date string in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysWorkouts = workoutLogs
    .filter((log) => log.date === todayStr)
    .sort((a, b) => b.time.localeCompare(a.time));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>OmniaFortis</Text>
          <Text style={styles.welcomeSubtitle}>Strength in Everything.</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {totalVolume.toLocaleString()} lbs
              </Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Sleep Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Train")}
            >
              <Text style={styles.actionTitle}>Log Training</Text>
              <Text style={styles.actionSubtitle}>Track your gains</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Mindset")}
            >
              <Text style={styles.actionTitle}>Track Mindset</Text>
              <Text style={styles.actionSubtitle}>Monitor focus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Log Sleep</Text>
              <Text style={styles.actionSubtitle}>Track recovery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Log Nutrition</Text>
              <Text style={styles.actionSubtitle}>Fuel progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {todaysWorkouts.map((log, index) => (
            <View key={index} style={styles.activityCard}>
              {log.title && (
                <Text style={styles.activityTitle}>{log.title}</Text>
              )}
              <Text style={styles.activityDate}>
                {new Date(log.date).toLocaleDateString()} •{" "}
                {new Date(`${log.date}T${log.time}`).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
              <Text style={styles.activitySubtitle}>
                {Array.isArray(log.exercises) ? log.exercises.length : 0}{" "}
                Exercises
              </Text>
              {Array.isArray(log.exercises)
                ? log.exercises.map(
                    (
                      exercise: import("../../app/AppProvider").Exercise,
                      i: number
                    ) => (
                      <Text key={i} style={styles.exerciseLine}>
                        {exercise.exercise}:{" "}
                        {Array.isArray(exercise.sets)
                          ? exercise.sets
                              .map(
                                (
                                  set: { reps: number; weight: number },
                                  j: number
                                ) =>
                                  `Set ${j + 1}: ${set.reps || 0} reps @ ${
                                    set.weight || 0
                                  }lbs`
                              )
                              .join(", ")
                          : "No sets"}
                      </Text>
                    )
                  )
                : null}
              {log.note && <Text style={styles.activityNotes}>{log.note}</Text>}
            </View>
          ))}
          {todaysWorkouts.length === 0 && (
            <Text style={styles.activityNotes}>No workouts logged today.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#999",
  },
  statsSection: {
    marginBottom: 30,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 20,
    width: "48%",
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  statLabel: {
    color: "#999",
    fontSize: 14,
  },
  actionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 20,
    width: "48%",
    marginBottom: 15,
    alignItems: "center",
  },
  actionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  actionSubtitle: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
  activitySection: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  activityDate: {
    color: "#999",
    fontSize: 12,
    marginBottom: 5,
  },
  activityTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  activitySubtitle: {
    color: "#999",
    fontSize: 14,
    marginBottom: 5,
  },
  activityDetails: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 10,
  },
  activityNotes: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  exerciseLine: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 2,
    display: "flex",
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  useAppContext,
  Log,
  WorkoutLog,
  Exercise,
} from "../../app/AppProvider";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const isWorkoutLog = (log: Log): log is WorkoutLog => {
  return log.type === "workout";
};

export default function CalendarScreen() {
  const { logs, addLog } = useAppContext();
  const setLogs = useAppContext().setLogs || (() => {}); // fallback if not provided
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  // Set selected date to current day on mount
  React.useEffect(() => {
    setSelectedDate(currentDay.toString());
  }, []);

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a date has a workout
  const hasWorkout = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];
    return logs.some((log) => isWorkoutLog(log) && log.date === date);
  };

  // Get workouts for a specific date
  const getWorkoutsForDate = (day: number): WorkoutLog[] => {
    const date = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];
    return logs.filter(
      (log): log is WorkoutLog => isWorkoutLog(log) && log.date === date
    );
  };

  // Format date for display
  const formatDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate total volume for a workout
  const calculateWorkoutVolume = (workout: WorkoutLog): number => {
    if (!Array.isArray(workout.exercises)) return 0;
    return workout.exercises.reduce((total, exercise) => {
      if (!Array.isArray(exercise.sets)) return total;
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.reps || 0) * (set.weight || 0);
        }, 0)
      );
    }, 0);
  };

  const handleDeleteWorkout = (workout: WorkoutLog, index: number) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Remove the workout from logs
            const date = workout.date;
            const time = workout.time;
            setLogs(
              logs.filter(
                (log) =>
                  !(
                    log.type === "workout" &&
                    log.date === date &&
                    log.time === time
                  )
              )
            );
          },
        },
      ]
    );
  };

  const handleEditWorkout = (workout: WorkoutLog, index: number) => {
    // TODO: Implement navigation to TrainScreen with workout data for editing
    // navigation.navigate('Train', { workout });
    Alert.alert("Edit Workout", "Edit functionality coming soon!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.monthYear}>
        {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </Text>

      <View style={styles.calendar}>
        {/* Day headers */}
        <View style={styles.weekDays}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.daysGrid}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.day,
                day === currentDay && styles.currentDay,
                hasWorkout(day) && styles.workoutDay,
              ]}
              onPress={() => setSelectedDate(day.toString())}
            >
              <Text
                style={[
                  styles.dayText,
                  day === currentDay && styles.currentDayText,
                  hasWorkout(day) && styles.workoutDayText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Workout Details */}
      {selectedDate && (
        <View style={styles.workoutDetails}>
          <View style={styles.workoutDetailsHeader}>
            <Text style={styles.workoutDetailsTitle}>
              {formatDate(parseInt(selectedDate))}
            </Text>
          </View>

          <ScrollView style={styles.workoutList}>
            {getWorkoutsForDate(parseInt(selectedDate)).map(
              (workout: WorkoutLog, index: number) => (
                <View key={index} style={styles.workoutItem}>
                  {workout.title && (
                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                  )}
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutTime}>
                      {new Date(
                        workout.date + "T" + workout.time
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text style={styles.workoutVolume}>
                      Total Volume:{" "}
                      {calculateWorkoutVolume(workout).toLocaleString()} lbs
                    </Text>
                    <View style={styles.workoutActions}>
                      <TouchableOpacity
                        onPress={() => handleEditWorkout(workout, index)}
                        style={styles.iconButton}
                      >
                        <Feather name="edit-2" size={18} color="#bbb" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteWorkout(workout, index)}
                        style={styles.iconButton}
                      >
                        <Feather name="trash-2" size={18} color="#bbb" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.workoutExercises}>
                    {(Array.isArray(workout.exercises)
                      ? workout.exercises
                      : []
                    ).map((exercise: Exercise, exIndex: number) => (
                      <View key={exIndex} style={styles.exerciseItem}>
                        <Text style={styles.exerciseName}>
                          {exercise.exercise}
                        </Text>
                        <View style={styles.exerciseSets}>
                          {(Array.isArray(exercise.sets)
                            ? exercise.sets
                            : []
                          ).map((set, setIndex: number) => (
                            <Text key={setIndex} style={styles.setText}>
                              Set {setIndex + 1}: {set.reps} reps × {set.weight}{" "}
                              lbs
                            </Text>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                  {workout.note && (
                    <Text style={styles.workoutNote}>{workout.note}</Text>
                  )}
                </View>
              )
            )}
            {getWorkoutsForDate(parseInt(selectedDate)).length === 0 && (
              <Text style={styles.noWorkoutsText}>
                No workouts logged for this day
              </Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.workoutDay]} />
          <Text style={styles.legendText}>Workout Day</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16,
  },
  monthYear: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  calendar: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  day: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  dayText: {
    color: "#fff",
    fontSize: 16,
  },
  currentDay: {
    backgroundColor: "#333",
  },
  currentDayText: {
    color: "#2ecc71",
    fontWeight: "bold",
  },
  workoutDay: {
    backgroundColor: "#2ecc71",
  },
  workoutDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: "#fff",
    fontSize: 14,
  },
  workoutDetails: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    maxHeight: "50%",
  },
  workoutDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  workoutDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  workoutList: {
    maxHeight: "100%",
  },
  workoutItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workoutTime: {
    color: "#2ecc71",
    fontSize: 14,
  },
  workoutVolume: {
    color: "#2ecc71",
    fontSize: 14,
    fontWeight: "500",
  },
  workoutExercises: {
    gap: 12,
  },
  exerciseItem: {
    marginBottom: 8,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  exerciseSets: {
    marginLeft: 8,
  },
  setText: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 2,
  },
  noWorkoutsText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  workoutNote: {
    color: "#ffd700",
    fontSize: 15,
    marginTop: 10,
    fontStyle: "italic",
  },
  workoutActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 2,
  },
  iconButton: {
    marginHorizontal: 2,
    padding: 2,
  },
  workoutTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
});

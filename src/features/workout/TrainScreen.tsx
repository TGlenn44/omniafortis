import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useState, useRef } from "react";
import { useAppContext } from "../../app/AppProvider";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import EditExerciseModal, {
  ExerciseType as EditExerciseType,
} from "../../shared/components/EditExerciseModal";
import { Feather } from "@expo/vector-icons";
import AddSubtract from "../../shared/components/AddSubtract";

type RootStackParamList = {
  Home: undefined;
  Log: undefined;
  Mindset: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Set = {
  reps: number;
  weight: number;
  rpe?: number;
};

type Exercise = {
  exercise: string;
  sets: Set[];
};

export default function TrainScreen() {
  const { addLog } = useAppContext();
  const navigation = useNavigation<NavigationProp>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    exercise: "",
    sets: [{ reps: 0, weight: 0 }],
  });
  const [trainingTitle, setTrainingTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editExerciseIndex, setEditExerciseIndex] = useState<number | null>(
    null
  );
  const [editExerciseData, setEditExerciseData] =
    useState<EditExerciseType | null>(null);
  const [titleLocked, setTitleLocked] = useState(false);

  const addSet = () => {
    setCurrentExercise({
      ...currentExercise,
      sets: [...currentExercise.sets, { reps: 0, weight: 0 }],
    });
  };

  const updateSet = (index: number, field: keyof Set, value: string) => {
    // Allow empty string or any number (including 0)
    const numericValue = value === "" ? 0 : parseInt(value) || 0;
    setCurrentExercise((prev) => {
      const newSets = [...prev.sets];
      newSets[index] = { ...newSets[index], [field]: numericValue };
      return { ...prev, sets: newSets };
    });
  };

  const addExercise = () => {
    // Trim whitespace from exercise name
    const trimmedExercise = currentExercise.exercise.trim();

    if (!trimmedExercise) {
      setError("Please enter an exercise name");
      return;
    }

    // Filter out sets that have both reps and weight as 0
    const validSets = currentExercise.sets.filter(
      (set) => !(set.reps === 0 && set.weight === 0)
    );

    if (validSets.length === 0) {
      setError("Please enter at least one set with reps or weight");
      return;
    }

    // Create a new exercise object with the trimmed name and only valid sets
    const newExercise: Exercise = {
      exercise: trimmedExercise,
      sets: validSets,
    };

    // Update exercises state with the new exercise
    setExercises((prevExercises) => [...prevExercises, newExercise]);

    // Reset current exercise state
    setCurrentExercise({
      exercise: "",
      sets: [{ reps: 0, weight: 0 }],
    });
    setError(null);
  };

  const saveTraining = () => {
    if (!trainingTitle.trim()) {
      setTitleError("Please enter a training title.");
      return;
    }
    setTitleError(null);
    // Defensive: filter out exercises with no valid sets
    const validExercises = exercises
      .filter((ex) => Array.isArray(ex.sets) && ex.sets.length > 0)
      .map((ex) => ({
        ...ex,
        sets: Array.isArray(ex.sets)
          ? ex.sets.filter(
              (set) =>
                typeof set.reps === "number" && typeof set.weight === "number"
            )
          : [],
      }));

    if (validExercises.length > 0) {
      addLog({
        type: "workout",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        title: trainingTitle.trim(),
        exercises: validExercises,
        note: notes.trim(),
      });

      // Reset training state
      setTrainingTitle("");
      setExercises([]);
      setNotes("");
      setTitleLocked(false);

      // Show success animation
      setShowSuccess(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 0.5,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowSuccess(false);
            navigation.navigate("Home");
          });
        }, 1000);
      });
    }
  };

  // Add edit and delete handlers for exercises
  const handleEditExercise = (index: number) => {
    setEditExerciseIndex(index);
    setEditExerciseData(exercises[index]);
    setEditModalVisible(true);
  };

  const handleSaveEditedExercise = (updatedExercise: EditExerciseType) => {
    if (editExerciseIndex !== null) {
      setExercises((prev) =>
        prev.map((ex, i) => (i === editExerciseIndex ? updatedExercise : ex))
      );
    }
    setEditModalVisible(false);
    setEditExerciseIndex(null);
    setEditExerciseData(null);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditExerciseIndex(null);
    setEditExerciseData(null);
  };

  const handleDeleteExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Track Your Grind</Text>

        {/* Training Title Input with lock/edit mechanic */}
        <Text style={styles.sectionTitle}>Title</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Training Title (e.g. Push Day, Lower Body, etc.)"
            placeholderTextColor="#666"
            value={trainingTitle}
            onChangeText={(text) => {
              setTrainingTitle(text);
              setTitleError(null);
            }}
            editable={!titleLocked}
          />
          <TouchableOpacity
            onPress={() => setTitleLocked(!titleLocked)}
            style={{ marginLeft: 8, padding: 4 }}
            disabled={!trainingTitle.trim()}
          >
            {titleLocked ? (
              <Feather name="edit-2" size={20} color="#bbb" />
            ) : (
              <Feather
                name="check"
                size={20}
                color={trainingTitle.trim() ? "#228B22" : "#bbb"}
              />
            )}
          </TouchableOpacity>
        </View>
        {titleError && <Text style={styles.errorText}>{titleError}</Text>}

        {/* Exercise Input Form */}
        <Text style={styles.sectionTitle}>Add Exercise</Text>
        <View style={styles.form}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="Exercise Name"
            placeholderTextColor="#666"
            value={currentExercise.exercise}
            onChangeText={(text) => {
              setCurrentExercise((prev) => ({ ...prev, exercise: text }));
              setError(null);
            }}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Sets Input */}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              Sets
            </Text>
            <AddSubtract
              value={currentExercise.sets.length}
              min={1}
              onAdd={() =>
                setCurrentExercise((prev) => ({
                  ...prev,
                  sets: [...prev.sets, { reps: 0, weight: 0 }],
                }))
              }
              onSubtract={() =>
                setCurrentExercise((prev) => ({
                  ...prev,
                  sets:
                    prev.sets.length > 1 ? prev.sets.slice(0, -1) : prev.sets,
                }))
              }
            />
          </View>

          {/* Sets Table */}
          <View style={styles.setsTable}>
            <View style={styles.tableHeader}>
              <View style={styles.repsColumn}>
                <Text style={styles.headerText}>Reps</Text>
              </View>
              <View style={styles.weightColumn}>
                <Text style={styles.headerText}>Weight</Text>
              </View>
              <View style={styles.rpeColumn}>
                <Text style={styles.headerText}>RPE</Text>
              </View>
            </View>

            {currentExercise.sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <View style={styles.repsColumn}>
                  <TextInput
                    style={[styles.input, styles.setInput]}
                    placeholder="Reps"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={set.reps ? set.reps.toString() : ""}
                    onChangeText={(text) => updateSet(index, "reps", text)}
                  />
                </View>
                <View style={styles.weightColumn}>
                  <TextInput
                    style={[styles.input, styles.setInput]}
                    placeholder="Weight"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={set.weight ? set.weight.toString() : ""}
                    onChangeText={(text) => updateSet(index, "weight", text)}
                  />
                </View>
                <View style={styles.rpeColumn}>
                  <TextInput
                    style={[styles.input, styles.setInput]}
                    placeholder="RPE"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    value={set.rpe ? set.rpe.toString() : ""}
                    onChangeText={(text) => updateSet(index, "rpe", text)}
                  />
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={addExercise}>
            <Text style={styles.buttonText}>+ Add to Log</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise List */}
        {exercises.length > 0 && (
          <View style={styles.exerciseList}>
            <Text style={styles.subtitle}>Current Workout</Text>
            {exercises.map((exercise, index) => (
              <View key={`exercise-${index}`} style={styles.exerciseItemRow}>
                <View style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.exercise}</Text>
                  {exercise.sets.map((set, setIndex) => (
                    <Text
                      key={`set-${index}-${setIndex}`}
                      style={styles.exerciseDetails}
                    >
                      Set {setIndex + 1}: {set.reps} reps @ {set.weight}lbs
                      {set.rpe !== undefined && set.rpe !== null
                        ? ` | RPE: ${set.rpe}`
                        : ""}
                    </Text>
                  ))}
                </View>
                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    onPress={() => handleEditExercise(index)}
                    style={styles.iconButton}
                  >
                    <Feather name="edit-2" size={18} color="#bbb" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteExercise(index)}
                    style={styles.iconButton}
                  >
                    <Feather name="trash-2" size={18} color="#bbb" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes Label */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Training Notes"
          placeholderTextColor="#666"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveTraining}
          disabled={exercises.length === 0 || !trainingTitle.trim()}
        >
          <Text style={styles.buttonText}>Save Training</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successContent}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Training Saved!</Text>
            <Text style={styles.successSubtext}>
              Redirecting to dashboard...
            </Text>
          </View>
        </Animated.View>
      )}

      <EditExerciseModal
        visible={editModalVisible}
        exercise={editExerciseData}
        onSave={handleSaveEditedExercise}
        onCancel={handleCancelEdit}
      />
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
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  form: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  setsTable: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  headerText: {
    color: "#999",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  repsColumn: {
    width: "40%",
    paddingHorizontal: 5,
  },
  weightColumn: {
    width: "40%",
    paddingHorizontal: 5,
  },
  rpeColumn: {
    width: "20%",
    paddingHorizontal: 5,
  },
  setInput: {
    marginBottom: 0,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#228B22",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#228B22",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  exerciseList: {
    marginTop: 20,
  },
  exerciseItem: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseDetails: {
    color: "#ccc",
    marginTop: 5,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    backgroundColor: "#222",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    transform: [{ scale: 1 }],
  },
  successIcon: {
    fontSize: 50,
    color: "#2ecc71",
    marginBottom: 15,
  },
  successText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  successSubtext: {
    color: "#999",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  exerciseItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  exerciseActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 2,
  },
  iconButton: {
    marginHorizontal: 2,
    padding: 2,
  },
});

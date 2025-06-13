import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export type SetType = { reps: number; weight: number; rpe?: number };
export type ExerciseType = { exercise: string; sets: SetType[] };

interface EditExerciseModalProps {
  visible: boolean;
  exercise: ExerciseType | null;
  onSave: (exercise: ExerciseType) => void;
  onCancel: () => void;
}

const EditExerciseModal: React.FC<EditExerciseModalProps> = ({
  visible,
  exercise,
  onSave,
  onCancel,
}) => {
  const [localExercise, setLocalExercise] = useState<ExerciseType>({
    exercise: "",
    sets: [{ reps: 0, weight: 0 }],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (exercise) {
      setLocalExercise(exercise);
    }
  }, [exercise]);

  const updateSet = (index: number, field: keyof SetType, value: string) => {
    const numericValue = value === "" ? 0 : parseInt(value) || 0;
    setLocalExercise((prev) => {
      const newSets = [...prev.sets];
      newSets[index] = { ...newSets[index], [field]: numericValue };
      return { ...prev, sets: newSets };
    });
  };

  const addSet = () => {
    setLocalExercise((prev) => ({
      ...prev,
      sets: [...prev.sets, { reps: 0, weight: 0 }],
    }));
  };

  const removeSet = (index: number) => {
    setLocalExercise((prev) => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    // Filter out sets where both reps and weight are 0
    const filteredSets = localExercise.sets.filter(
      (set) => !(set.reps === 0 && set.weight === 0)
    );
    if (filteredSets.length === 0) {
      setError(
        "Please enter at least one set with reps or weight greater than 0."
      );
      return;
    }
    setError(null);
    onSave({ ...localExercise, sets: filteredSets });
  };

  if (!exercise) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Exercise</Text>
          <TextInput
            style={styles.input}
            placeholder="Exercise Name"
            placeholderTextColor="#666"
            value={localExercise.exercise}
            onChangeText={(text) =>
              setLocalExercise((prev) => ({ ...prev, exercise: text }))
            }
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <ScrollView style={{ maxHeight: 200 }}>
            {localExercise.sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <Text style={styles.setLabel}>Set {index + 1}</Text>
                <TextInput
                  style={styles.setInput}
                  placeholder="Reps"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={set.reps.toString()}
                  onChangeText={(text) => updateSet(index, "reps", text)}
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="Weight"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={set.weight.toString()}
                  onChangeText={(text) => updateSet(index, "weight", text)}
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="RPE"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={
                    set.rpe !== undefined && set.rpe !== null
                      ? set.rpe.toString()
                      : ""
                  }
                  onChangeText={(text) => updateSet(index, "rpe", text)}
                />
                {localExercise.sets.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeSet(index)}
                    style={styles.removeSetButton}
                  >
                    <Text style={styles.removeSetText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={addSet} style={styles.addSetButton}>
            <Text style={styles.addSetText}>+ Add Set</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: "stretch",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setLabel: {
    color: "#fff",
    marginRight: 8,
    width: 50,
  },
  setInput: {
    backgroundColor: "#444",
    color: "#fff",
    borderRadius: 6,
    padding: 6,
    marginHorizontal: 4,
    width: 60,
    fontSize: 15,
  },
  removeSetButton: {
    marginLeft: 8,
    padding: 4,
  },
  removeSetText: {
    color: "#ff4444",
    fontSize: 18,
  },
  addSetButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  addSetText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
});

export default EditExerciseModal;

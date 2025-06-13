import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface AddSubtractProps {
  value: number;
  onAdd: () => void;
  onSubtract: () => void;
  min?: number;
  max?: number;
  size?: number;
}

const AddSubtract: React.FC<AddSubtractProps> = ({
  value,
  onAdd,
  onSubtract,
  min,
  max,
  size = 28,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onSubtract}
        disabled={min !== undefined && value <= min}
        style={[
          styles.button,
          min !== undefined && value <= min && styles.disabled,
        ]}
      >
        <Feather name="minus" size={size * 0.7} color="#bbb" />
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity
        onPress={onAdd}
        disabled={max !== undefined && value >= max}
        style={[
          styles.button,
          max !== undefined && value >= max && styles.disabled,
        ]}
      >
        <Feather name="plus" size={size * 0.7} color="#bbb" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  button: {
    backgroundColor: "#444",
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: "center",
  },
});

export default AddSubtract;

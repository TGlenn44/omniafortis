import { View, Text } from "react-native";

export default function LogWorkoutScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff" }}>Log Workout</Text>
    </View>
  );
}

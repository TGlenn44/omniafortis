import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../features/home/HomeScreen";
import LogWorkoutScreen from "../features/workout/LogWorkoutScreen";
import NeuroLiftScreen from "../features/mindset/NeuroLiftScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Log" component={LogWorkoutScreen} />
        <Tab.Screen name="Mindset" component={NeuroLiftScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

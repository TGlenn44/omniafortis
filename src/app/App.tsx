import { StatusBar } from "expo-status-bar";
import { AppProvider } from "./AppProvider";
import Navigation from "./Navigation";

export default function App() {
  return (
    <AppProvider>
      <Navigation />
      <StatusBar style="light" />
    </AppProvider>
  );
}

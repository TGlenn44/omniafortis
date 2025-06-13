import { StatusBar } from "expo-status-bar";
import { AppProvider } from "./src/app/AppProvider";
import Navigation from "./src/app/Navigation";

export default function App() {
  return (
    <AppProvider>
      <Navigation />
      <StatusBar style="light" />
    </AppProvider>
  );
}

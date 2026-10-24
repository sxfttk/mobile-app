import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Browser on this computer: localhost. Expo Go on a phone: use your computer's IP, e.g. ws://192.168.1.20:8000/ws
const WS_URL = "ws://localhost:8000/ws";

// Date/Time fields may arrive as a number (milliseconds) or as text
function formatDate(value: any) {
  if (value === null || value === undefined || value === "") return "";
  const d = new Date(typeof value === "number" ? value : isNaN(Number(value)) ? value : Number(value));
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("error");
    ws.onmessage = (m) => {
      try {
        setAlerts((prev) => [JSON.parse(m.data), ...prev].slice(0, 10));
      } catch (e) {
        console.error("Invalid event JSON", e);
      }
    };
    return () => ws.close();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor: "#FFFFFF" }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#10243A" }}>Requisition Alerts</Text>
        <Text style={{ color: "#666", marginBottom: 16 }}>{status}</Text>
        <ScrollView>
          {alerts.length === 0 && (
            <Text style={{ color: "#10243A" }}>Waiting for Requisition alerts...</Text>
          )}
          {alerts.map((a, i) => (
            <View key={i} style={{ marginBottom: 16, padding: 12, backgroundColor: "#FFF5F3",
                                   borderLeftWidth: 4, borderLeftColor: "#c62828" }}>
              <Text style={{ fontWeight: "700", color: "#10243A" }}>
                {a.Job_Title__c} ({a.Requisition_Number__c})
              </Text>
              <Text style={{ color: "#10243A" }}>Priority: {a.Priority__c}</Text>
              <Text style={{ color: "#10243A" }}>Role Category: {a.Role_Category__c}</Text>
              <Text style={{ color: "#10243A" }}>Location: {a.Location__c}</Text>
              <Text style={{ color: "#10243A" }}>Employment Type: {a.Employment_Type__c}</Text>
              <Text style={{ color: "#10243A" }}>Client: {a.Client_Organisation_Name__c}</Text>
              <Text style={{ color: "#10243A" }}>Published: {formatDate(a.Published_Datetime__c)}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
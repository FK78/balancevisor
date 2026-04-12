import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Trash2 } from "lucide-react-native";
import { spacing } from "@/constants/theme";

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
  confirmTitle?: string;
  confirmMessage?: string;
}

export function SwipeableRow({ children, onDelete, confirmTitle = "Delete", confirmMessage = "Are you sure?" }: Props) {
  const handleDelete = () => {
    Alert.alert(confirmTitle, confirmMessage, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.container}>
      {children}
      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Trash2 size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "stretch" },
  deleteBtn: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: -12,
  },
});

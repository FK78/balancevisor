import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef, useCallback } from "react";
import { Stack } from "expo-router";
import { Send } from "lucide-react-native";
import { useTheme } from "@/lib/theme-context";
import { spacing, fontSize, radius } from "@/constants/theme";
import { sendChatMessage, type ChatMessage } from "@/lib/chat-client";

export default function ChatScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Add placeholder for assistant
    const assistantPlaceholder: ChatMessage = { role: "assistant", content: "" };
    setMessages([...updatedMessages, assistantPlaceholder]);

    try {
      await sendChatMessage(updatedMessages, (streamedText) => {
        setMessages([...updatedMessages, { role: "assistant", content: streamedText }]);
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to get response";
      setMessages([...updatedMessages, { role: "assistant", content: `Error: ${errMsg}` }]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "AI Assistant",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.role === "user";
            return (
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble, { backgroundColor: isUser ? colors.primary : colors.card }]}>
                <Text style={{ color: isUser ? colors.primaryForeground : colors.foreground, fontSize: fontSize.sm }}>
                  {item.content || "..."}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={{ color: colors.mutedForeground, fontSize: fontSize.base, textAlign: "center" }}>
                Ask anything about your finances
              </Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Ask about your finances..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isStreaming}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isStreaming}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: colors.primary, opacity: pressed || !input.trim() || isStreaming ? 0.5 : 1 },
            ]}
          >
            <Send size={18} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  messageList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  bubble: { padding: spacing.md, borderRadius: radius.lg, maxWidth: "85%" },
  userBubble: { alignSelf: "flex-end" },
  assistantBubble: { alignSelf: "flex-start" },
  emptyChat: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    fontSize: fontSize.base,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

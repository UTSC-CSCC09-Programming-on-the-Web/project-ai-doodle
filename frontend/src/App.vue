<template>
  <router-view />
</template>

<script setup>
import { ref } from "vue";
import { chat } from "./services/aiService.js";

const messages = ref([]);
const newMessage = ref("");
const isLoading = ref(false);

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return;

  const userMessage = newMessage.value.trim();
  
  // Add user message
  messages.value.push({
    role: "user",
    content: userMessage,
  });

  newMessage.value = "";
  isLoading.value = true;

  try {
    // Call AI API
    const response = await chat(userMessage);
    
    // Add AI reply
    messages.value.push({
      role: "assistant",
      content: response.reply,
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    
    // Add error message
    messages.value.push({
      role: "assistant",
      content: "Sorry, I encountered an error. Please try again later.",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

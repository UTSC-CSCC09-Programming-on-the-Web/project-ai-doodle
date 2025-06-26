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

<template>
  <div style="min-height: 100vh; background-color: #f3f4f6; padding: 16px;">
    <div style="max-width: 2400px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #1f2937;">AI Chat</h1>
      </div>
      
      <!-- Messages Box -->
      <div style="background-color: #e5e7eb; border: 8px solid black; border-radius: 8px; padding: 24px; margin-bottom: 16px; height: 500px; overflow-y: auto;">
        <div v-for="(message, index) in messages" :key="index" class="mb-6">
          <!-- User Message -->
          <div v-if="message.role === 'user'" class="flex justify-end">
            <div class="bg-white border-8 border-blue-600 rounded-lg p-6 max-w-lg">
              <div class="mb-3">
                <strong>You:</strong>
              </div>
              <div class="bg-blue-50 border-6 border-blue-300 rounded p-4">
                {{ message.content }}
              </div>
            </div>
          </div>
          
          <!-- AI Message -->
          <div v-if="message.role === 'assistant'" class="flex justify-start">
            <div class="bg-white border-8 border-green-600 rounded-lg p-6 max-w-lg">
              <div class="mb-3">
                <strong>AI Assistant:</strong>
              </div>
              <div class="bg-green-50 border-6 border-green-300 rounded p-4">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white border-8 border-green-600 rounded-lg p-6">
            <div class="mb-3">
              <strong>AI Assistant:</strong>
            </div>
            <div class="bg-green-50 border-6 border-green-300 rounded p-4">
              AI is thinking...
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input Area -->
      <div style="background-color: white; border: 8px solid black; border-radius: 8px; padding: 12px;">
        <div style="display: flex; gap: 16px;">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            style="flex: 1; padding: 8px 16px; border: 6px solid #4b5563; border-radius: 8px; font-size: 16px;"
            :disabled="isLoading"
            @keyup.enter="sendMessage"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || isLoading"
            style="padding: 8px 24px; background-color: #3b82f6; color: white; border-radius: 8px; border: 6px solid #1d4ed8; font-size: 16px; font-weight: bold; cursor: pointer;"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

<template>
  <div class="p-8 max-w-4xl mx-auto text-center">
    <h1 class="text-3xl font-bold text-blue-700 mb-4">
      Game Room - {{ room?.name || "Loading..." }}
    </h1>
    <p class="text-gray-700 mb-2">
      Room ID: <span class="font-mono text-lg">{{ roomId }}</span>
    </p>
    <p v-if="room && user && room.creatorUsername === user.username" class="text-gray-700 mb-2">
      Room Passcode: <span class="font-mono text-lg">{{ room.passcode }}</span>
    </p>
    <p class="text-gray-700 mb-6">
      Player: <span class="font-semibold">{{ user?.username }}</span>
    </p>

    <div class="bg-gray-100 p-6 rounded shadow">
      <p class="text-lg text-gray-600 mb-4">Game logic goes here...</p>
      <button
        @click="handleLeave"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Leave Room
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCurrentUser, getRoomById } from "../services/api-service";

const route = useRoute();
const router = useRouter();
const roomId = route.params.id;
const room = ref(null);
const user = ref(null);

onMounted(async () => {
  try {
    room.value = await getRoomById(roomId);
    user.value = await getCurrentUser();
  } catch (err) {
    router.push("/login");
  }
});

const handleLeave = () => {
  router.push("/home");
};
</script>

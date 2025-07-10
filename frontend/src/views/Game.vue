<template>
  <div class="p-8 max-w-4xl mx-auto text-center relative">
    <button
      @click="handleLeave"
      class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Leave Room
    </button>

    <h1 class="text-3xl font-bold text-blue-700 mb-4">
      Game Room - {{ room?.name || "Loading..." }}
    </h1>
    <p class="text-gray-700 mb-2">
      Room ID: <span class="font-mono text-lg">{{ roomId }}</span>
    </p>
    <p
      v-if="room && user && room.creatorUsername === user.username"
      class="text-gray-700 mb-2"
    >
      Room Passcode: <span class="font-mono text-lg">{{ room.passcode }}</span>
    </p>
    <p class="text-gray-700 mb-6">
      Player: <span class="font-semibold">{{ user?.username }}</span>
    </p>

    <div class="bg-white p-6 rounded shadow text-left mb-6">
      <h2 class="text-xl font-semibold mb-2">Players in Room</h2>
      <ul>
        <li
          v-for="u in users"
          :key="u.username"
          class="flex justify-between py-1 border-b"
        >
          <span>
            {{ u.username }}
            <span
              v-if="u.username === room?.creatorUsername"
              class="text-sm text-blue-500 ml-1"
            >
              (Host)
            </span>
          </span>
          <span :class="u.ready ? 'text-green-600' : 'text-gray-500'">
            {{ u.ready ? "Ready" : "Not Ready" }}
          </span>
        </li>
      </ul>
    </div>

    <div class="mt-4 space-x-4">
      <button
        @click="toggleReady"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {{ ready ? "Cancel Ready" : "Ready" }}
      </button>

      <button
        v-if="user?.username === room?.creatorUsername"
        :disabled="!canStartGame"
        @click="startGame"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Start Game
      </button>
      <p
        v-if="!canStartGame && startRestrictionReason"
        class="mt-2 text-sm text-red-600"
      >
        {{ startRestrictionReason }}
      </p>
      <p
        v-if="canStartGame && user?.username !== room?.creatorUsername"
        class="mt-2 text-sm text-blue-600"
      >
        All players are ready. Waiting for the host to start the game…
      </p>

      <p v-if="gameStarting" class="mt-6 text-xl font-bold text-purple-600">
        Game starting, redirecting...
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { io } from "socket.io-client";
import { getCurrentUser, getRoomById } from "../services/api-service";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();

const socket = io("http://localhost:3000", { withCredentials: true });

const roomId = route.params.id;
const room = ref(null);
const user = ref(null);
const users = ref([]);
const ready = ref(false);
const gameStarting = ref(false);

const canStartGame = computed(() => {
  return users.value.length >= 4 && users.value.every((u) => u.ready);
});

const startRestrictionReason = computed(() => {
  if (users.value.length < 4) {
    return "At least 4 players are required to start the game.";
  } else if (!users.value.every((u) => u.ready)) {
    return "All players must be ready to start the game.";
  }
  return null;
});

onMounted(async () => {
  try {
    user.value = await getCurrentUser();
    room.value = await getRoomById(roomId);

    socket.emit("joinRoom", {
      roomId,
      username: user.value.username,
    });

    socket.on("roomUpdate", (roomUsers) => {
      users.value = roomUsers;
      const currentUser = roomUsers.find(
        (u) => u.username === user.value.username,
      );
      if (currentUser) {
        ready.value = currentUser.ready;
      }
    });

    // Listen for game start event and redirect to game page
    socket.on("gameStarted", (data) => {
      gameStarting.value = true;
      console.log("Game started, navigating to game page...");

      // Delay 1 second for user to see the notification
      setTimeout(() => {
        router.push(`/room/${roomId}/game`);
      }, 1000);
    });
  } catch (err) {
    router.push("/login");
  }
});

const handleLeave = () => {
  socket.emit("leaveRoom", {
    roomId,
    username: user.value.username,
  });
  socket.disconnect();
  router.push("/home");
};

function toggleReady() {
  ready.value = !ready.value;
  socket.emit("setReady", {
    roomId,
    username: user.value.username,
    ready: ready.value,
  });
}

function startGame() {
  const everyoneReady = users.value.every((u) => u.ready);
  if (user.value.username === room.value.creatorUsername && everyoneReady) {
    socket.emit("startGame", roomId);
  }
}

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});
</script>

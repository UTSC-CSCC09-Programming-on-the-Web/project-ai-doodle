<template>
  <div class="page-container">
    <div class="content-container">
      <!-- Top Navigation -->
      <nav class="flex justify-between items-center mb-8">
        <div class="flex items-center space-x-4">
          <h1 class="text-gradient text-3xl font-bold">Game Room</h1>
          <span class="badge badge-accent">Waiting</span>
        </div>

        <button @click="handleLeave" class="btn-danger btn-sm">
          <span class="mr-2">🚪</span>
          Leave Room
        </button>
      </nav>

      <!-- Room Information Card -->
      <div
        class="card-gradient p-8 mb-8 text-white text-center animate-fade-in"
      >
        <div class="space-y-4">
          <div class="text-6xl">🎯</div>
          <h2 class="text-3xl font-bold">
            {{ room?.name || "Loading..." }}
          </h2>
          <div class="grid sm:grid-cols-3 gap-4 text-sm max-w-2xl mx-auto">
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <div class="font-medium">Room ID</div>
              <div class="font-mono text-lg">{{ roomId }}</div>
            </div>
            <div
              v-if="room && user && room.creatorUsername === user.username"
              class="bg-white bg-opacity-20 rounded-lg p-3"
            >
              <div class="font-medium">Room Password</div>
              <div class="font-mono text-lg">{{ room.passcode }}</div>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <div class="font-medium">Your Username</div>
              <div class="font-semibold text-lg">{{ user?.username }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Player List -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-6">
              <div
                class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">👥</span>
              </div>
              <h2 class="text-xl font-semibold text-neutral-900">
                Players in Room ({{ users.length }}/8)
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="(u, index) in users"
                :key="u.username"
                class="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors duration-200"
              >
                <div class="flex items-center space-x-3">
                  <!-- Player Avatar -->
                  <div
                    class="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-base"
                  >
                    {{ u.username.charAt(0).toUpperCase() }}
                  </div>

                  <!-- Player Information -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center space-x-2">
                      <span class="font-semibold text-neutral-900 truncate">{{
                        u.username
                      }}</span>

                      <!-- Tags -->
                      <div class="flex space-x-1 flex-shrink-0">
                        <span
                          v-if="u.username === room?.creatorUsername"
                          class="badge badge-primary text-xs"
                        >
                          Host
                        </span>
                        <span
                          v-if="u.username === user?.username"
                          class="badge badge-accent text-xs"
                        >
                          You
                        </span>
                      </div>
                    </div>

                    <!-- Join Order -->
                    <div class="text-xs text-neutral-500">
                      {{ index + 1
                      }}{{
                        index === 0
                          ? "st"
                          : index === 1
                            ? "nd"
                            : index === 2
                              ? "rd"
                              : "th"
                      }}
                      to join
                    </div>
                  </div>
                </div>

                <!-- Ready Status -->
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <div class="flex items-center space-x-1">
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="u.ready ? 'bg-success-500' : 'bg-neutral-300'"
                    ></div>
                    <span
                      class="text-xs font-medium"
                      :class="u.ready ? 'text-success-600' : 'text-neutral-500'"
                    >
                      {{ u.ready ? "Ready" : "Not Ready" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Slots Notice -->
            <div
              v-if="users.length < 4"
              class="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-xl"
            >
              <div class="flex items-center space-x-2 text-warning-800">
                <span class="text-lg">⚠️</span>
                <span class="font-medium"
                  >At least 4 players needed to start the game</span
                >
              </div>
              <p class="text-sm text-warning-700 mt-1">
                Currently {{ users.length }}/4 players, need
                {{ 4 - users.length }} more
              </p>
            </div>
          </div>
        </div>

        <!-- Right Side Control Panel -->
        <div class="space-y-6">
          <!-- Ready Status Control -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">✓</span>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900">
                Ready Status
              </h3>
            </div>

            <div class="space-y-4">
              <!-- Current Status Display -->
              <div
                class="text-center p-4 rounded-xl"
                :class="
                  ready
                    ? 'bg-success-50 border border-success-200'
                    : 'bg-neutral-50 border border-neutral-200'
                "
              >
                <div class="text-3xl mb-2">{{ ready ? "✅" : "⏳" }}</div>
                <p
                  class="font-medium"
                  :class="ready ? 'text-success-700' : 'text-neutral-600'"
                >
                  {{
                    ready ? "You are ready" : "Waiting for your confirmation"
                  }}
                </p>
              </div>

              <!-- Ready Button -->
              <button
                @click="toggleReady"
                class="w-full"
                :class="ready ? 'btn-warning' : 'btn-success'"
              >
                <span class="mr-2">{{ ready ? "⏹️" : "✅" }}</span>
                {{ ready ? "Cancel Ready" : "Confirm Ready" }}
              </button>
            </div>
          </div>

          <!-- Game Start Control -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">🚀</span>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900">Start Game</h3>
            </div>

            <div class="space-y-4">
              <!-- Host Control -->
              <div v-if="user?.username === room?.creatorUsername">
                <button
                  :disabled="!canStartGame"
                  @click="startGame"
                  class="btn-primary w-full"
                  :class="{ 'opacity-50 cursor-not-allowed': !canStartGame }"
                >
                  <span class="mr-2">🎮</span>
                  {{ canStartGame ? "Start Game" : "Waiting for Players" }}
                </button>

                <div v-if="startRestrictionReason" class="mt-3 status-warning">
                  {{ startRestrictionReason }}
                </div>
              </div>

              <!-- Non-Host Waiting -->
              <div v-else class="text-center p-4 bg-primary-50 rounded-xl">
                <div class="text-2xl mb-2">⏳</div>
                <p class="text-sm text-primary-700">
                  {{
                    canStartGame
                      ? "All players ready, waiting for host to start"
                      : "Waiting for other players to be ready"
                  }}
                </p>
              </div>

              <!-- Game Starting -->
              <div
                v-if="gameStarting"
                class="text-center p-4 bg-success-50 rounded-xl"
              >
                <div class="loading-spinner w-8 h-8 mx-auto mb-3"></div>
                <p class="text-lg font-medium text-success-700">
                  Game starting, redirecting...
                </p>
              </div>
            </div>
          </div>

          <!-- Game Rules Quick View -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">📋</span>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900">
                Quick Rules
              </h3>
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex items-start space-x-3">
                <div
                  class="w-6 h-6 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                >
                  1
                </div>
                <span class="text-neutral-700"
                  >AI selects secret word and assigns spy</span
                >
              </div>
              <div class="flex items-start space-x-3">
                <div
                  class="w-6 h-6 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                >
                  2
                </div>
                <span class="text-neutral-700"
                  >Generate AI images based on prompts</span
                >
              </div>
              <div class="flex items-start space-x-3">
                <div
                  class="w-6 h-6 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                >
                  3
                </div>
                <span class="text-neutral-700"
                  >Final player guesses the original word</span
                >
              </div>
              <div class="flex items-start space-x-3">
                <div
                  class="w-6 h-6 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                >
                  4
                </div>
                <span class="text-neutral-700">Find the spy or spy wins</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-neutral-200">
              <p class="text-xs text-neutral-500 text-center">
                🎯 Unleash creativity, test teamwork, enjoy AI art fun
              </p>
            </div>
          </div>
        </div>
      </div>
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

const socket = io(import.meta.env.VITE_BACKEND_URL, { withCredentials: true });

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

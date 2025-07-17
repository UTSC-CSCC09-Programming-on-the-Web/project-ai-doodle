<template>
  <div class="page-container">
    <div class="content-container">
      <!-- Top Navigation -->
      <nav class="flex justify-between items-center mb-8">
        <div class="flex items-center space-x-4">
          <h1 class="text-gradient text-3xl font-bold">AI Doodle</h1>
          <span class="badge badge-primary">Game Lobby</span>
        </div>
        
        <div class="flex items-center space-x-3">
          <button
            @click="goToGenerate"
            class="btn-accent btn-sm"
          >
            <span class="mr-2">🎨</span>
            AI Image Generator
          </button>
          
          <button
            @click="handleLogout"
            class="btn-ghost btn-sm"
          >
            <span class="mr-2">👋</span>
            Logout
          </button>
        </div>
      </nav>

      <!-- Welcome Area -->
      <div class="card-gradient p-8 mb-8 text-white text-center animate-fade-in">
        <div class="space-y-4">
          <div class="text-6xl">🎨</div>
          <h2 class="text-3xl font-bold">Welcome to the AI Art World</h2>
          <p class="text-lg opacity-90">
            Experience the unique multiplayer AI drawing guessing game, unleash creativity and test teamwork!
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Game Rules Card -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <button
              @click="showRules = !showRules"
              class="w-full text-left p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors duration-200 focus:outline-none"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                    <span class="text-white text-lg">📋</span>
                  </div>
                  <h3 class="text-xl font-semibold text-primary-700">Game Rules</h3>
                </div>
                <span class="text-primary-600 transform transition-transform duration-200" :class="{ 'rotate-180': showRules }">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </span>
              </div>
            </button>

            <div v-if="showRules" class="mt-6 space-y-6 animate-slide-up">
              <div class="grid sm:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 class="font-semibold text-neutral-900">Game Start</h4>
                      <p class="text-sm text-neutral-600 mt-1">AI randomly selects a secret word and assigns one player as the spy</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-success-100 text-success-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 class="font-semibold text-neutral-900">Image Generation</h4>
                      <p class="text-sm text-neutral-600 mt-1">The first player (non-spy) sees the word and writes a prompt to generate an AI image</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-accent-100 text-accent-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 class="font-semibold text-neutral-900">Prompt Passing</h4>
                      <p class="text-sm text-neutral-600 mt-1">Next player only sees the previous image and describes it to generate a new image</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-accent-100 text-accent-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                    <div>
                      <h4 class="font-semibold text-neutral-900">Final Guess</h4>
                      <p class="text-sm text-neutral-600 mt-1">Last player guesses the original word</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Win Conditions -->
              <div class="bg-neutral-50 rounded-xl p-4">
                <h4 class="font-semibold text-neutral-900 mb-3 flex items-center">
                  <span class="mr-2">🏆</span>
                  Win Conditions
                </h4>
                <div class="grid sm:grid-cols-2 gap-4 text-sm">
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                      <span class="text-neutral-700">Correct guess: Non-spy players win</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="w-2 h-2 bg-danger-500 rounded-full"></span>
                      <span class="text-neutral-700">Wrong guess: Vote to find the spy</span>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <span class="w-2 h-2 bg-warning-500 rounded-full"></span>
                      <span class="text-neutral-700">Spy found: Other players win</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
                      <span class="text-neutral-700">Spy hidden: Spy wins</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detailed Rules -->
              <details class="bg-primary-50 rounded-xl p-4">
                <summary class="cursor-pointer text-primary-700 font-medium hover:text-primary-800 transition-colors">
                  Click for detailed rules
                </summary>
                <div class="mt-3 space-y-2 text-sm text-neutral-600">
                  <p>• The spy never sees the original word and is never the first player</p>
                  <p>• Each player can only see the previous image, not the full chain</p>
                  <p>• Prompts should not directly reveal the secret word or synonyms</p>
                  <p>• Final guesses must be reasonable synonyms to be accepted</p>
                  <p>• Voting is anonymous and majority rules</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        <!-- Right Side Quick Actions -->
        <div class="space-y-6">
          <!-- Join Room -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-lg">🚪</span>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900">Join Room</h3>
            </div>

            <form @submit.prevent="handleJoinRoom" class="space-y-4">
              <div>
                <label class="form-label">Room Name</label>
                <input
                  v-model="joinName"
                  required
                  type="text"
                  class="form-input"
                  placeholder="Enter room name"
                />
              </div>
              <div>
                <label class="form-label">Room Password</label>
                <input
                  v-model="joinPasscode"
                  required
                  type="password"
                  class="form-input"
                  placeholder="Enter room password"
                />
              </div>
              <button
                type="submit"
                class="btn-primary w-full"
              >
                <span class="mr-2">🎮</span>
                Join Room
              </button>
            </form>

            <div v-if="joinError" class="mt-4 status-danger">
              {{ joinError }}
            </div>
          </div>

          <!-- Create Room -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-lg">➕</span>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900">Create Room</h3>
            </div>

            <form @submit.prevent="handleCreateRoom" class="space-y-4">
              <div>
                <label class="form-label">Room Name</label>
                <input
                  v-model="newRoom.name"
                  required
                  type="text"
                  class="form-input"
                  placeholder="Give your room a name"
                />
              </div>
              <div>
                <label class="form-label">Room Password</label>
                <input
                  v-model="newRoom.passcode"
                  required
                  type="password"
                  class="form-input"
                  placeholder="Set room password"
                />
              </div>
              <button
                type="submit"
                class="btn-success w-full"
              >
                <span class="mr-2">🏗️</span>
                Create Room
              </button>
            </form>

            <div v-if="createStatus" class="mt-4 status-success">
              {{ createStatus }}
            </div>
          </div>

          <!-- Game Stats -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-lg">📊</span>
              </div>
              <h3 class="text-xl font-semibold text-neutral-900">Game Info</h3>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-neutral-600">Recommended Players</span>
                <span class="font-semibold">4-8 people</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-neutral-600">Average Duration</span>
                <span class="font-semibold">15-30 minutes</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-neutral-600">Difficulty Level</span>
                <div class="flex space-x-1">
                  <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                  <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                  <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                  <span class="w-2 h-2 bg-neutral-300 rounded-full"></span>
                  <span class="w-2 h-2 bg-neutral-300 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  logout,
  getCurrentUser,
  createRoom,
  joinRoomByName,
} from "../services/api-service";
import { ref, onMounted } from "vue";

const router = useRouter();
const user = ref(null);
const showRules = ref(false);
const joinName = ref("");
const joinPasscode = ref("");
const joinError = ref("");

function goToGenerate() {
  router.push("/generate");
}

const handleLogout = async () => {
  try {
    await logout();
    router.push("/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

const newRoom = ref({
  name: "",
  passcode: "",
});

const createStatus = ref("");

const handleCreateRoom = async () => {
  try {
    const roomData = {
      ...newRoom.value,
      creatorUsername: user.value.username,
    };
    const res = await createRoom(roomData);
    createStatus.value = `Room "${res.name}" created successfully!`;
    router.push(`/room/${res.id}`);
  } catch (err) {
    createStatus.value = err?.response?.data?.error || "Room creation failed";
  }
};

const handleJoinRoom = async () => {
  joinError.value = "";
  try {
    const res = await joinRoomByName(joinName.value, joinPasscode.value);
    router.push(`/room/${res.id}`);
  } catch (err) {
    joinError.value = err?.message || "Failed to join room";
  }
};

onMounted(async () => {
  try {
    const data = await getCurrentUser();
    user.value = data;
  } catch (err) {
    router.push("/login");
  }
});
</script>

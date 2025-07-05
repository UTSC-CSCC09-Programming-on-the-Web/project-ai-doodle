<template>
  <div class="p-10 text-center relative">
    <button
      @click="goToGenerate"
      class="absolute top-4 left-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    >
      Generate Image using AI
    </button>

    <button
      @click="handleLogout"
      class="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>

    <h1 class="text-3xl font-bold text-blue-600">Welcome Home - AI Doodle</h1>
    <p class="mt-4 text-gray-700">You are logged in and subscribed!</p>

    <div
      class="mt-10 text-left max-w-3xl mx-auto bg-gray-100 p-6 rounded shadow"
    >
      <button
        @click="showRules = !showRules"
        class="w-full text-left text-xl font-semibold text-gray-800 mb-2 focus:outline-none bg-blue-200 hover:bg-blue-300 rounded px-4 py-2 transition-colors"
      >
        Game Rules
        <span class="float-right text-gray-600">{{
          showRules ? "▲ Hide" : "▼ Show"
        }}</span>
      </button>

      <div v-if="showRules" class="space-y-2 mt-4 text-gray-700">
        <p>
          <strong>1. Game Start:</strong> AI randomly selects a secret word and
          assigns one player as the Spy.
        </p>
        <p>
          <strong>2. Image Generation:</strong> The first player (always a
          non-Spy) sees the word and writes a prompt to generate an AI image.
        </p>
        <p>
          <strong>3. Prompt Passing:</strong> The next player sees only the
          previous image and describes it to generate a new image.
        </p>
        <p>
          <strong>4. Final Guess:</strong> The last player guesses the original
          word (or a synonym).
        </p>
        <ul class="list-disc list-inside ml-6 text-gray-700">
          <li><strong>If correct:</strong> All players except the Spy win.</li>
          <li>
            <strong>If incorrect:</strong> Everyone sees the full image chain
            and votes on who is the Spy.
            <ul class="list-disc list-inside ml-6 mt-1">
              <li>
                If the Spy is found, the rest win; otherwise, the Spy wins.
              </li>
            </ul>
          </li>
        </ul>

        <details class="mt-4">
          <summary class="cursor-pointer text-blue-600 hover:underline">
            Click for more details
          </summary>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li>
              The Spy never sees the original word (not the first player).
            </li>
            <li>
              Each player can only see the previous image, not the full chain.
            </li>
            <li>
              Prompts should not directly reveal the secret word or synonyms
              (must be descriptive).
            </li>
            <li>Final guesses must be reasonable synonyms to be accepted.</li>
            <li>Voting is anonymous and majority rules.</li>
          </ul>
        </details>
      </div>
    </div>

    <div class="mt-10 text-left max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Join Existing Room</h2>

      <form @submit.prevent="handleJoinRoom" class="space-y-4">
        <div>
          <label class="block font-medium mb-1">Room Name</label>
          <input
            v-model="joinName"
            required
            type="text"
            class="w-full p-2 border rounded"
            placeholder="Enter room name"
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Passcode</label>
          <input
            v-model="joinPasscode"
            required
            type="password"
            class="w-full p-2 border rounded"
            placeholder="Enter passcode"
          />
        </div>
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Join Room
        </button>
      </form>

      <p v-if="joinError" class="mt-4 text-sm text-red-600 font-medium">
        {{ joinError }}
      </p>
    </div>

    <div class="mt-10 text-left max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 class="text-xl font-semibold mb-4">Create a Room</h2>

      <form @submit.prevent="handleCreateRoom" class="space-y-4">
        <div>
          <label class="block font-medium mb-1">Room Name</label>
          <input
            v-model="newRoom.name"
            required
            type="text"
            class="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label class="block font-medium mb-1">Passcode</label>
          <input
            v-model="newRoom.passcode"
            required
            type="password"
            class="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
        >
          Create Room
        </button>
      </form>

      <p v-if="createStatus" class="mt-4 text-sm text-green-600 font-medium">
        {{ createStatus }}
      </p>
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

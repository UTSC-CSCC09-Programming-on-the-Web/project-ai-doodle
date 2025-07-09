<template>
  <div class="p-6 text-center">
    <h1 class="text-2xl font-bold mb-4">
      {{ user ? `Welcome, ${user.username}!` : "AI Doodle Login" }}
    </h1>

    <div v-if="user">
      <button
        @click="goToHome"
        class="bg-green-600 text-white px-4 py-2 rounded mb-2"
      >
        Go to Home
      </button>

      <button
        @click="handleLogout"
        class="bg-red-500 text-white px-4 py-2 rounded ml-2"
      >
        Logout
      </button>
    </div>

    <div v-else>
      <a
        :href="getGoogleLoginUrl()"
        class="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login with Google
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getCurrentUser,
  logout,
  getGoogleLoginUrl,
} from "../services/api-service";

const user = ref(null);
const router = useRouter();

async function fetchUser() {
  try {
    const data = await getCurrentUser();
    user.value = data;
  } catch (err) {
    user.value = null;
  }
}

async function handleLogout() {
  try {
    await logout();
    user.value = null;
    router.push("/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

function goToHome() {
  router.push("/home");
}

onMounted(fetchUser);
</script>

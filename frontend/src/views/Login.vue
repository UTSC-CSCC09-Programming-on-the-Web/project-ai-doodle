<template>
  <div class="p-6 text-center">
    <h1 class="text-2xl font-bold mb-4">AI Doodle Login</h1>

    <div v-if="user">
      <p class="mb-2">Hello, {{ user.username }}!</p>
      <p class="mb-4">
        Subscription: {{ user.isSubscribed ? "Active" : "Inactive" }}
      </p>
      <button
        v-if="!user.isSubscribed"
        @click="goToSubscribe"
        class="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Subscribe Now
      </button>
      <button @click="handleLogout" class="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>

    <div v-else>
      <a :href="getGoogleLoginUrl()" class="bg-blue-600 text-white px-4 py-2 rounded">
        Login with Google
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCurrentUser, logout, getGoogleLoginUrl } from "../services/api-service";

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

function goToSubscribe() {
  router.push("/subscribe");
}

onMounted(fetchUser);
</script>

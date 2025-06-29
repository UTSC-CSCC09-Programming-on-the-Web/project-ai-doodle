<template>
  <div class="p-10 text-center">
    <h1 class="text-3xl font-bold text-blue-600">Welcome Home</h1>
    <p class="mt-4 text-gray-700">You are logged in and subscribed!</p>

    <div class="mt-8">
      <button
        @click="handleLogout"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { logout, getCurrentUser } from "../services/api-service";
import { onMounted } from "vue";

const router = useRouter();

const handleLogout = async () => {
  try {
    await logout();
    router.push("/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

onMounted(async () => {
  try {
    await getCurrentUser();
  } catch (err) {
    router.push("/login");
  }
});
</script>

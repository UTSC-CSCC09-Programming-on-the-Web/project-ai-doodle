<template>
  <!-- Just for quick checking that both ends are working -->
  <div class="p-10 text-center">
    <h1 class="text-3xl font-bold text-green-600">Frontend is working</h1>
    <p class="mt-4 text-gray-700">Backend says: {{ message }}</p>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const message = ref("Loading...");

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/hello");
    const data = await res.json();
    message.value = data.message;
  } catch (err) {
    message.value = "Failed to fetch backend";
  }
});
</script>

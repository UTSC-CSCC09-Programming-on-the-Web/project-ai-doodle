<template>
  <div class="p-10 text-center text-gray-600">
    <p>Checking login status...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      credentials: "include",
    });

    if (!res.ok) {
      return router.push("/login");
    }

    const user = await res.json();

    if (user.isSubscribed) {
      router.push("/home");
    } else {
      router.push("/subscribe");
    }
  } catch (e) {
    router.push("/login");
  }
});
</script>

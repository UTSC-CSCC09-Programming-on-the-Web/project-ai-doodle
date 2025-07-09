<template>
  <div class="p-10 text-center text-gray-600">
    <p>Checking login status...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCurrentUser } from "../services/api-service";

const router = useRouter();

onMounted(async () => {
  try {
    const user = await getCurrentUser();
    // 直接跳转到主页，绕过订阅检查
    router.push("/home");
  } catch (err) {
    router.push("/login");
  }
});
</script>

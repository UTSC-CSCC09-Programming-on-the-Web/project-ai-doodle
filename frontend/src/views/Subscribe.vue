<template>
  <div class="p-10 text-center">
    <h2 class="text-2xl font-semibold text-red-600">Subscription Required</h2>
    <p class="mt-2 text-gray-700">
      Please complete the payment to continue using AI Doodle.
    </p>

    <div class="mt-8 flex flex-col items-center space-y-6">
      <button
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg w-64"
        @click="goToCheckout"
      >
        Subscribe with Stripe
      </button>

      <button
        @click="goToImageGeneration"
        class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg w-64"
      >
        🎨 AI Image Generator
      </button>

      <div class="mt-8">
        <button
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { createStripeCheckout, logout, getCurrentUser } from "../services/api-service";
import { onMounted } from "vue";

const router = useRouter();

const goToImageGeneration = () => {
  router.push("/generate");
};

const goToCheckout = async () => {
  try {
    const { url } = await createStripeCheckout();
    if (url) {
      window.location.href = url;
    } else {
      alert("Stripe Checkout URL missing");
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed");
  }
};

const handleLogout = async () => {
  try {
    await logout();
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
    alert("Logout failed");
  }
};

onMounted(async () => {
  try {
    await fetchUser();
  } catch (err) {
    router.push("/login");
  }
});
</script>

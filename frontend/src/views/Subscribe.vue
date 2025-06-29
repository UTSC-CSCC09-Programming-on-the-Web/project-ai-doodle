<template>
  <div class="p-10 text-center">
    <h2 class="text-2xl font-semibold text-red-600">Subscription Required</h2>
    <p class="mt-2 text-gray-700">
      Plase complete the payment to continue using AI Doodle.
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
          @click="logout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToImageGeneration = () => {
  router.push("/generate");
};

async function goToCheckout() {
  try {
    const res = await fetch("http://localhost:3000/api/stripe/checkout", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to redirect to Stripe Checkout");
    }
  } catch (err) {
    console.error("Error during checkout:", err);
    alert("Checkout failed");
  }
}

async function logout() {
  try {
    await fetch("http://localhost:3000/api/auth/logout", {
      credentials: "include",
    });
    router.push("/login");
  } catch (err) {
    alert("Logout failed.");
  }
}
</script>

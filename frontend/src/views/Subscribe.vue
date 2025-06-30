<template>
  <div class="p-10 text-center">
    <h2
      class="text-2xl font-semibold"
      :class="user?.isSubscribed ? 'text-green-600' : 'text-red-600'"
    >
      {{ user?.isSubscribed ? `${user.username}, you are already subscribed!` : 'Subscription Required' }}
    </h2>

    <p class="mt-2 text-gray-700">
      {{ user?.isSubscribed
        ? 'Click below to go to the main application.'
        : 'Please complete the payment to continue using AI Doodle.' }}
    </p>

    <div class="mt-8 flex flex-col items-center space-y-6">
      <button
        v-if="!user?.isSubscribed"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg w-64"
        @click="goToCheckout"
      >
        Subscribe with Stripe
      </button>

      <button
        v-if="user?.isSubscribed"
        @click="goToHome"
        class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg w-64"
      >
        Go to Home
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
import { onMounted, ref } from "vue";

const router = useRouter();
const user = ref(null);

const goToHome = () => {
  router.push("/home");
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
    const data = await getCurrentUser();
    user.value = data;
  } catch (err) {
    router.push("/login");
  }
});
</script>

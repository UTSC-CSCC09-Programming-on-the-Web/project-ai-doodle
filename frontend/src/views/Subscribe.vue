<template>
  <div class="page-container">
    <div class="content-container flex items-center justify-center min-h-screen">
      <div class="w-full max-w-2xl">
        <!-- Main Title -->
        <div class="text-center mb-8">
          <h1 class="text-gradient text-4xl font-bold mb-2">
            AI Doodle Pro
          </h1>
          <p class="text-neutral-600 text-lg">
            Unlock the complete AI drawing experience
          </p>
        </div>

        <!-- Subscription Status Card -->
        <div class="card p-8 animate-fade-in">
          <div v-if="user?.isSubscribed" class="text-center space-y-6">
            <!-- Subscribed Status -->
            <div class="space-y-4">
              <div class="w-24 h-24 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto">
                ✓
              </div>
              
              <div>
                <h2 class="text-2xl font-bold text-success-700 mb-2">
                  Subscription Active!
                </h2>
                <p class="text-neutral-600">
                  Welcome <span class="font-semibold text-primary-600">{{ user.username }}</span>, you have successfully subscribed to AI Doodle Pro
                </p>
              </div>
            </div>

            <!-- Member Benefits Display -->
            <div class="bg-gradient-to-r from-success-50 to-primary-50 rounded-xl p-6">
              <h3 class="font-semibold text-neutral-900 mb-4 flex items-center justify-center">
                <span class="mr-2">🌟</span>
                Your Exclusive Benefits
              </h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <span class="text-success-600 text-sm">🎨</span>
                  </div>
                  <span class="text-sm text-neutral-700">Unlimited AI image generation</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 text-sm">🏆</span>
                  </div>
                  <span class="text-sm text-neutral-700">Exclusive game rooms</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                    <span class="text-accent-600 text-sm">⚡</span>
                  </div>
                  <span class="text-sm text-neutral-700">Priority processing</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                    <span class="text-warning-600 text-sm">🎭</span>
                  </div>
                  <span class="text-sm text-neutral-700">Advanced game modes</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                @click="goToHome"
                class="btn-primary btn-lg w-full"
              >
                <span class="mr-2">🏠</span>
                Go to Game Lobby
              </button>
              
              <button
                @click="handleLogout"
                class="btn-ghost w-full"
              >
                <span class="mr-2">👋</span>
                Logout
              </button>
            </div>
          </div>

          <!-- Not Subscribed State -->
          <div v-else class="space-y-8">
            <!-- Subscription Description -->
            <div class="text-center space-y-4">
              <div class="text-6xl mb-4">🔐</div>
              <h2 class="text-2xl font-bold text-neutral-900">
                Subscription Required
              </h2>
              <p class="text-neutral-600 max-w-md mx-auto">
                Upgrade to AI Doodle Pro to enjoy the complete AI drawing game experience
              </p>
            </div>

            <!-- Pricing Information -->
            <div class="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-6 text-white text-center">
              <div class="space-y-4">
                <h3 class="text-xl font-bold">AI Doodle Pro</h3>
                <div class="text-3xl font-bold">
                  $19.99
                  <span class="text-lg font-normal opacity-80">/month</span>
                </div>
                <p class="text-sm opacity-90">
                  Cancel anytime, free trial for the first week
                </p>
              </div>
            </div>

            <!-- Feature Comparison -->
            <div class="space-y-4">
              <h3 class="font-semibold text-neutral-900 text-center">Pro Version Benefits</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-success-600">✓</span>
                    <span class="text-sm">Unlimited AI image generation</span>
                  </div>
                  <span class="text-xs text-neutral-500 bg-white px-2 py-1 rounded">Free: 5/day</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-success-600">✓</span>
                    <span class="text-sm">Create private game rooms</span>
                  </div>
                  <span class="text-xs text-neutral-500 bg-white px-2 py-1 rounded">Free: Join only</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-success-600">✓</span>
                    <span class="text-sm">Priority processing queue</span>
                  </div>
                  <span class="text-xs text-neutral-500 bg-white px-2 py-1 rounded">3x speed</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <span class="text-success-600">✓</span>
                    <span class="text-sm">Advanced game modes</span>
                  </div>
                  <span class="text-xs text-neutral-500 bg-white px-2 py-1 rounded">Exclusive</span>
                </div>
              </div>
            </div>

            <!-- Subscribe Button -->
            <div class="space-y-4">
              <button
                @click="goToCheckout"
                class="btn-gradient btn-lg w-full"
              >
                <span class="mr-2">💳</span>
                Pay Securely with Stripe
              </button>
              
              <div class="text-center">
                <p class="text-xs text-neutral-500">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>

            <!-- Security Guarantees -->
            <div class="flex items-center justify-center space-x-6 text-neutral-400 text-xs">
              <div class="flex items-center space-x-1">
                <span>🔒</span>
                <span>SSL Encrypted</span>
              </div>
              <div class="flex items-center space-x-1">
                <span>💳</span>
                <span>Secure Payment</span>
              </div>
              <div class="flex items-center space-x-1">
                <span>⭐</span>
                <span>Cancel Anytime</span>
              </div>
            </div>

            <!-- Logout -->
            <div class="pt-4 border-t border-neutral-200">
              <button
                @click="handleLogout"
                class="btn-ghost w-full"
              >
                <span class="mr-2">👋</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="text-center mt-6">
          <p class="text-neutral-500 text-sm">
            Subscription questions? Contact our support team
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  createStripeCheckout,
  logout,
  getCurrentUser,
} from "../services/api-service";
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

<template>
  <div class="p-10 text-center">
    <h2 class="text-2xl font-semibold text-red-600">Subscription Required</h2>
    <p class="mt-2 text-gray-700">
      Plase complete the payment to continue using AI Doodle.
    </p>
    <button
      class="mt-6 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
      disabled
    >
      Stripe Checkout Coming Soon
    </button>
    <button
      class="mt-4 ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      @click="logout"
    >
      Logout
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

async function logout() {
  try {
    await fetch('http://localhost:3000/api/auth/logout', {
      credentials: 'include',
    })
    router.push('/login')
  } catch (err) {
    alert('Logout failed.')
  }
}
</script>

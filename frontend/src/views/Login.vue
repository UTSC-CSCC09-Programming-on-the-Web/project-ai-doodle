<template>
  <div class="p-6 text-center">
    <h1 class="text-2xl font-bold mb-4">AI Doodle Login</h1>
    <div v-if="user">
      <p class="mb-2">Hello, {{ user.username }}!</p>
      <p class="mb-4">Subscription: {{ user.isSubscribed ? 'Active' : 'Inactive' }}</p>
      <button
          v-if="!user.isSubscribed"
          @click="goToSubscribe"
          class="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Subscribe Now
        </button>
      <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
    <div v-else>
      <a :href="googleAuthUrl" class="bg-blue-600 text-white px-4 py-2 rounded">Login with Google</a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const user = ref(null)
const router = useRouter()
const googleAuthUrl = 'http://localhost:3000/api/auth/google'

async function fetchUser() {
  const res = await fetch('http://localhost:3000/api/auth/me', {
    credentials: 'include',
  })
  if (res.ok) {
    user.value = await res.json()
  }
}

async function logout() {
  await fetch('http://localhost:3000/api/auth/logout', {
    credentials: 'include',
  })
  user.value = null
  router.push('/login')
}

function goToSubscribe() {
  router.push('/subscribe')
}

onMounted(fetchUser)
</script>

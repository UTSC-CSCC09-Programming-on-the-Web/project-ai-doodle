<template>
  <div class="page-container">
    <div class="content-container min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="flex min-h-[500px]">
          <!-- Left Side: Carousel -->
          <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-500 to-accent-600">
            <!-- Carousel Container -->
            <div class="w-full h-full relative">
              <!-- Carousel Slides -->
              <div 
                v-for="(slide, index) in carouselSlides" 
                :key="index"
                class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                :class="{ 'opacity-100': currentSlide === index, 'opacity-0': currentSlide !== index }"
              >
                <!-- Background Image -->
                <div 
                  class="w-full h-full bg-cover bg-center bg-no-repeat"
                  :style="{ backgroundImage: `url(${slide.image})` }"
                >
                  <!-- Overlay -->
                  <div class="absolute inset-0 bg-black bg-opacity-40"></div>
                  
                                <!-- Content -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white px-8 max-w-md">
                  <h2 class="text-4xl font-bold mb-4 leading-tight text-white">
                    {{ slide.keyword }}
                  </h2>
                  <p class="text-lg opacity-90 leading-relaxed text-white">
                    {{ slide.description }}
                  </p>
                </div>
              </div>
                </div>
              </div>
              
              <!-- Carousel Indicators -->
              <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <button
                  v-for="(slide, index) in carouselSlides"
                  :key="index"
                  @click="currentSlide = index"
                  class="w-3 h-3 rounded-full transition-all duration-300"
                  :class="currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'"
                ></button>
              </div>
            </div>
          </div>

          <!-- Right Side: Login Form -->
          <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
            <div class="w-full max-w-md">
              <!-- Main Title -->
              <div class="text-center mb-8">
                <h1 class="text-gradient text-4xl lg:text-5xl font-bold mb-3">
                  AI Doodle
                </h1>
                <p class="text-neutral-600 text-lg lg:text-xl">
                  {{ user ? `Welcome back, ${user.username}!` : "AI Drawing Guessing Game" }}
                </p>
              </div>

              <!-- Login Card -->
              <div class="p-6 lg:p-8 animate-fade-in">
                <div v-if="user" class="space-y-6">
                  <!-- User Info Display -->
                  <div class="text-center space-y-4">
                    <div class="w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                      {{ user.username.charAt(0).toUpperCase() }}
                    </div>
                    
                    <div>
                      <h2 class="text-xl font-semibold text-neutral-900">
                        {{ user.username }}
                      </h2>
                      <div class="mt-2">
                        <span 
                          class="badge"
                          :class="user.isSubscribed ? 'badge-success' : 'badge-warning'"
                        >
                          {{ user.isSubscribed ? "Subscribed" : "Not Subscribed" }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="space-y-3">
                    <button
                      v-if="!user.isSubscribed"
                      @click="goToSubscribe"
                      class="btn-accent btn-lg w-full"
                    >
                      <span class="mr-2">⭐</span>
                      Subscribe Now
                    </button>

                    <button
                      v-if="user.isSubscribed"
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

                <!-- Not Logged In State -->
                <div v-else class="text-center space-y-6">
                  <!-- Login Description -->
                  <div class="space-y-4">
                    <div class="text-6xl lg:text-7xl mb-4">🎨</div>
                    <h2 class="text-2xl lg:text-3xl font-semibold text-neutral-900">
                      Start Your AI Art Journey
                    </h2>
                    <p class="text-neutral-600 text-base lg:text-lg">
                      Login with your Google account to experience the AI drawing guessing game
                    </p>
                  </div>

                                <!-- Login Button -->
              <a
                :href="getGoogleLoginUrl()"
                class="btn-gradient btn-lg w-full inline-flex items-center justify-center no-underline text-base lg:text-lg py-3 lg:py-4"
              >
                    <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Login with Google
                  </a>

                                <!-- Feature Introduction -->
              <div class="grid grid-cols-1 gap-4 mt-8 pt-6 border-t border-neutral-200">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 text-sm">🤖</span>
                  </div>
                  <span class="text-sm lg:text-base text-neutral-600">AI-powered image generation</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                    <span class="text-accent-600 text-sm">👥</span>
                  </div>
                  <span class="text-sm lg:text-base text-neutral-600">Multiplayer collaborative game</span>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <span class="text-success-600 text-sm">🎯</span>
                  </div>
                  <span class="text-sm lg:text-base text-neutral-600">Fun word guessing challenge</span>
                </div>
              </div>
                </div>
              </div>

                        <!-- Footer Info -->
          <div class="text-center mt-4">
            <p class="text-neutral-500 text-xs">
              © 2025 AI Doodle. Where creativity meets AI
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  getCurrentUser,
  logout,
  getGoogleLoginUrl,
} from "../services/api-service";

const user = ref(null);
const router = useRouter();
const currentSlide = ref(0);
let carouselInterval = null;

// Carousel slides data
const carouselSlides = ref([
  {
    image: "https://images.unsplash.com/photo-1748164685063-bc408b0dc789?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    keyword: "Creativity",
    description: "Bring ideas to life with your imagination and AI Doodle."
  },
  {
    image: "https://images.unsplash.com/photo-1729601713778-bb772d58f0f7?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    keyword: "Friendship",
    description: "Draw closer through doodles and guesses."
  },
  {
    image: "https://images.unsplash.com/photo-1666232784495-d865a7dc7de9?q=80&w=2656&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    keyword: "Brainstorm",
    description: "Chain your thoughts with words, and expand them through images."
  },
  {
    image: "https://images.unsplash.com/photo-1734549097883-fb428ab88cb2?q=80&w=1300&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    keyword: "Tension",
    description: "Someone's off script. Can you find the spy?"
  }
]);

// Carousel functions
function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length;
}

function previousSlide() {
  currentSlide.value = currentSlide.value === 0 
    ? carouselSlides.value.length - 1 
    : currentSlide.value - 1;
}

function startCarousel() {
  carouselInterval = setInterval(() => {
    nextSlide();
  }, 5000); // Change slide every 5 seconds
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

async function fetchUser() {
  try {
    const data = await getCurrentUser();
    user.value = data;
  } catch (err) {
    user.value = null;
  }
}

async function handleLogout() {
  try {
    await logout();
    user.value = null;
    router.push("/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

function goToSubscribe() {
  router.push("/subscribe");
}

function goToHome() {
  router.push("/home");
}

onMounted(() => {
  fetchUser();
  startCarousel();
});

onUnmounted(() => {
  stopCarousel();
});
</script>

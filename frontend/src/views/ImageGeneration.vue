<template>
  <div class="page-container">
    <div class="content-container">
      <!-- Page Title -->
      <div class="text-center mb-8">
        <h1 class="text-gradient text-4xl font-bold mb-2">
          AI Image Generator
        </h1>
        <p class="text-neutral-600 text-lg">
          Transform your imagination into beautiful AI artwork
        </p>
      </div>

      <!-- Back Button -->
      <div class="mb-6">
        <button @click="goBack" class="btn-ghost flex items-center">
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Game Lobby
        </button>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Side: Generation Control Panel -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Input Area -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-6">
              <div
                class="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">🎨</span>
              </div>
              <h2 class="text-xl font-semibold text-neutral-900">
                Creation Settings
              </h2>
            </div>

            <div class="space-y-6">
              <!-- Model Selection -->
              <div>
                <label class="form-label">AI Model Selection</label>
                <select
                  v-model="selectedModel"
                  class="form-select"
                  :disabled="isLoading"
                >
                  <option value="dall-e-3">
                    DALL-E 3 (Recommended, High Quality)
                  </option>
                  <option value="dall-e-2">DALL-E 2 (Classic, Fast)</option>
                </select>
                <p class="form-help">
                  DALL-E 3 provides higher quality images and better prompt
                  understanding
                </p>
              </div>

              <!-- Prompt Input -->
              <div>
                <label class="form-label">Image Description Prompt</label>
                <div class="relative">
                  <textarea
                    v-model="prompt"
                    placeholder="e.g.: A cute cat sitting on a rainbow bridge, cartoon style, bright colors"
                    class="form-textarea"
                    rows="4"
                    @keyup.ctrl.enter="generateImage"
                    :disabled="isLoading"
                  ></textarea>
                  <div
                    class="absolute bottom-2 right-2 text-xs text-neutral-400"
                  >
                    Ctrl + Enter to generate
                  </div>
                </div>
                <p class="form-help">
                  Describe your desired image in detail, including style,
                  colors, composition, etc.
                </p>
              </div>

              <!-- Generate Button -->
              <div>
                <button
                  @click="generateImage"
                  :disabled="isLoading || !prompt.trim()"
                  class="btn-gradient btn-lg w-full"
                >
                  <span
                    v-if="isLoading"
                    class="flex items-center justify-center"
                  >
                    <div class="loading-spinner w-5 h-5 mr-3"></div>
                    AI is creating...
                  </span>
                  <span v-else class="flex items-center justify-center">
                    <span class="mr-2">✨</span>
                    Generate AI Image
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Generation Result Area -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center"
                >
                  <span class="text-white text-lg">🖼️</span>
                </div>
                <h2 class="text-xl font-semibold text-neutral-900">
                  Generation Result
                </h2>
              </div>

              <div v-if="generatedImage" class="flex space-x-2">
                <button @click="downloadImage" class="btn-success btn-sm">
                  <span class="mr-1">📥</span>
                  Download
                </button>
                <button @click="generateAnother" class="btn-accent btn-sm">
                  <span class="mr-1">🔄</span>
                  Generate Another
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-16">
              <div class="space-y-4">
                <div class="loading-spinner w-16 h-16 mx-auto"></div>
                <div class="space-y-2">
                  <p class="text-lg font-medium text-primary-600">
                    AI is generating your image...
                  </p>
                  <p class="text-sm text-neutral-500">
                    This usually takes 10-30 seconds, please be patient
                  </p>
                </div>
                <div class="max-w-md mx-auto bg-neutral-100 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full animate-pulse"
                    style="width: 60%"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-16">
              <div class="space-y-4">
                <div class="text-6xl">⚠️</div>
                <div class="status-danger max-w-md mx-auto">
                  {{ error }}
                </div>
                <button @click="generateImage" class="btn-primary">
                  Retry Generation
                </button>
              </div>
            </div>

            <!-- Generated Image -->
            <div v-else-if="generatedImage" class="space-y-4">
              <div class="bg-neutral-100 rounded-xl p-4">
                <img
                  :src="generatedImage"
                  :alt="prompt"
                  class="w-full h-auto rounded-lg shadow-medium mx-auto"
                  style="max-height: 600px; object-fit: contain"
                />
              </div>

              <!-- Image Information -->
              <div class="bg-neutral-50 rounded-xl p-4">
                <div class="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-neutral-600">Model Used:</span>
                    <span class="font-medium">{{
                      lastUsedModel.toUpperCase()
                    }}</span>
                  </div>
                  <div v-if="imageInfo.usage">
                    <span class="text-neutral-600">Tokens Used:</span>
                    <span class="font-medium"
                      >{{ imageInfo.usage.total_tokens }} tokens</span
                    >
                  </div>
                  <div>
                    <span class="text-neutral-600">Generation Time:</span>
                    <span class="font-medium">{{
                      new Date().toLocaleTimeString()
                    }}</span>
                  </div>
                  <div>
                    <span class="text-neutral-600">Image Size:</span>
                    <span class="font-medium">1024×1024</span>
                  </div>
                </div>
              </div>

              <!-- Prompt Display -->
              <div class="bg-primary-50 rounded-xl p-4">
                <h4 class="font-medium text-primary-900 mb-2">Prompt Used:</h4>
                <p class="text-sm text-primary-700 italic">
                  "{{ lastPrompt }}"
                </p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-16">
              <div class="space-y-4">
                <div class="text-6xl opacity-50">🎨</div>
                <div class="space-y-2">
                  <p class="text-lg text-neutral-500">
                    Ready to create your first AI image
                  </p>
                  <p class="text-sm text-neutral-400">
                    Enter a description on the left and click the generate
                    button
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Information Panel -->
        <div class="space-y-6">
          <!-- AI Model Information -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">🤖</span>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900">
                AI Assistant
              </h3>
            </div>

            <div class="space-y-4">
              <div class="bg-success-50 rounded-lg p-4">
                <p class="text-sm text-success-800">
                  <span class="font-medium">Current Model:</span>
                  {{ selectedModel.toUpperCase() }}
                </p>
                <p class="text-xs text-success-600 mt-1">
                  Based on OpenAI's advanced image generation technology
                </p>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-neutral-600">Generation Quality</span>
                  <div class="flex space-x-1">
                    <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                    <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                    <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                    <span class="w-2 h-2 bg-success-500 rounded-full"></span>
                    <span class="w-2 h-2 bg-success-300 rounded-full"></span>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">Generation Speed</span>
                  <span class="font-medium">10-30 seconds</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">Resolution</span>
                  <span class="font-medium">1024×1024</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Prompt Tips -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-warning-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">💡</span>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900">
                Prompt Tips
              </h3>
            </div>

            <div class="space-y-3 text-sm">
              <div class="bg-warning-50 rounded-lg p-3">
                <h4 class="font-medium text-warning-800 mb-2">
                  Quality Prompt Elements:
                </h4>
                <ul class="space-y-1 text-warning-700">
                  <li>• Detailed subject description</li>
                  <li>• Art style specification</li>
                  <li>• Color and lighting description</li>
                  <li>• Composition and perspective</li>
                </ul>
              </div>

              <div class="space-y-2">
                <p class="font-medium text-neutral-700">Example Prompt:</p>
                <div class="bg-neutral-50 rounded-lg p-3">
                  <p class="text-xs text-neutral-600 italic">
                    "A fluffy orange kitten sitting under a cherry blossom tree,
                    Japanese watercolor style, soft pink tones, warm sunlight
                    filtering through petals"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Statistics -->
          <div class="card p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center"
              >
                <span class="text-white text-lg">📚</span>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900">
                Usage Statistics
              </h3>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-neutral-600 text-sm">Generated Today</span>
                <span class="font-semibold">3 images</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-neutral-600 text-sm"
                  >Generated This Month</span
                >
                <span class="font-semibold">24 images</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-neutral-600 text-sm">Remaining Quota</span>
                <span class="font-semibold text-success-600">Unlimited</span>
              </div>

              <div class="pt-3 border-t border-neutral-200">
                <p class="text-xs text-neutral-500">
                  Pro users enjoy unlimited AI image generation
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  generateImageWithAI,
  generateImageFallback,
} from "../services/imageGenerationService.js";

const router = useRouter();
const prompt = ref("");
const selectedModel = ref("dall-e-3");
const generatedImage = ref("");
const lastPrompt = ref("");
const lastUsedModel = ref("");
const imageInfo = ref({});
const isLoading = ref(false);
const error = ref("");

const goBack = () => {
  router.push("/home");
};

const generateImage = async () => {
  if (!prompt.value.trim() || isLoading.value) return;

  isLoading.value = true;
  error.value = "";
  lastPrompt.value = prompt.value;
  lastUsedModel.value = selectedModel.value;

  try {
    let result;

    try {
      // Call OpenAI API with selected model
      result = await generateImageWithAI(prompt.value, selectedModel.value);
    } catch (apiError) {
      console.warn("OpenAI API call failed, using fallback:", apiError.message);
      // If OpenAI API fails, use fallback
      result = await generateImageFallback(prompt.value, selectedModel.value);
      error.value =
        "OpenAI API is temporarily unavailable, showing example image. Please configure VITE_OPENAI_API_KEY environment variable.";
    }

    generatedImage.value = result.imageUrl;
    imageInfo.value = result;
  } catch (err) {
    console.error("Image generation failed:", err);
    error.value = `Image generation failed: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

const downloadImage = () => {
  if (!generatedImage.value) return;

  const link = document.createElement("a");
  link.href = generatedImage.value;

  // Generate filename with model information
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const modelName = lastUsedModel.value.replace("/", "-");
  link.download = `ai-image-${modelName}-${timestamp}.png`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateAnother = () => {
  generatedImage.value = "";
  imageInfo.value = {};
  prompt.value = "";
  error.value = "";
};
</script>

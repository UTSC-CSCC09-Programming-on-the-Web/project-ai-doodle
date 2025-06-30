<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-6">
      <!-- Page Title -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">AI Image Generator</h1>
      </div>

      <!-- Back Button -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Home
        </button>
      </div>

      <!-- Input Area -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <!-- Model Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            AI Model Selection
          </label>
          <select
            v-model="selectedModel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :disabled="isLoading"
          >
            <option value="dall-e-3">DALL-E 3 (Recommended, High Quality)</option>
            <option value="dall-e-2">DALL-E 2 (Classic, Fast)</option>
          </select>
        </div>

        <!-- Prompt Input -->
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Image Description Prompt
        </label>
        <div class="flex gap-4">
          <input
            v-model="prompt"
            type="text"
            placeholder="e.g.: A cute cat sitting on a rainbow bridge, cartoon style, bright colors"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            @keyup.enter="generateImage"
            :disabled="isLoading"
          />
          <button
            @click="generateImage"
            :disabled="isLoading || !prompt.trim()"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ isLoading ? 'Generating...' : 'Generate Image' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">AI is generating your image...</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Generated Image -->
      <div v-if="generatedImage" class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Generation Result</h3>
        <div class="text-center">
          <img
            :src="generatedImage"
            :alt="prompt"
            class="max-w-full h-auto rounded-lg shadow-md mx-auto"
            style="max-height: 500px"
          />
          
          <!-- Token Usage Info -->
          <div v-if="imageInfo.usage" class="mt-4 text-center">
            <p class="text-sm text-gray-600">Token Usage: {{ imageInfo.usage.total_tokens }} tokens</p>
          </div>

          <div class="mt-4 flex justify-center gap-4">
            <button
              @click="downloadImage"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📥 Download Image
            </button>
            <button
              @click="generateAnother"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🎨 Generate Another
            </button>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { generateImageWithAI, generateImageFallback } from '../services/imageGenerationService.js';

const router = useRouter();
const prompt = ref('');
const selectedModel = ref('dall-e-3');
const generatedImage = ref('');
const lastPrompt = ref('');
const lastUsedModel = ref('');
const imageInfo = ref({});
const isLoading = ref(false);
const error = ref('');

const goBack = () => {
  router.push('/home');
};

const generateImage = async () => {
  if (!prompt.value.trim() || isLoading.value) return;

  isLoading.value = true;
  error.value = '';
  lastPrompt.value = prompt.value;
  lastUsedModel.value = selectedModel.value;

  try {
    let result;
    
    try {
      // Call OpenAI API with selected model
      result = await generateImageWithAI(prompt.value, selectedModel.value);
    } catch (apiError) {
      console.warn('OpenAI API call failed, using fallback:', apiError.message);
      // If OpenAI API fails, use fallback
      result = await generateImageFallback(prompt.value, selectedModel.value);
      error.value = 'OpenAI API is temporarily unavailable, showing example image. Please configure VITE_OPENAI_API_KEY environment variable.';
    }
    
    generatedImage.value = result.imageUrl;
    imageInfo.value = result;
    
  } catch (err) {
    console.error('Image generation failed:', err);
    error.value = `Image generation failed: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

const downloadImage = () => {
  if (!generatedImage.value) return;
  
  const link = document.createElement('a');
  link.href = generatedImage.value;
  
  // Generate filename with model information
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const modelName = lastUsedModel.value.replace('/', '-');
  link.download = `ai-image-${modelName}-${timestamp}.png`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateAnother = () => {
  generatedImage.value = '';
  imageInfo.value = {};
  prompt.value = '';
  error.value = '';
};
</script> 
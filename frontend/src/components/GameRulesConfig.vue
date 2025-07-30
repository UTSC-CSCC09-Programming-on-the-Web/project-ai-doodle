<template>
  <div class="game-rules-config">
    <h4 class="text-lg font-semibold text-neutral-900 mb-4">Game Rules</h4>

    <!-- Final Guess Synonyms -->
    <div class="mb-4">
      <label class="flex items-center space-x-3 cursor-pointer">
        <input
          v-model="rules.allowSynonyms"
          type="checkbox"
          class="form-checkbox w-5 h-5 text-primary-600"
        />
        <span class="text-neutral-700"> Allow synonyms in final guess </span>
      </label>
      <p class="text-sm text-neutral-500 mt-1">
        Players can use synonyms when guessing the original word
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      allowSynonyms: true,
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const rules = ref({
  allowSynonyms: props.modelValue.allowSynonyms,
});

watch(
  rules,
  (newRules) => {
    emit("update:modelValue", newRules);
  },
  { deep: true },
);

watch(
  () => props.modelValue,
  (newValue) => {
    rules.value = {
      allowSynonyms: newValue.allowSynonyms,
    };
  },
  { deep: true },
);
</script>

import type { CarCard } from '#build/components';
<script setup>
const props = defineProps({
  cars: Array,
});

const favorite = useLocalStorage("favorite", {});

const haldleFavorite = (id) => {
  if (id in favorite.value) {
    delete favorite.value[id];
  } else {
    favorite.value = {
      ...favorite.value,
      [id]: true,
    };
  }
};
</script>

<template>
  <div class="w-full">
    <CarCard
      v-for="car in cars"
      :key="car.id"
      :car="car"
      @favor="haldleFavorite"
      :favored="car.id in favorite"
    />
  </div>
</template>

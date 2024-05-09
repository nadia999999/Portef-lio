<script setup>
const route = useRoute();

const { data: car } = await useFetchCar(route.params.id);
const user = useSupabaseUser();
const { toTitleCase } = useUtilities();
useHead({
  title: toTitleCase(route.params.name),
});

if (!car.value) {
  throw createError({
    statusCode: 404,
    message: `Car with ID of ${route.params.id} does not exist`,
  });
  s;
}

definePageMeta({
  layout: "custom",
});
</script>

<template>
  <div>
    <CarDetailHero :car="car" />
    <CarDetailAttributes :features="car.features" />
    <CarDetailDescription :description="car.description" />
    <CarDetailContact />
  </div>
</template>

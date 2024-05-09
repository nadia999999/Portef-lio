<template>
  <div>
    <div
      class="large-title text-gray-800 font-campton font-medium text-xl leading-9 tracking-tight p-2 bg-white w-574 h-33"
    >
      Delete for all eternity?
    </div>
    <div
      class="secondary-text bg-white text-gray-600 font-medium font-campton text-base leading-6 tracking-tighter p-2 w-574 h-100"
    >
      You’ll lose your glimpse and all the comments forever. We can’t recover
      them once you delete.
    </div>
    <div
      class="secondary-text bg-white text-gray-600 font-campton text-base leading-6 tracking-tighter p-2 w-574 flex items-center"
    >
      <span
        class="font-campton text-base font-medium leading-6 tracking-tighter"
        >Are you sure want to</span
      >
      <div
        class="delete-text font-campton text-base font-medium leading-6 tracking-tighter p-2 text-pink-500 ml-0.1"
      >
        permanently delete
      </div>
      <div
        class="glimpse-text font-campton text-base font-medium leading-6 tracking-tighter p-2 text-gray-600 ml-0.1"
      >
        this glimpse?
      </div>
    </div>
    <div class="w-574 h-68 py-24 px-0 bg-white gap-12">
      <div class="flex justify-end">
        <button
          :class="[
            'w-28 h-10 flex items-center justify-center rounded-full mt-4 mr-4',
            type === 'cancel' ? ' text-gray-400 bg-gray-200' : '',
          ]"
        >
          <span
            class="font-campton text-base font-medium leading-5 tracking-tighter text-gray-400 px-4"
          >
            {{ text }}
          </span>
        </button>

        <button
          :class="[
            'w-28 h-10 flex items-center justify-center rounded-full mt-4 mr-4',
            type === 'cancel'
              ? ' bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500'
              : '',
          ]"
        >
          <span
            class="font-campton text-base font-medium leading-5 tracking-tighter px-4 text-white"
          >
            Yes, delete it
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "cancel",
    },
    text: {
      type: String,
      default: "Cancel",
    },
  },
};
</script>

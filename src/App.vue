<template>
    <main class="px-8 py-16 bg-slate-100 place-content-center w-screen h-screen font-[Melete]">
        <div class="flex flex-col gap-4 items-center">
            <div class="text-center">
                <p class="text-4xl">{{ pi }}</p>
                <p>{{ matchRate }}%</p>
            </div>
            <div class="basis-1/2 flex flex-row gap-4 items-center">
                <p class="text-lg">EPISODE[{{ episode.toString().padStart(3, "0") }}]</p>
                <button
                    class="bg-black text-white py-1.5 px-3 rounded-md text-sm"
                    @click="tick">
                    tick
                </button>
            </div>
        </div>
    </main>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { DiagonalLineAlgorithm } from "./algorithms/main";

const pi = ref(0);
const episode = ref(0);
const matchRate = computed(() => pi.value / Math.PI * 100)

const algorithm = new DiagonalLineAlgorithm();
const tick = () => {
    algorithm.tick().then(({pi: newPI, episode: newEpisode}) => {
        pi.value = newPI;
        episode.value = newEpisode;
    })
}
</script>
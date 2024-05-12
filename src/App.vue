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
            <div ref="canvas"/>
        </div>
    </main>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { DiagonalLineAlgorithm } from "./algorithms/main";
import p5 from "p5";

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

const canvas = ref<HTMLElement>()

const a = (p: p5) => {
    p.setup = () => {
        p.createCanvas(400, 400);
        p.colorMode(p.HSL);

        function isInCircle([x, y]: [number, number]){
            return (x ** 2 + y ** 2) <= 1
        }
        
        function c(from: [number,number], direction: [0|1|-1, 0|1|-1], depth: number){
            const size = 200
            const dVectorSize = 2 ** depth
            const to: [number, number] = [(from[0] + direction[0] / dVectorSize), (from[1] + direction[1] / dVectorSize)]

            const isFromInCircle = isInCircle(from)
            const isToInCircle = isInCircle(to)
            const position = isFromInCircle && isToInCircle
                ? "in"
                : isFromInCircle || isToInCircle
                    ? "cross"
                    : "out"

            p.stroke(
                position == "cross"
                    ? p.color(depth * 20 % 360, 100, 50)
                    : position == "in"
                        ? p.color(0)
                        : p.color(200)
            )
            p.line(
                from[0] * size, from[1] * size,
                to[0] * size, to[1] * size
            )

            if( direction[0] == 0 && direction[1] == 0 ) throw new Error("Direction is zero")
            if( depth == 10 ) return

            const newDepth = (direction[0] == 0 || direction[1] == 0) ? depth + 1 : depth
            if( direction[0] == 1 ){
                if( direction[1] == 1 ){
                    //↗︎
                    c(to, [-1, 0], newDepth)
                    c(to, [0, -1], newDepth)
                }else if( direction[1] == 0 ){
                    //→
                    c(to, [-1, 1], newDepth)
                    c(to, [-1, -1], newDepth)
                }else{
                    //↘︎
                    c(to, [0, 1], newDepth)
                    c(to, [-1, 0], newDepth)
                }
            }else if( direction[0] == 0 ){
                if( direction[1] == 1 ){
                    //↑
                    c(to, [1, -1], newDepth)
                    c(to, [-1, -1], newDepth)
                }else{
                    //↓
                    c(to, [1, 1], newDepth)
                    c(to, [-1, 1], newDepth)
                }
            }else{
                if( direction[1] == 1 ){
                    //↖︎
                    c(to, [1, 0], newDepth)
                    c(to, [0, -1], newDepth)
                }else if( direction[1] == 0 ){
                    //←
                    c(to, [1, 1], newDepth)
                    c(to, [1, -1], newDepth)
                }else{
                    //↙︎
                    c(to, [0, 1], newDepth)
                    c(to, [1, 0], newDepth)
                }
            }
        }

        p.strokeWeight(2)
        
        c([0.5,0.5],[1,0],1)
    }
}

onMounted(() => {
    if(!canvas.value) throw new Error("Canvas not found")
    new p5(a, canvas.value)
})
</script>
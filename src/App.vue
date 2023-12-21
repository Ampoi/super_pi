<template>
    <button @click="tick()">tick</button>
    {{ k }}
    {{ blackRate*4 }}
    {{ pivots.length }}
</template>
<script setup lang="ts">
import p5 from 'p5';
import { onMounted, ref } from 'vue';
import { sub_process, isInCircle } from "./utils/sub_process"

let pivots: [x: number, y: number][] = [[0,0]]
let pivots_to_draw: [x: number, y: number][] = pivots
const blackRate = ref(0)

const k = ref(0)
const span = 2**5

const amount = 1000
function getSomeElements<T>(arr: T[]) {
  const result = [];
  const totalElements = arr.length;
  const interval = Math.ceil(totalElements / amount);

  for (let i = 0; i < totalElements; i += interval) {
    result.push(arr[i]);
    if (result.length >= amount) break
  }

  return result;
}

function tick(){
    const newPivots: [number, number][] = []
    while( span < pivots.length ){
        const { newPivots: newPivotsInSpan, blackRateIncremental } = sub_process(k.value, pivots.splice(0, span))
        newPivots.push(...newPivotsInSpan)
        blackRate.value += blackRateIncremental
        console.log("hey!")
    }
    const { newPivots: newPivotsInSpan, blackRateIncremental } = sub_process(k.value, pivots)
    newPivots.push(...newPivotsInSpan)
    blackRate.value += blackRateIncremental

    pivots = newPivots
    pivots_to_draw = getSomeElements<[x: number, y: number]>(pivots)
    k.value++
}

onMounted(() => {
    new p5((p: p5) => {
        p.setup = () => {
            p.createCanvas(800, 800)
        }
        
        p.draw = () => {
            p.background(200)
            p.fill(180)
            //const scale = 1.8**k.value
            //p.scale(scale)
            //p.translate(p.width * (- 1/2**0.5) + p.width / 2 * (1 / scale), -p.width * (1 - 1/2**0.5) + p.width / 2 * (1 / scale))
            //p.strokeWeight(3/scale)
            p.strokeWeight(3)
            p.stroke(150)
            p.circle(0, p.height, p.height*2)

            p.noStroke()
            pivots_to_draw.forEach(([x, y]) => {
                const length = 1/(2 ** k.value)
                const lbIsin = isInCircle(x, y)
                const rtIsin = isInCircle(x+length,y+length)
                const lineColor = lbIsin && rtIsin ? "black" : lbIsin ? "blue" : "white"

                p.stroke(lineColor)
                p.line(x*p.width, (1-y)*p.width, (x+length)*p.width, (1-(y+length))*p.width)
            })
        }
    })
})
</script>
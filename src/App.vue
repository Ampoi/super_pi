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
const blackRate = ref(0)

const k = ref(0)
const span = 2**5

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
            p.stroke(150)
            p.circle(0, p.height, p.height*2)

            p.noStroke()
            pivots.forEach(([x, y]) => {
                const length = 1/(2 ** k.value)
                const lbIsin = isInCircle(x, y)
                const rtIsin = isInCircle(x+length,y+length)
                const lineColor = lbIsin && rtIsin ? "black" : lbIsin ? "blue" : "white"

                p.stroke(lineColor)
                p.strokeWeight(3)
                p.line(x*p.width, (1-y)*p.width, (x+length)*p.width, (1-(y+length))*p.width)
                //const fillColor = p.color(lineColor)
                //fillColor.setAlpha(120)
                //p.fill(fillColor)
                //p.square(x*p.width, (1-(y+length))*p.width, length*p.width)
            })
        }
    })
})
</script>
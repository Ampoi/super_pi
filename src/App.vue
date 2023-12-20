<template>
    <button @click="tick()">tick</button>
    {{ k }}
    {{ blackRate*4 }}
</template>
<script setup lang="ts">
import p5 from 'p5';
import { onMounted, ref } from 'vue';

let pivots: [x: number, y: number][] = [[0,0]]
const blackRate = ref(0)

function isInCircle(x: number, y: number){
    return x**2 + y**2 < 1
}

const k = ref(0)
function tick(){
    const length = 1/(2 ** k.value)
    const newPivots: [number, number][] = []
    pivots.forEach(([x, y]) => {
        const lbIsin = isInCircle(x, y)
        const rtIsin = isInCircle(x+length,y+length)

        if( lbIsin && !rtIsin ){
            newPivots.push([ x, y ])
            newPivots.push([ x, y+length/2 ])
            newPivots.push([ x+length/2, y+length/2 ])
            if(x < y) newPivots.push([ x+length/2, y ])
        }else if( lbIsin ){
            blackRate.value += (length ** 2) * ( x == y ? 1 : 2 )
        }
    })
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
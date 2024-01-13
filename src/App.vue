<template>
    <button @click="tick">tick</button>
    <button @click="connect">connect</button>
    <button @click="() => sendMessage('hey!')">send</button>
    <p>episode: {{ showData.episode }}</p>
    <p>PI: {{ showData.pi }}</p>
    <p>Match Rate: {{ showData.matchRate }}%</p>
</template>
<script setup lang="ts">
import { reactive } from 'vue';

let writer: WritableStreamDefaultWriter<Uint8Array>

abstract class Process {
    public readonly name: string
    
    constructor(){
        this.name = "MA-462X"
    }

    abstract execute(episode: number, pivots: [number, number][]): Promise<{
        newPivots: [x: number, y: number][];
        blackRateIncremental: number;
    }>
}

function isInCircle(x: number, y: number){
    return x**2 + y**2 < 1
}

class BrowserProcess extends Process {
    execute( episode: number, pivots: [x: number, y: number][] ){
        return new Promise<{
            newPivots: [x: number, y: number][];
            blackRateIncremental: number;
        }>((resolve) => {
            const length = 1/(2 ** episode)
        
            let blackRateIncremental = 0
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
                    blackRateIncremental += (length ** 2) * ( x == y ? 1 : 2 )
                }
            })
            
            resolve({
                newPivots,
                blackRateIncremental
            })
        })
    }
}

async function connect(){
    const port = await navigator.serial.requestPort()
    await port.open({ baudRate: 9600 })

    const writerStream = port.writable?.getWriter();
    if( !writerStream ) throw new Error("😢")
    writer = writerStream

    while(port.readable){
        const reader = port.readable.getReader();
        
        let text = ""
        while(true){
            const { value } = await reader.read();
            const inputValue = new TextDecoder().decode(value);
            if( inputValue.includes("\n") ){
                console.log(text)
                text = ""
            }else{
                text += inputValue
            }
        }
    }
}

async function sendMessage(message: string) {
    if (writer) {
        const data = new TextEncoder().encode(message + '\n');
        await writer.write(data);
    }
}

let k = 0
let pivots: [x: number, y: number][] = [[0,0]]
let blackRate = 0

const showData = reactive({
    episode: k,
    pi: 0,
    matchRate: 0
})

function updateShowData(){
    showData.episode = k
    showData.pi = blackRate * 4
    showData.matchRate = blackRate * 4 / Math.PI * 100
    requestAnimationFrame(updateShowData)
}

updateShowData()

const processes: Process[] = reactive([
    new BrowserProcess(),
    new BrowserProcess(),
    new BrowserProcess(),
    new BrowserProcess()
])

const span = 2**15

function pushEach<T extends any[]>(to: T, value: T){
    value.forEach(a => { to.push(a) })
}

async function assignProcess(process: Process, newPivots: [number, number][], onFinish: () => void): Promise<boolean> {
    if( pivots.length < span ){
        onFinish()
        return true
    }

    const { blackRateIncremental, newPivots: newSpanPivots } = await process.execute(k, pivots.splice(0, span))
    blackRate += blackRateIncremental
    pushEach(newPivots, newSpanPivots)

    const stop = await assignProcess(process, newPivots, onFinish)
    return stop
}

async function tick(){
    const newPivots: [number, number][] = []

    await new Promise((resolve) => {
        for( const process of processes ){
            assignProcess(process, newPivots, async () => {
                const { blackRateIncremental, newPivots: newSpanPivots } = await processes[0].execute(k, pivots.splice(0, span))
                blackRate += blackRateIncremental
                pushEach(newPivots, newSpanPivots)
                
                resolve("finished")
            })
        }
    })

    pivots = newPivots
    k++
}
</script>
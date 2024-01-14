<template>
    <main class="px-8 py-16 bg-slate-100 w-screen h-screen flex flex-col gap-4 font-[Melete]">
        <div class="text-center">
            <p class="text-4xl">{{ showData.pi }}</p>
            <p>{{ showData.matchRate }}%</p>
        </div>
        <div class="basis-1/2 flex flex-col gap-4 items-center">
            <div class="flex flex-row gap-8">
                <button
                    class="border-2 border-white shadow-xl shadow-slate-400/5 p-2"
                    @click="tick">
                    tick
                </button>
                <button
                    class="border-2 border-white shadow-xl shadow-slate-400/5 p-2"
                    @click="connect">
                    connect
                </button>
                <button
                    class="border-2 border-white shadow-xl shadow-slate-400/5 p-2"
                    @click="() => sendMessage('hey!')">
                    send
                </button>
            </div>
            <p>episode: {{ showData.episode }}</p>
            <div class="flex flex-col gap-4 max-w-2xl w-full">
                <div
                    v-for="process in processes"
                    class="p-4 flex flex-row gap-4 items-center">
                    {{  process.name }}
                </div>
            </div>
        </div>
    </main>
</template>
<script setup lang="ts">
import { reactive } from 'vue';

let writer: WritableStreamDefaultWriter<Uint8Array>

function getRandomValue<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}
abstract class Process {
    public readonly name: string
    
    constructor(){
        const start = "A".charCodeAt(0);
        const alphabetArray = Array.from({ length: 26 }).map((_, i) => String.fromCharCode(start+i))
        this.name = "MA-462X"
        this.name =
            getRandomValue(alphabetArray) +
            getRandomValue(alphabetArray) +
            "-" +
            String(Math.floor(Math.random() * 999)).padStart(3, "0") + 
            getRandomValue(alphabetArray.slice(23, 25))
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

const span = 2**20

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
    const label = Math.random().toString()
    console.time(label)
    pushEach(newPivots, newSpanPivots)
    console.timeEnd(label)

    const stop = await assignProcess(process, newPivots, onFinish)
    return stop
}

async function tick(){
    const newPivots: [number, number][] = []

    console.clear()
    console.time("tick")

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

    console.timeEnd("tick")

    pivots = newPivots
    k++
}
</script>
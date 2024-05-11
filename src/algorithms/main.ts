function isInCircle(x: number, y: number){
    return x**2 + y**2 < 1
}

class BrowserProcess {
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

export class DiagonalLineAlgorithm {
    private k = 0
    private pivots: [x: number, y: number][] = [[0,0]]
    private blackRate = 0

    private readonly processes: BrowserProcess[] = [
        new BrowserProcess(),
        new BrowserProcess(),
        new BrowserProcess(),
        new BrowserProcess()
    ] as const

    private readonly assignProcess = async (process: BrowserProcess, newPivots: [number, number][], onFinish: () => void): Promise<boolean> => {
        if( this.pivots.length < span ){
            onFinish()
            return true
        }

        const { blackRateIncremental, newPivots: newSpanPivots } = await process.execute(this.k, this.pivots.splice(0, span))
        this.blackRate += blackRateIncremental
        const label = Math.random().toString()
        console.time(label)
        pushEach(newPivots, newSpanPivots)
        console.timeEnd(label)

        const stop = await this.assignProcess(process, newPivots, onFinish)
        return stop
    }

    public readonly tick = async () => {
        const newPivots: [number, number][] = []

        console.clear()
        console.time("tick")

        await new Promise((resolve) => {
            for( const process of this.processes ){
                this.assignProcess(process, newPivots, async () => {
                    const { blackRateIncremental, newPivots: newSpanPivots } = await this.processes[0].execute(this.k, this.pivots.splice(0, span))
                    this.blackRate += blackRateIncremental
                    pushEach(newPivots, newSpanPivots)
                    
                    resolve("finished")
                })
            }
        })

        console.timeEnd("tick")

        this.pivots = newPivots
        this.k++

        return {
            pi: this.blackRate * 4,
            episode: this.k,
        }
    }
}

const span = 2**20

function pushEach<T extends any[]>(to: T, value: T){
    value.forEach(a => { to.push(a) })
}
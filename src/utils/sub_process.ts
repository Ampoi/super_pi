export function isInCircle(x: number, y: number){
    return x**2 + y**2 < 1
}

export function sub_process(k: number, pivots: [number, number][]){
    const length = 1/(2 ** k)
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

    return {
        newPivots,
        blackRateIncremental
    }
}
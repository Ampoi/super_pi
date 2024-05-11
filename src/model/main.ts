export interface Algorithm {
    tick(): {
        episode: number,
        pi: number
    }
}
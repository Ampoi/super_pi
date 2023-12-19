n = 100
pivots = [(0,0)]
allPivots = pivots
blackRate = 0

def isInCircle(x, y):
    return x**2 + y**2 <= 1

for k in range(n):
    length = 1/(2**k)
    newPivots = []
    for pivot in pivots:
        lbIsin = isInCircle(pivot[0], pivot[1])
        rtIsin = isInCircle(pivot[0]+length,pivot[1]+length)

        if lbIsin and not(rtIsin):
            newPivots.append((pivot[0],             pivot[1]))
            newPivots.append((pivot[0],             pivot[1]+length/2))
            newPivots.append((pivot[0]+length/2,    pivot[1]+length/2))
            newPivots.append((pivot[0]+length/2,    pivot[1]))
        elif lbIsin:
            blackRate += 1/(4**k)
    allPivots.append(newPivots)
    pivots = newPivots
    print(blackRate*4)
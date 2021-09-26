function commaFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    let zeroCheck = num.array ? num.array[0] : num
    if (zeroCheck < 0.001) return (0).toFixed(precision)
    let init = num.toString()
    let portions = init.split(".")
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    return portions[0]
}

function regularFormat(num, precision) {
    if (isNaN(num)) return "NaN"
    let zeroCheck = num.array ? num.array[0] : num
    if (zeroCheck < 0.001) return (0).toFixed(precision)
    let fmt = num.toString()
    let f = fmt.split(".")
    if (precision == 0) return commaFormat(num.floor ? num.floor() : Math.floor(num))
    else if (f.length == 1) return fmt + "." + "0".repeat(precision)
    else if (f[1].length < precision) return fmt + "0".repeat(precision - f[1].length)
    else return f[0] + "." + f[1].substring(0, precision)
}

// Basically does the opposite of what standardize in OmegaNum does
function polarize(array, smallTop=false) {
    if (array[0] == Number.POSITIVE_INFINITY) return [array[0], array[array.length-1], array.length-1]
    do {
        while (array[0] >= 10) {
            array[0] = Math.log10(array[0])
            array[1] = (array[1]||0) + 1
        }
        let l = array.length
        for (i=1;i<l-1;++i) {
            if (array[i] == 0) continue
            array[0] = Math.log10(array[0])+array[i]
            array[i] = 0
            array[i+1] += 1
            if (array[0] >= 10) break
        }
        if (array[0] < 10 && array[l-1] >= 10 && smallTop) {
            array[0] = Math.log10(array[0])+array[l-1]
            array[l-1] = 0
            array[l] = 1
        }
    } while (array[0] >= 10)
    return [array[0], array[array.length-1], array.length-1]
}

function format(decimal, precision=2, small=false) {
    if (OmegaNum.isNaN(decimal)) return "NaN"
    let precision2 = Math.max(3, precision) // for e
    let precision3 = Math.max(4, precision) // for F, G, H
    let precision4 = Math.max(6, precision) // for J
    decimal = new OmegaNum(decimal)
    let array = decimal.array
    if (decimal.abs().lt(1e-308)) return (0).toFixed(precision)
    if (decimal.sign < 0) return "-" + format(decimal.neg(), precision)
    if (decimal.isInfinite()) return "Infinity"
    if (decimal.lt("0.0001")) { return format(decimal.rec(), precision) + "⁻¹" }
    else if (decimal.lt(1)) return regularFormat(decimal, precision + (small ? 2 : 0))
    else if (decimal.lt(1000)) return regularFormat(decimal, precision)
    else if (decimal.lt(1e9)) return commaFormat(decimal)
    else if (decimal.lt("10^^5")) {
        let rep = (array[1]||0)-1
        if (array[0] >= 1000000000) {
            array[0] = Math.log10(array[0])
            rep += 1
        }
        let m = 10**(array[0]-Math.floor(array[0]))
        let e = Math.floor(array[0])
        let p = array[0] < 1000 ? precision2 : 0
        return "e".repeat(rep) + regularFormat(m, p) + "e" + commaFormat(e)
    }
    else if (decimal.lt("10^^1000000")) {
        let pol = polarize(array)
        return regularFormat(pol[0], precision3) + "F" + commaFormat(pol[1])
    }
    else if (decimal.lt("10^^^5")) {
        if ((array[2]||0) >= 1){
            let rep = array[2]
            array[2] = 0
            return "F".repeat(rep) + format(array, precision)
        }
        let n = array[1] + 1
        if (decimal.gte("10^^" + (n + 1))) n += 1
        return "F" + format(n, precision)
    }
    else if (decimal.lt("10^^^1000000")) {
        let pol = polarize(array)
        return regularFormat(pol[0], precision3) + "G" + commaFormat(pol[1])
    }
    else if (decimal.lt("10^^^^5")) {
        if ((array[3]||0) >= 1){
            let rep = array[3]
            array[3] = 0
            return "G".repeat(rep) + format(array, precision)
        }
        let n = array[2] + 1
        if (decimal.gte("10^^^" + (n + 1))) n += 1
        return "G" + format(n, precision)
    }
    else if (decimal.lt("10^^^^1000000")) {
        let pol = polarize(array)
        return regularFormat(pol[0], precision3) + "H" + commaFormat(pol[1])
    }
    else if (decimal.lt("10^^^^^5")) {
        if ((array[4]||0) >= 1){
            let rep = array[4]
            array[4] = 0
            return "H".repeat(rep) + format(array, precision)
        }
        let n = array[3] + 1
        if (decimal.gte("10^^^^" + (n + 1))) n += 1
        return "H" + format(n, precision)
    }
    
    let pol = polarize(array, true)
    return regularFormat(Math.log10(pol[0]) + pol[1], precision4) + "J" + commaFormat(pol[2])
}

function formatWhole(decimal) {
    return format(decimal, 0)
}

function formatSmall(decimal, precision=2) { 
    return format(decimal, precision, true)    
}

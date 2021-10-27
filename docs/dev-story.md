# Development story

`letter-notation-format` implements PsiCubed's letter notation to format large numbers generated using large number libraries such as OmegaNum and ExpantaNum, suitable for incremental games. Here, I tell a story about its development.

## Act 1: OmegaNum

It all started when I was looking at the code for the [Communitree](https://ducdat0507.github.io/communitree/), which is a The Modding Tree (TMT) mod by ducdat0507 that uses [OmegaNum](https://github.com/Naruyoko/OmegaNum.js) in place of [break_eternity](https://github.com/Patashu/break_eternity.js) (the TMT default) to reach numbers even larger than the latter library's limit. In the `format` function in [NumberFormating.js](https://github.com/ducdat0507/communitree/blob/f340af964c259a84d3847010ee759888708535b5/js/utils/NumberFormating.js) [sic], which formats the numbers for display, in addition to the letter E, the letter F from PsiCubed's [letter notation](https://googology.wikia.org/wiki/User_blog:PsiCubed2/My_Letter_Notation) is used to display numbers that require tetration to represent. I noticed the developer tried to implement the letters G and H too, which would allow representing numbers in the pentational and hexational ranges, but commented that part of the code out, because OmegaNum doesn't provide analogues to `slog` (itself a tetrational analogue for `log`) for pentation and beyond. Instead, when E and F are exhausted, the code switches to the hyper-E notation format built into OmegaNum.

This is where I got the idea for properly implementing the letters G and H, as well as J, which would allow every number up to the limit of OmegaNum to be formatted in letter notation. I left that idea in my head for a while, without actually executing it, until I got the motivation to actually do it.

### Definitions

The letters E, F, G, and H are defined as:

* Ex = 10^x
* Fx = EEE...EEE(10^frac(x)) with int(x) E's
* Gx = FFF...FFF(10^frac(x)) with int(x) F's
* Hx = GGG...GGG(10^frac(x)) with int(x) G's

PsiCubed notes on [his blog post](https://googology.wikia.org/wiki/User_blog:PsiCubed2/My_Letter_Notation) that, for any integer n, En = 10^n, Fn = 10^^n, Gn = 10^^^n, and Hn = 10^^^^n.

Binary forms of the above letters are also defined on that blog post. Let A be one of the letters above, n be a non-negative integer, and x be a real number where 1 <= x < 10. Then:

xAn = A(n+log(x))

In particular, 1An = An. Plugging this into the definitions of E to H, we have:

* xEn = x*10^n
* xFn = EEE...EEEx with n E's = 10^10^...^10^10^x with n 10's = (10^)^n x
* xGn = FFF...FFFx with n F's = 10^^10^^...^^10^^10^^x with n 10's = (10^^)^n x
* xHn = GGG...GGGx with n G's = 10^^^10^^^...^^^10^^^10^^^x with n 10's = (10^^^)^n x

Now let's look at how OmegaNum works. Each OmegaNum value contains a `sign`, which can be either 1 or -1, and an `array`, which describes how large the number is. The array [a_0, a_1, a_2, a_3, ..., a_n] represents:

(10{n})^(a_n) ... (10^^^)^(a_3) (10^^)^(a_2) (10^)^(a_1) a_0

where {n} is shorthand for ^^^...^^^ with n arrows.

Notice the similarity between letter notation and how numbers are represented in OmegaNum? (10^)^(a_1) can be replaced with a_1 E's, (10^^)^(a_2) can be replaced with a_2 F's, and so on. The number represented by the array [a_0, a_1, a_2, a_3, a_4] can be represented in letter notation as HHH...HHHGGG...GGGFFF...FFFEEE...EEEa_0, where there are a_1, a_2, a_3 and a_4 E, F, G and H's, respectively.

For example, the array [19, 6, 80, 7] represents the number (10^^^)^7 (10^^)^80 eeeeee19, or GGGGGGGFFF...FFFEEEEEE19 (80 F's) in letter notation.

However, to work well as a number formatting system for incremental games, we need to output a compact expression like 1.1077H9, instead of long expressions like GGGGGGGFFF...FFFEEEEEE19. So how can we convert the latter to the former?

### Playing with G and H

On August 5, 2021, I started working on implementing the letters E, F, G and H. Actually, the work for the first two letters are already done by others; they're part of the original code (though I did change them somewhat). Which leads us to the next letter: G, which is used when formatting numbers 10^^^5 (1G5) and above.

To ensure that the format code is coded correctly, I need several examples of letter notation in the G to H ranges, so I could perform tests using these numbers. Fortunately, PsiCubed provides [a list of large numbers translated to letter notation](https://googology.wikia.org/wiki/User_blog:PsiCubed2/This_Wiki%27s_%22List_of_Googolisms%22_translated_to_Letter_Notation) that goes up to J10 (10{10}10), which is perfect for our purpose. Also, to keep using the format code while testing the new letters, I added extra F's to the left of the number to increase its size above 1G5, so that the G part of the code will be used. For example, 2F12 = 1.0374G2 becomes FFF2F12 = 1.0374G5. For H numbers, extra G's can be added to the left to increase the number above 1H5.

So how do we convert a long expression into a compact expression? To find that out, we need to do that in reverse: evaluate a letter notation expression. For example, with 1.0176G3:

1.0176G3  
= FFF1.0176  
= FFE10^0.0176 (here E is repeated once because int(1.0176) = 1)  
= FFE1.0413  
= FF10^1.0413  
= FF11

The same number, but in array form, would be:

[1.0176, 0, 3]  
= [1.0413, 1, 2]  
= [11, 0, 2]  
= [1, 11, 1]  
= [10, 10, 1]  
= [10000000000, 9, 1]

[10000000000, 9, 1] is the standard array for the number in OmegaNum, as `OmegaNum([11, 0, 2]).array` gives `[10000000000, 9, 1]`. We can apply this in reverse, starting with [10000000000, 9, 1] and ending with [1.0176, 0, 3]. What we established is a way to "convert" the array so that the middle elements are 0, and the first element is less than 10. If the resulting array is [x, 0, n], then the format result is xGn.

Here are some more examples I tried (equalities in reverse order):

* [100, 0, 3] = [2, 1, 3] = [1.3010, 0, 4], so FFF100 = 1.3010G4.
* [101.3010, 0, 3] = [2.0056, 1, 3] = [1.3022, 0, 4], so FFF101.3010 = 1.3022G4.
* [123456789, 123456789, 1] = [8.0915, 123456790, 1] = [123456790.9080, 0, 2] = [8.0915, 1, 2] = [1.9080, 0, 3], so F(E^123456789)123456789 = 1.9080G3.

The case for H can be done in a similar way:

1.0076H2  
= GG1.0076  
= GGF10^0.0076  
= GGF1.0176  
= GGE10^0.0176  
= GGE1.0413  
= GG10^1.0413  
= GG11

In array form:

[1.0076, 0, 0, 2]  
= [1.0176, 0, 1, 1]  
= [1.0413, 1, 0, 1]  
= [11, 0, 0, 1]

Another array example, in reverse order:

[12, 34, 56, 78]  
= [1.0791, 35, 56, 78]  
= [35.0331, 0, 57, 78]  
= [1.5444, 1, 57, 78]  
= [1.1887, 0, 58, 78]  
= [58.0751, 0, 0, 79]  
= [1.7640, 1, 0, 79]  
= [1.2465, 0, 1, 79]  
= [1.0956, 0, 0, 80]

This gives the expression 1.0956H80.

### Implementing G and H

To pick which letter to use when formatting a number, I divided the numbers that can be represented in OmegaNum to ranges. Here, I'll only list the ones that require F, G and H:

* 10^^5 ~ 10^^1,000,000: xFy format, 1F5 ~ 1F1,000,000
* 10^^1,000,000 ~ 10^^^5: F..Fx format, F1,000,000 ~ FFFF10
* 10^^^5 ~ 10^^^1,000,000: xGy format, 1G5 ~ 1G1,000,000
* 10^^^1,000,000 ~ 10^^^^5: G..Gx format, G1,000,000 ~ GGGG10
* 10^^^^5 ~ 10^^^^1,000,000: xHy format, 1H5 ~ 1H1,000,000
* 10^^^^1,000,000 ~ 10^^^^^5: H..Hx format, H1,000,000 ~ HHHH10
* 10^^^^^5 ~ limit of OmegaNum.js: xJy format (will be done later)

The "transitional" ranges, the ones that use F..Fx, G..Gx and H..Hx formats, were rather easy. In the case of F..Fx, if the array is longer than 2 elements (which means the number is above F(MAX_SAFE_INTEGER) = F9,007,199,254,740,991), write F times the value of the third element, followed by the result of formatting that array but the third element set to 0. If the number is less than that threshold, we can find out what to put to the right of F using the second element and OmegaNum's own compare function.

```javascript
if (decimal.lt("10^^^5")) {
    if ((array[2]||0) >= 1){
        let rep = array[2]
        array[2] = 0
        return "F".repeat(rep) + format(array, precision)
    }
    let n = array[1] + 1
    if (decimal.gte("10^^" + (n + 1))) n += 1
    return "F" + format(n, precision)
}
```

The ranges of G..Gx and H..Hx can be done in a similar way, each involving arrays one element longer than the previous letter.

That leaves the 1G5 ~ 1G1,000,000 and 1H5 ~ 1H1,000,000 ranges. Through trial and error, I coded what to do in these ranges, but they got quite cumbersome.

For G:

```javascript
if (decimal.lt("10^^^1000000")) {
    while (array[0] >= 10 || array[1] > 0) {
        while (array[0] >= 10) {
            array[0] = Math.log10(array[0])
            array[1] += 1
        }
        array[0] = Math.log10(array[0])+array[1]
        array[1] = 0
        array[2] += 1
    }
    return regularFormat(array[0], precision3) + "G" + commaFormat(array[2])
}
```

For H:

```javascript
if (decimal.lt("10^^^^1000000")) {
    while (array[0] >= 10 || array[1] > 0 || array[2] > 0) {
        while (array[0] >= 10 || array[1] > 0) {
            while (array[0] >= 10) {
                array[0] = Math.log10(array[0])
                array[1] += 1
            }
            array[0] = Math.log10(array[0])+array[1]
            array[1] = 0
            array[2] += 1
        }
        array[0] = Math.log10(array[0])+array[2]
        array[2] = 0
        array[3] += 1
    }
    return regularFormat(array[0], precision3) + "H" + commaFormat(array[3])
}
```

On August 6, I published the code up to this point as [a GitHub Gist](https://gist.github.com/cloudytheconqueror/10dc9c5698de3a630a01e53bb968a63e), and shared it on the TMT Discord server.

### Definition of J

So far, we have implemented all letters except J. This letter is defined differently from the previous letters, as you might have noticed that the letter I is skipped.

To define J, first define a generalization of the previous letters (see [this blog post](https://googology.wikia.org/wiki/User_blog:PsiCubed2/Letter_Notation_Part_II)):

* 1|x = Ex
* (n+1)|x = n|n|...|n|n|10^frac(x) with int(x) n's

This definition works as expected, as 2|x = Fx, 3|x = Gx, and 4|x = Hx. In general, if n is an integer, k|n = 10{k}n = 10^^...^^n with k arrows.

Next, define J as follows:

* For x<2: Jx = Gx
* For x>=2: Jx = (int(x)+1)|2*5^frac(x)

The case of x<2 is to make J1 equal 10 instead of 10^10, to prevent issues when defining later letters. Since we're exhausting E to H before using J (and therefore x>=4), we can skip this part for now, but it will be important in Act 2.

The binary version of J is defined in a [separate blog post](https://googology.wikia.org/wiki/User_blog:PsiCubed2/Letter_Notation_Part_III):

xJn = J(n+log5(x/2)) = (n+1)|x

For example, 10^^^^^5 (the point we switch from H to J) is equal to HHHH10 = HHHHH1 = 5|5 = 5J4. PsiCubed's [blog post](https://googology.wikia.org/wiki/User_blog:PsiCubed2/Letter_Notation_Part_II) contains more examples.

### Implementing J: introduction of polarize

To implement J, we need to do the same thing we did for G and H: make the middle element 0, and the first element less than 10. But this time, we need to handle arrays with arbitrary length. I wrote the algorithm that does this, as its own function. Since this algorithm works kind of like the reverse of `standardize` in OmegaNum (though not an exact reverse), and it makes everything except the first and last elements zero, I gave it the name `polarize`. Here's how the algorithm works:

1. If the first element is 10 or higher: set the first element to its own logarithm and increase the second element by 1. If the second element doesn't exist, set it to 1. Repeat until the first element is less than 10.
2. If the first element is less than 10:
  * Go to the first nonzero element after the first element.
  * Set the first element to its own logarithm plus the element you're on.
  * Set the element you're on to 0, and increase the next element by 1.
  * Repeat until the first element is 10 or higher, or you checked the second-to-last element.
3. If the first element is less than 10, you're done. Otherwise, go back to step 1.

For example, with [19, 6, 80, 7]:

1. Apply step 1: log(19) = 1.2787, [1.2787, 7, 80, 7]
2. Apply step 2 to second element: 7+log(1.2787) = 7.1067, [7.1067, 0, 81, 7]
3. Apply step 2 to third element: 81+log(7.1067) = 81.8516, [81.8516, 0, 0, 8]
4. Since the first element is now above 10, go back to step 1.
5. Apply step 1: log(81.8516) = 1.9130, [1.9130, 1, 0, 8]
6. Apply step 2 to second element: 1+log(1.9130) = 1.2817, [1.2817, 0, 1, 8]
7. Apply step 2 to third element: 1+log(1.2817) = 1.1077, [1.1077, 0, 0, 9]

Now what do we do with the result of this algorithm? For letters up to H, once you're done, put the first element to the left of the letter, and the last element to the right of the letter. In the above example, the array [19, 6, 80, 7] was polarized to [1.1077, 0, 0, 9], giving the formatted output 1.1077H9. (F is used with length 2 arrays, G is length 3, and H is length 4.)

The nested `while` loops shown above in the implementations for G and H can be shortened to a single call to the polarize function. F can be shortened in the same way too.

Now let's implement J. Recall that xJn = (n+1)|x = n|n|...|n|n|10^frac(x) with int(x) n's. If the polarize output is [b, 0, 0, ..., 0, 0, t] with t being the (n+1)-th entry, then the number is equal to n|n|...n|n|b with t n's, which equals (n+1)|(t+log(b)) = (t+log(b))Jn. However, if t is 10 or higher, the number on the left of the J would be 10 or higher, which we don't want.

This is where the `smallTop` argument to the polarize function comes in. This is `false` by default, but set to `true` when polarize is called from the J part of the format code. This argument forces the highest element to be less than 10, by increasing the array's length by one if required.

This argument, when enabled, adds another step after step 2. The polarize algorithm is now:

1. If the first element is 10 or higher: set the first element to its own logarithm and increase the second element by 1. If the second element doesn't exist, set it to 1. Repeat until the first element is less than 10.
2. If the first element is less than 10:
  * Go to the first nonzero element after the first element.
  * Set the first element to its own logarithm plus the element you're on.
  * Set the element you're on to 0, and increase the next element by 1.
  * Repeat until the first element is 10 or higher, or you checked the second-to-last element.
3. **If the first element is less than 10 and the last element is 10 or higher:**
  * Set the first element to its own logarithm plus the last element.
  * Set the last element to 0, and add a new element at the end, equal to 1.
4. If the first element is less than 10, you're done. Otherwise, go back to step 1.

Running step 3 will make the first element 10 or higher, so you go through steps 1 and 2 again.

For example, [12, 34, 56, 78] polarizes to [1.0956, 0, 0, 80]. But with `smallTop` set to true, we don't stop there:

1. Apply step 3: 80+log(1.0956) = (80.0396), [80,0396, 0, 0, 0, 1]
2. Apply step 1: log(80.0396) = 1.9033, [1.9033, 1, 0, 0, 1]
3. Apply step 2 to second element: 1+log(1.9033) = 1.2795, [1.2795, 0, 1, 0, 1]
4. Apply step 2 to third element: 1+log(1.2795) = 1.1070, [1.1070, 0, 0, 1, 1]
5. Apply step 2 to fourth element: 1+log(1.1070) = 1.0441, [1.0441, 0, 0, 0, 2]

This gives [1.0441, 0, 0, 0, 2] as the result, which is 1 element longer than the original result and the highest element is less than 10.

Now we can create the J representation: if the polarize result is [b, 0, 0, ..., 0, 0, t] where the array is n+1 entries long, the output is (t+log(b))Jn. For example, [1.0441, 0, 0, 0, 0, 2] (note one more zero than the previous example) becomes 2.0187J5 (since log(1.0441) = 0.0187 and the array length is 6).

On August 8, after testing the code against various letter notation examples, I updated the [original gist](https://gist.github.com/cloudytheconqueror/10dc9c5698de3a630a01e53bb968a63e) to add the implementation of J, which includes the complete polarize function, shown below:

```javascript
// Basically does the opposite of what standardize in OmegaNum does
function polarize(array, smallTop = false) {
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
```

On September 7, a modified version of the letter notation format code was added to the Communitree in the v0.4.2 update (and was voted in the Discord server to be the default notation), bringing us back to where we started. But the story doesn't end here...

## Act 2: ExpantaNum

(coming soon)


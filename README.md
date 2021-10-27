# letter-notation-format
* [Test format-omeganum.js here](https://cloudytheconqueror.github.io/letter-notation-format/)
* [Test format-expantanum.js here](https://cloudytheconqueror.github.io/letter-notation-format/expantanum.html)

## Description
Implementation of PsiCubed's letter notation for large number libraries, currently OmegaNum.js and ExpantaNum.js.

Based on [NumberFormating.js](https://github.com/ducdat0507/communitree/blob/f340af964c259a84d3847010ee759888708535b5/js/utils/NumberFormating.js) of [The Communitree](https://ducdat0507.github.io/communitree/) by ducdat0507, itself based on [The Modding Tree](https://github.com/Acamaeda/The-Modding-Tree) by Acamaeda (and ported to OmegaNum by upvoid), in turn based on The Prestige Tree by Jacorb and Aarex.

Expanded from the [original gist](https://gist.github.com/cloudytheconqueror/10dc9c5698de3a630a01e53bb968a63e).

Check out the [development story](https://github.com/cloudytheconqueror/letter-notation-format/blob/main/docs/dev-story.md).

## Letter notation resources
* [Definition of E to H, as well as x(letter)y notation](https://googology.wikia.org/wiki/User_blog:PsiCubed2/My_Letter_Notation)
* [Definition of J and K](https://googology.wikia.org/wiki/User_blog:PsiCubed2/Letter_Notation_Part_II)
* [Definition of xJy and xKy](https://googology.wikia.org/wiki/User_blog:PsiCubed2/Letter_Notation_Part_III)
* [Examples of letter notation up to 10{10}10](https://googology.wikia.org/wiki/User_blog:PsiCubed2/This_Wiki%27s_%22List_of_Googolisms%22_translated_to_Letter_Notation)

## Cases
For OmegaNum.js:
* 0 ~ 0.0001: Display reciprocal
* 0.0001 ~ 1: Display in additional precision if small is on
* 1 ~ 1000: Normal format
* 1000 ~ 1e9: Comma format
* 1e9 ~ 10^^5: Exponential format, as well as e..ex format
* 10^^5 ~ 10^^1,000,000: xFy format
* 10^^1,000,000 ~ 10^^^5: F..Fx format
* 10^^^5 ~ 10^^^1,000,000: xGy format
* 10^^^1,000,000 ~ 10^^^^5: G..Gx format
* 10^^^^5 ~ 10^^^^1,000,000: xHy format
* 10^^^^1,000,000 ~ 10^^^^^5: H..Hx format
* 10^^^^^5 ~ limit of OmegaNum.js: xJy format

For ExpantaNum.js:
* (same as above)
* 10^^^^^5 ~ J1,000,000: xJy format
* J1,000,000 ~ J^4 10: J..Jx format
* J^4 10 ~ J^999,999 10: xKy format
* J^999,999 10 ~ limit of ExpantaNum.js: Kx format

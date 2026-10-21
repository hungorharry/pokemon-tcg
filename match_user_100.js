const fs = require('fs');
const path = require('path');

const userListRaw = `
1. **Snorlax #51** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-51](https://www.pricecharting.com/game/pokemon-promo/snorlax-51)
2. **Eevee & Snorlax GX #SM169** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/eevee-&-snorlax-gx-sm169](https://www.pricecharting.com/game/pokemon-promo/eevee-&-snorlax-gx-sm169)
3. **Snorlax #11** (Pokemon Jungle) - [https://www.pricecharting.com/game/pokemon-jungle/snorlax-11](https://www.pricecharting.com/game/pokemon-jungle/snorlax-11)
4. **Snorlax #TG10** (Pokemon Lost Origin) - [https://www.pricecharting.com/game/pokemon-lost-origin/snorlax-tg10](https://www.pricecharting.com/game/pokemon-lost-origin/snorlax-tg10)
5. **Snorlax [1st Edition] #11** (Pokemon Jungle) - [https://www.pricecharting.com/game/pokemon-jungle/snorlax-1st-edition-11](https://www.pricecharting.com/game/pokemon-jungle/snorlax-1st-edition-11)
6. **Snorlax #119** (Pokemon 30th Celebration) - [https://www.pricecharting.com/game/pokemon-30th-celebration/snorlax-119](https://www.pricecharting.com/game/pokemon-30th-celebration/snorlax-119)
7. **Snorlax #XY179** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-xy179](https://www.pricecharting.com/game/pokemon-promo/snorlax-xy179)
8. **Snorlax [Reverse Holo] #64** (Pokemon Legendary Collection) - [https://www.pricecharting.com/game/pokemon-legendary-collection/snorlax-reverse-holo-64](https://www.pricecharting.com/game/pokemon-legendary-collection/snorlax-reverse-holo-64)
9. **Snorlax VMAX #142** (Pokemon Sword & Shield) - [https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-vmax-142](https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-vmax-142)
10. **Snorlax #181** (Pokemon Japanese Scarlet & Violet 151) - [https://www.pricecharting.com/game/pokemon-japanese-scarlet-&-violet-151/snorlax-181](https://www.pricecharting.com/game/pokemon-japanese-scarlet-&-violet-151/snorlax-181)
11. **Snorlax [Holo] #143** (Pokemon Japanese CD Promo) - [https://www.pricecharting.com/game/pokemon-japanese-cd-promo/snorlax-holo-143](https://www.pricecharting.com/game/pokemon-japanese-cd-promo/snorlax-holo-143)
12. **Snorlax Level X #111** (Pokemon Rising Rivals) - [https://www.pricecharting.com/game/pokemon-rising-rivals/snorlax-lvx-111](https://www.pricecharting.com/game/pokemon-rising-rivals/snorlax-lvx-111)
13. **Snorlax [Pokemon Center] #51** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-pokemon-center-51](https://www.pricecharting.com/game/pokemon-promo/snorlax-pokemon-center-51)
14. **Rocket's Snorlax EX #104** (Pokemon Team Rocket Returns) - [https://www.pricecharting.com/game/pokemon-team-rocket-returns/rocket%27s-snorlax-ex-104](https://www.pricecharting.com/game/pokemon-team-rocket-returns/rocket%27s-snorlax-ex-104)
15. **Snorlax [Series 1] #143** (Pokemon Japanese Vending) - [https://www.pricecharting.com/game/pokemon-japanese-vending/snorlax-series-1-143](https://www.pricecharting.com/game/pokemon-japanese-vending/snorlax-series-1-143)
16. **Hop's Snorlax #117** (Pokemon Journey Together) - [https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-117](https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-117)
17. **Snorlax GX #SM05** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-gx-sm05](https://www.pricecharting.com/game/pokemon-promo/snorlax-gx-sm05)
18. **Snorlax #224** (Pokemon Chilling Reign) - [https://www.pricecharting.com/game/pokemon-chilling-reign/snorlax-224](https://www.pricecharting.com/game/pokemon-chilling-reign/snorlax-224)
19. **Snorlax #49** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-49](https://www.pricecharting.com/game/pokemon-promo/snorlax-49)
20. **Eevee & Snorlax GX #120** (Pokemon Team Up) - [https://www.pricecharting.com/game/pokemon-team-up/eevee-&-snorlax-gx-120](https://www.pricecharting.com/game/pokemon-team-up/eevee-&-snorlax-gx-120)
21. **Snorlax #143** (Pokemon Japanese Jungle) - [https://www.pricecharting.com/game/pokemon-japanese-jungle/snorlax-143](https://www.pricecharting.com/game/pokemon-japanese-jungle/snorlax-143)
22. **Snorlax #10** (Pokemon Dragon Frontiers) - [https://www.pricecharting.com/game/pokemon-dragon-frontiers/snorlax-10](https://www.pricecharting.com/game/pokemon-dragon-frontiers/snorlax-10)
23. **Snorlax #27** (Pokemon Jungle) - [https://www.pricecharting.com/game/pokemon-jungle/snorlax-27](https://www.pricecharting.com/game/pokemon-jungle/snorlax-27)
24. **Snorlax VMAX #206** (Pokemon Sword & Shield) - [https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-vmax-206](https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-vmax-206)
25. **Snorlax #202** (Pokemon Paldean Fates) - [https://www.pricecharting.com/game/pokemon-paldean-fates/snorlax-202](https://www.pricecharting.com/game/pokemon-paldean-fates/snorlax-202)
26. **Snorlax #100** (Pokemon Skyridge) - [https://www.pricecharting.com/game/pokemon-skyridge/snorlax-100](https://www.pricecharting.com/game/pokemon-skyridge/snorlax-100)
27. **Snorlax [Reverse Holo] #10** (Pokemon Dragon Frontiers) - [https://www.pricecharting.com/game/pokemon-dragon-frontiers/snorlax-reverse-holo-10](https://www.pricecharting.com/game/pokemon-dragon-frontiers/snorlax-reverse-holo-10)
28. **Snorlax #77** (Pokemon Japanese Dark Phantasma) - [https://www.pricecharting.com/game/pokemon-japanese-dark-phantasma/snorlax-77](https://www.pricecharting.com/game/pokemon-japanese-dark-phantasma/snorlax-77)
29. **Snorlax #158** (Pokemon Unbroken Bonds) - [https://www.pricecharting.com/game/pokemon-unbroken-bonds/snorlax-158](https://www.pricecharting.com/game/pokemon-unbroken-bonds/snorlax-158)
30. **Rocket's Snorlax #33** (Pokemon Gym Heroes) - [https://www.pricecharting.com/game/pokemon-gym-heroes/rocket%27s-snorlax-33](https://www.pricecharting.com/game/pokemon-gym-heroes/rocket%27s-snorlax-33)
31. **Snorlax EX #76** (Pokemon Prismatic Evolutions) - [https://www.pricecharting.com/game/pokemon-prismatic-evolutions/snorlax-ex-76](https://www.pricecharting.com/game/pokemon-prismatic-evolutions/snorlax-ex-76)
32. **Eevee & Snorlax GX #66** (Pokemon Japanese Tag Bolt) - [https://www.pricecharting.com/game/pokemon-japanese-tag-bolt/eevee-&-snorlax-gx-66](https://www.pricecharting.com/game/pokemon-japanese-tag-bolt/eevee-&-snorlax-gx-66)
33. **Snorlax [1st Edition] #27** (Pokemon Jungle) - [https://www.pricecharting.com/game/pokemon-jungle/snorlax-1st-edition-27](https://www.pricecharting.com/game/pokemon-jungle/snorlax-1st-edition-27)
34. **Hop's Snorlax [Cosmos Holo] #117** (Pokemon Journey Together) - [https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-cosmos-holo-117](https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-cosmos-holo-117)
35. **Snorlax #63** (Pokemon Perfect Order) - [https://www.pricecharting.com/game/pokemon-perfect-order/snorlax-63](https://www.pricecharting.com/game/pokemon-perfect-order/snorlax-63)
36. **Snorlax [No Symbol] #11** (Pokemon Jungle) - [https://www.pricecharting.com/game/pokemon-jungle/snorlax-no-symbol-11](https://www.pricecharting.com/game/pokemon-jungle/snorlax-no-symbol-11)
37. **Eevee & Snorlax GX #171** (Pokemon Team Up) - [https://www.pricecharting.com/game/pokemon-team-up/eevee-&-snorlax-gx-171](https://www.pricecharting.com/game/pokemon-team-up/eevee-&-snorlax-gx-171)
38. **Snorlax #76** (Pokemon Japanese Double Blaze) - [https://www.pricecharting.com/game/pokemon-japanese-double-blaze/snorlax-76](https://www.pricecharting.com/game/pokemon-japanese-double-blaze/snorlax-76)
39. **Snorlax [Holo] #55** (Pokemon Go) - [https://www.pricecharting.com/game/pokemon-go/snorlax-holo-55](https://www.pricecharting.com/game/pokemon-go/snorlax-holo-55)
40. **Snorlax [Reverse Holo] #63** (Pokemon Perfect Order) - [https://www.pricecharting.com/game/pokemon-perfect-order/snorlax-reverse-holo-63](https://www.pricecharting.com/game/pokemon-perfect-order/snorlax-reverse-holo-63)
41. **Snorlax #30** (Pokemon Base Set 2) - [https://www.pricecharting.com/game/pokemon-base-set-2/snorlax-30](https://www.pricecharting.com/game/pokemon-base-set-2/snorlax-30)
42. **Eevee & Snorlax GX #191** (Pokemon Team Up) - [https://www.pricecharting.com/game/pokemon-team-up/eevee-&-snorlax-gx-191](https://www.pricecharting.com/game/pokemon-team-up/eevee-&-snorlax-gx-191)
43. **Snorlax [Reverse Holo] #100** (Pokemon Skyridge) - [https://www.pricecharting.com/game/pokemon-skyridge/snorlax-reverse-holo-100](https://www.pricecharting.com/game/pokemon-skyridge/snorlax-reverse-holo-100)
44. **Snorlax [Cosmos Holo] #140** (Pokemon Sword & Shield) - [https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-cosmos-holo-140](https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-cosmos-holo-140)
45. **Snorlax Level X #127/DP-P** (Pokemon Japanese Promo) - [https://www.pricecharting.com/game/pokemon-japanese-promo/snorlax-lvx-127-dp-p](https://www.pricecharting.com/game/pokemon-japanese-promo/snorlax-lvx-127-dp-p)
46. **Hop's Snorlax [EB Games] #117** (Pokemon Journey Together) - [https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-eb-games-117](https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-eb-games-117)
47. **Eevee & Snorlax GX #297/SM-P** (Pokemon Japanese Promo) - [https://www.pricecharting.com/game/pokemon-japanese-promo/eevee-&-snorlax-gx-297-sm-p](https://www.pricecharting.com/game/pokemon-japanese-promo/eevee-&-snorlax-gx-297-sm-p)
48. **Snorlax #77** (Pokemon Fates Collide) - [https://www.pricecharting.com/game/pokemon-fates-collide/snorlax-77](https://www.pricecharting.com/game/pokemon-fates-collide/snorlax-77)
49. **Snorlax #109** (Pokemon Crown Zenith) - [https://www.pricecharting.com/game/pokemon-crown-zenith/snorlax-109](https://www.pricecharting.com/game/pokemon-crown-zenith/snorlax-109)
50. **Snorlax #15** (Pokemon Fire Red & Leaf Green) - [https://www.pricecharting.com/game/pokemon-fire-red-&-leaf-green/snorlax-15](https://www.pricecharting.com/game/pokemon-fire-red-&-leaf-green/snorlax-15)
51. **Snorlax #122** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-122](https://www.pricecharting.com/game/pokemon-promo/snorlax-122)
52. **Snorlax VMAX #46** (Pokemon Japanese Shield) - [https://www.pricecharting.com/game/pokemon-japanese-shield/snorlax-vmax-46](https://www.pricecharting.com/game/pokemon-japanese-shield/snorlax-vmax-46)
53. **Snorlax V #141** (Pokemon Sword & Shield) - [https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-v-141](https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-v-141)
54. **Snorlax [Cosmos Holo] #55** (Pokemon Go) - [https://www.pricecharting.com/game/pokemon-go/snorlax-cosmos-holo-55](https://www.pricecharting.com/game/pokemon-go/snorlax-cosmos-holo-55)
55. **Snorlax [Holo] #131** (Pokemon Vivid Voltage) - [https://www.pricecharting.com/game/pokemon-vivid-voltage/snorlax-holo-131](https://www.pricecharting.com/game/pokemon-vivid-voltage/snorlax-holo-131)
56. **Rocket's Snorlax [1st Edition] #33** (Pokemon Gym Heroes) - [https://www.pricecharting.com/game/pokemon-gym-heroes/rocket%27s-snorlax-1st-edition-33](https://www.pricecharting.com/game/pokemon-gym-heroes/rocket%27s-snorlax-1st-edition-33)
57. **Rocket's Snorlax #143** (Pokemon Japanese Challenge from the Darkness) - [https://www.pricecharting.com/game/pokemon-japanese-challenge-from-the-darkness/rocket%27s-snorlax-143](https://www.pricecharting.com/game/pokemon-japanese-challenge-from-the-darkness/rocket%27s-snorlax-143)
58. **Snorlax GX #1/SM-P** (Pokemon Japanese Promo) - [https://www.pricecharting.com/game/pokemon-japanese-promo/snorlax-gx-1-sm-p](https://www.pricecharting.com/game/pokemon-japanese-promo/snorlax-gx-1-sm-p)
59. **Snorlax #101** (Pokemon Plasma Storm) - [https://www.pricecharting.com/game/pokemon-plasma-storm/snorlax-101](https://www.pricecharting.com/game/pokemon-plasma-storm/snorlax-101)
60. **Snorlax [Stamped] #131** (Pokemon Vivid Voltage) - [https://www.pricecharting.com/game/pokemon-vivid-voltage/snorlax-stamped-131](https://www.pricecharting.com/game/pokemon-vivid-voltage/snorlax-stamped-131)
61. **Snorlax #33** (Pokemon Call of Legends) - [https://www.pricecharting.com/game/pokemon-call-of-legends/snorlax-33](https://www.pricecharting.com/game/pokemon-call-of-legends/snorlax-33)
62. **Snorlax V #197** (Pokemon Sword & Shield) - [https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-v-197](https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-v-197)
63. **Snorlax [Holo] #SWSH119** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-holo-swsh119](https://www.pricecharting.com/game/pokemon-promo/snorlax-holo-swsh119)
64. **Snorlax [Reverse Holo] #15** (Pokemon Fire Red & Leaf Green) - [https://www.pricecharting.com/game/pokemon-fire-red-&-leaf-green/snorlax-reverse-holo-15](https://www.pricecharting.com/game/pokemon-fire-red-&-leaf-green/snorlax-reverse-holo-15)
65. **Hop's Snorlax [Gamestop] #117** (Pokemon Journey Together) - [https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-gamestop-117](https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-gamestop-117)
66. **Snorlax EX [Stamped] #76** (Pokemon Prismatic Evolutions) - [https://www.pricecharting.com/game/pokemon-prismatic-evolutions/snorlax-ex-stamped-76](https://www.pricecharting.com/game/pokemon-prismatic-evolutions/snorlax-ex-stamped-76)
67. **Snorlax #81** (Pokemon Rising Rivals) - [https://www.pricecharting.com/game/pokemon-rising-rivals/snorlax-81](https://www.pricecharting.com/game/pokemon-rising-rivals/snorlax-81)
68. **Snorlax #206** (Pokemon Fusion Strike) - [https://www.pricecharting.com/game/pokemon-fusion-strike/snorlax-206](https://www.pricecharting.com/game/pokemon-fusion-strike/snorlax-206)
69. **Snorlax #64** (Pokemon Legendary Collection) - [https://www.pricecharting.com/game/pokemon-legendary-collection/snorlax-64](https://www.pricecharting.com/game/pokemon-legendary-collection/snorlax-64)
70. **Snorlax [Holo] #143** (Pokemon Lost Origin) - [https://www.pricecharting.com/game/pokemon-lost-origin/snorlax-holo-143](https://www.pricecharting.com/game/pokemon-lost-origin/snorlax-holo-143)
71. **Snorlax #140** (Pokemon Sword & Shield) - [https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-140](https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-140)
72. **Snorlax #310** (Pokemon Japanese Shiny Treasure EX) - [https://www.pricecharting.com/game/pokemon-japanese-shiny-treasure-ex/snorlax-310](https://www.pricecharting.com/game/pokemon-japanese-shiny-treasure-ex/snorlax-310)
73. **Snorlax [Staff Pre-Release] #33** (Pokemon Call of Legends) - [https://www.pricecharting.com/game/pokemon-call-of-legends/snorlax-staff-pre-release-33](https://www.pricecharting.com/game/pokemon-call-of-legends/snorlax-staff-pre-release-33)
74. **Hop's Snorlax #136** (Pokemon Japanese Mega Dream EX) - [https://www.pricecharting.com/game/pokemon-japanese-mega-dream-ex/hop%27s-snorlax-136](https://www.pricecharting.com/game/pokemon-japanese-mega-dream-ex/hop%27s-snorlax-136)
75. **Snorlax [Prerelease] #33** (Pokemon Call of Legends) - [https://www.pricecharting.com/game/pokemon-call-of-legends/snorlax-prerelease-33](https://www.pricecharting.com/game/pokemon-call-of-legends/snorlax-prerelease-33)
76. **Snorlax [Reverse Holo] #109** (Pokemon Crown Zenith) - [https://www.pricecharting.com/game/pokemon-crown-zenith/snorlax-reverse-holo-109](https://www.pricecharting.com/game/pokemon-crown-zenith/snorlax-reverse-holo-109)
77. **Hop's Snorlax [Reverse Holo] #117** (Pokemon Journey Together) - [https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-reverse-holo-117](https://www.pricecharting.com/game/pokemon-journey-together/hop%27s-snorlax-reverse-holo-117)
78. **Snorlax #33** (Pokemon Rising Rivals) - [https://www.pricecharting.com/game/pokemon-rising-rivals/snorlax-33](https://www.pricecharting.com/game/pokemon-rising-rivals/snorlax-33)
79. **Snorlax #143** (Pokemon Scarlet & Violet 151) - [https://www.pricecharting.com/game/pokemon-scarlet-&-violet-151/snorlax-143](https://www.pricecharting.com/game/pokemon-scarlet-&-violet-151/snorlax-143)
80. **Snorlax #SWSH068** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-swsh068](https://www.pricecharting.com/game/pokemon-promo/snorlax-swsh068)
81. **Snorlax [Reverse Holo] #158** (Pokemon Unbroken Bonds) - [https://www.pricecharting.com/game/pokemon-unbroken-bonds/snorlax-reverse-holo-158](https://www.pricecharting.com/game/pokemon-unbroken-bonds/snorlax-reverse-holo-158)
82. **Snorlax [Reverse Holo] #77** (Pokemon Fates Collide) - [https://www.pricecharting.com/game/pokemon-fates-collide/snorlax-reverse-holo-77](https://www.pricecharting.com/game/pokemon-fates-collide/snorlax-reverse-holo-77)
83. **Snorlax [Cosmos Holo] #141** (Pokemon Rebel Clash) - [https://www.pricecharting.com/game/pokemon-rebel-clash/snorlax-cosmos-holo-141](https://www.pricecharting.com/game/pokemon-rebel-clash/snorlax-cosmos-holo-141)
84. **Snorlax #58** (Pokemon Generations) - [https://www.pricecharting.com/game/pokemon-generations/snorlax-58](https://www.pricecharting.com/game/pokemon-generations/snorlax-58)
85. **Snorlax #118** (Pokemon BREAKthrough) - [https://www.pricecharting.com/game/pokemon-breakthrough/snorlax-118](https://www.pricecharting.com/game/pokemon-breakthrough/snorlax-118)
86. **Snorlax #144** (Pokemon Surging Sparks) - [https://www.pricecharting.com/game/pokemon-surging-sparks/snorlax-144](https://www.pricecharting.com/game/pokemon-surging-sparks/snorlax-144)
87. **Eevee & Snorlax GX #103** (Pokemon Chinese CSM2cC) - [https://www.pricecharting.com/game/pokemon-chinese-csm2cc/eevee-&-snorlax-gx-103](https://www.pricecharting.com/game/pokemon-chinese-csm2cc/eevee-&-snorlax-gx-103)
88. **Snorlax [Cosmos Holo] #122** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-cosmos-holo-122](https://www.pricecharting.com/game/pokemon-promo/snorlax-cosmos-holo-122)
89. **Snorlax #SWSH032** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-swsh032](https://www.pricecharting.com/game/pokemon-promo/snorlax-swsh032)
90. **Snorlax VMAX [Jumbo] #142** (Pokemon Sword & Shield) - [https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-vmax-jumbo-142](https://www.pricecharting.com/game/pokemon-sword-&-shield/snorlax-vmax-jumbo-142)
91. **Snorlax [Reverse Holo] #143** (Pokemon Scarlet & Violet 151) - [https://www.pricecharting.com/game/pokemon-scarlet-&-violet-151/snorlax-reverse-holo-143](https://www.pricecharting.com/game/pokemon-scarlet-&-violet-151/snorlax-reverse-holo-143)
92. **Snorlax [Reverse Holo] #206** (Pokemon Fusion Strike) - [https://www.pricecharting.com/game/pokemon-fusion-strike/snorlax-reverse-holo-206](https://www.pricecharting.com/game/pokemon-fusion-strike/snorlax-reverse-holo-206)
93. **Snorlax [Master Ball] #143** (Pokemon Japanese Scarlet & Violet 151) - [https://www.pricecharting.com/game/pokemon-japanese-scarlet-&-violet-151/snorlax-master-ball-143](https://www.pricecharting.com/game/pokemon-japanese-scarlet-&-violet-151/snorlax-master-ball-143)
94. **Snorlax [Highlighter Error] #27** (Pokemon Jungle) - [https://www.pricecharting.com/game/pokemon-jungle/snorlax-highlighter-error-27](https://www.pricecharting.com/game/pokemon-jungle/snorlax-highlighter-error-27)
95. **Snorlax #169** (Pokemon Chinese 151 Collect) - [https://www.pricecharting.com/game/pokemon-chinese-151-collect/snorlax-169](https://www.pricecharting.com/game/pokemon-chinese-151-collect/snorlax-169)
96. **Snorlax Doll #175** (Pokemon Paradox Rift) - [https://www.pricecharting.com/game/pokemon-paradox-rift/snorlax-doll-175](https://www.pricecharting.com/game/pokemon-paradox-rift/snorlax-doll-175)
97. **Snorlax [Super High Tension]** (Pokemon Japanese Old Maid) - [https://www.pricecharting.com/game/pokemon-japanese-old-maid/snorlax-super-high-tension](https://www.pricecharting.com/game/pokemon-japanese-old-maid/snorlax-super-high-tension)
98. **Snorlax #16** (Pokemon Japanese Classic: Venusaur) - [https://www.pricecharting.com/game/pokemon-japanese-classic-venusaur/snorlax-16](https://www.pricecharting.com/game/pokemon-japanese-classic-venusaur/snorlax-16)
99. **Snorlax #136** (Pokemon Twilight Masquerade) - [https://www.pricecharting.com/game/pokemon-twilight-masquerade/snorlax-136](https://www.pricecharting.com/game/pokemon-twilight-masquerade/snorlax-136)
100. **Snorlax GX [Jumbo] #SM05** (Pokemon Promo) - [https://www.pricecharting.com/game/pokemon-promo/snorlax-gx-jumbo-sm05](https://www.pricecharting.com/game/pokemon-promo/snorlax-gx-jumbo-sm05)
`;

// Parse user list into objects
const lines = userListRaw.trim().split('\n');
const userCards = [];

lines.forEach(line => {
  const match = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s+\((.+?)\)\s+-\s+\[(https?:\/\/[^\]]+)\]/);
  if (match) {
    userCards.push({
      num: parseInt(match[1]),
      name: match[2].trim(),
      set: match[3].trim(),
      link: match[4].trim()
    });
  }
});

console.log('Successfully parsed user cards count:', userCards.length);

// Load crawled images
const crawled = JSON.parse(fs.readFileSync('./pricecharting_crawled_images.json', 'utf-8'));

// Build lookup maps
const linkToImage = new Map();
const titleToImage = new Map();

crawled.forEach(item => {
  let cleanLink = item.link.replace('https://www.pricecharting.comhttps://www.pricecharting.com', 'https://www.pricecharting.com').trim();
  // Decode URL encoded characters
  cleanLink = decodeURIComponent(cleanLink).toLowerCase();
  
  // Convert 60.jpg to 1600.jpg for Ultra HD
  const hdImg = item.image.replace(/\/60\.jpg$/i, '/1600.jpg');
  linkToImage.set(cleanLink, hdImg);
  
  // also path only: /game/...
  try {
    const url = new URL(cleanLink);
    linkToImage.set(url.pathname.toLowerCase(), hdImg);
  } catch(e) {}
  
  const cleanTitle = item.title.replace(/&amp;/g, '&').toLowerCase().trim();
  titleToImage.set(cleanTitle, hdImg);
});

let matchedCount = 0;
const results = [];

userCards.forEach(uc => {
  let foundImg = null;
  const decodedUserLink = decodeURIComponent(uc.link).toLowerCase();
  
  if (linkToImage.has(decodedUserLink)) {
    foundImg = linkToImage.get(decodedUserLink);
  } else {
    try {
      const u = new URL(decodedUserLink);
      if (linkToImage.has(u.pathname.toLowerCase())) {
        foundImg = linkToImage.get(u.pathname.toLowerCase());
      }
    } catch(e) {}
  }
  
  if (!foundImg) {
    const cleanUserTitle = uc.name.toLowerCase().trim();
    if (titleToImage.has(cleanUserTitle)) {
      foundImg = titleToImage.get(cleanUserTitle);
    }
  }
  
  if (foundImg) {
    matchedCount++;
  }
  
  results.push({
    ...uc,
    image_url: foundImg
  });
});

console.log('Directly matched images from crawl:', matchedCount, '/', userCards.length);

const missing = results.filter(r => !r.image_url);
console.log('Missing count:', missing.length);
if (missing.length > 0) {
  console.log('Sample missing:', missing.slice(0, 10));
}

fs.writeFileSync('./user_100_parsed.json', JSON.stringify(results, null, 2), 'utf-8');

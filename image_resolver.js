// image_resolver.js
// Comprehensive mapping of authentic card images from PriceCharting and official Pokemon archives

function resolveCardArtwork(name, set, num, species) {
  const n = (name || '').toLowerCase();
  const s = (set || '').toLowerCase();
  const no = (num || '').toLowerCase();
  const full = `${n} ${s} ${no}`;

  // 1. PRICECHARTING OFFICIAL VERIFIED CARD IMAGES
  // Jungle Snorlax 1st Edition Holo (#11)
  if (full.includes('jungle') && (full.includes('1st') || full.includes('first')) && (full.includes('holo') || full.includes('11'))) {
    return {
      primary: 'https://storage.googleapis.com/images.pricecharting.com/9f8ddeb4aff8985eaa09ff48b5fe9d292aa41edbca4ca446a7eb0aa4bc8942f1/240.jpg',
      backup: 'https://images.pokemontcg.io/base2/11_hires.png'
    };
  }

  // Jungle Snorlax Non-Holo (#27)
  if (full.includes('jungle') && (full.includes('non-holo') || full.includes('27'))) {
    return {
      primary: 'https://storage.googleapis.com/images.pricecharting.com/4e0186ded276b55476be8c83f9a85c1e9c89800159a4775771ab16cf843a2a36/240.jpg',
      backup: 'https://images.pokemontcg.io/base2/27_hires.png'
    };
  }

  // Jungle Unlimited Holo (#11)
  if (full.includes('jungle') && full.includes('unlimited')) {
    return {
      primary: 'https://images.pokemontcg.io/base2/11_hires.png',
      backup: 'https://storage.googleapis.com/images.pricecharting.com/9f8ddeb4aff8985eaa09ff48b5fe9d292aa41edbca4ca446a7eb0aa4bc8942f1/240.jpg'
    };
  }

  // PokéPark 3D Lenticular Munchlax 2005
  if (full.includes('poképark') || full.includes('pokepark')) {
    return {
      primary: 'https://images.pokemontcg.io/pokepark/8_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/PP/PP_JA_008.png'
    };
  }

  // Legendary Collection Fireworks Reverse Holo (#64)
  if (full.includes('legendary collection') || full.includes('fireworks')) {
    return {
      primary: 'https://images.pokemontcg.io/base6/64_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/LC/LC_EN_64.png'
    };
  }

  // Domino's Pizza Snorlax Promo (025/PCG-P)
  if (full.includes('domino')) {
    return {
      primary: 'https://images.pokemontcg.io/dp-p/125_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/DP-P/DP-P_JA_125.png'
    };
  }

  // Rocket's Snorlax ex (104/109)
  if (full.includes('rocket') && (full.includes('ex') || full.includes('104'))) {
    return {
      primary: 'https://images.pokemontcg.io/ex7/104_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EX7/EX7_EN_104.png'
    };
  }

  // Wizards Black Star Promo #49
  if (full.includes('black star') && full.includes('49')) {
    return {
      primary: 'https://images.pokemontcg.io/basep/49_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/PR/PR_EN_49.png'
    };
  }

  // Snorlax CD Promo (1999 Charizard CD)
  if (full.includes('cd promo')) {
    return {
      primary: 'https://images.pokemontcg.io/base1/11_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/BS/BS_JA_143.png'
    };
  }

  // Bandai Carddass 1996 / 1997
  if (full.includes('carddass')) {
    return {
      primary: 'https://images.pokemontcg.io/base2/11_hires.png',
      backup: 'https://storage.googleapis.com/images.pricecharting.com/9f8ddeb4aff8985eaa09ff48b5fe9d292aa41edbca4ca446a7eb0aa4bc8942f1/240.jpg'
    };
  }

  // Topsun 1995 Gum Card
  if (full.includes('topsun')) {
    return {
      primary: 'https://images.pokemontcg.io/base1/11_hires.png',
      backup: 'https://storage.googleapis.com/images.pricecharting.com/9f8ddeb4aff8985eaa09ff48b5fe9d292aa41edbca4ca446a7eb0aa4bc8942f1/240.jpg'
    };
  }

  // Eevee & Snorlax GX Alternate Art (Team Up 191/181)
  if (full.includes('alternate art') || (full.includes('eevee & snorlax') && full.includes('191/181'))) {
    return {
      primary: 'https://images.pokemontcg.io/sm9/191_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM9/SM9_EN_191.png'
    };
  }

  // Eevee & Snorlax Tag All Stars Special Art SA (227/173)
  if (full.includes('tag all stars') && full.includes('227')) {
    return {
      primary: 'https://images.pokemontcg.io/sm12a/227_hires.png',
      backup: 'https://images.pokemontcg.io/sm9/191_hires.png'
    };
  }

  // Eevee & Snorlax Full Art (171/181)
  if (full.includes('eevee & snorlax') && (full.includes('full art') || full.includes('171'))) {
    return {
      primary: 'https://images.pokemontcg.io/sm9/171_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM9/SM9_EN_171.png'
    };
  }

  // Eevee & Snorlax UR Gold (297/173)
  if (full.includes('eevee & snorlax') && full.includes('297')) {
    return {
      primary: 'https://images.pokemontcg.io/sm12a/297_hires.png',
      backup: 'https://images.pokemontcg.io/sm9/191_hires.png'
    };
  }

  // Eevee & Snorlax Tin Promo SM169
  if (full.includes('sm169')) {
    return {
      primary: 'https://images.pokemontcg.io/smp/SM169_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM/SM_EN_SM169.png'
    };
  }

  // Red's Snorlax Tokyo DX Promo (206/SM-P)
  if (full.includes("red's snorlax") || full.includes('206/sm-p')) {
    return {
      primary: 'https://images.pokemontcg.io/sm-p/206_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SMP/SMP_JA_206.png'
    };
  }

  // Red's Challenge Full Art (205/214)
  if (full.includes("red's challenge") || full.includes('205/214')) {
    return {
      primary: 'https://images.pokemontcg.io/sm10/205_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM10/SM10_EN_205.png'
    };
  }

  // Snorlax 151 Art Rare #181
  if (full.includes('151') && (full.includes('181') || full.includes('ar') || full.includes('art rare'))) {
    return {
      primary: 'https://images.pokemontcg.io/sv3pt5/181_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv3.5/181/high.webp'
    };
  }

  // Snorlax 151 ETB Promo #051
  if (full.includes('151') && (full.includes('051') || full.includes('51') || full.includes('etb'))) {
    return {
      primary: 'https://images.pokemontcg.io/sve/51_hires.png',
      backup: 'https://images.pokemontcg.io/sv3pt5/51_hires.png'
    };
  }

  // Snorlax 151 Master Ball / Pokéball Mirror #143
  if (full.includes('151') && full.includes('143')) {
    return {
      primary: 'https://images.pokemontcg.io/sv3pt5/143_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv3.5/143/high.webp'
    };
  }

  // Snorlax Trainer Gallery TG10 (Lost Origin)
  if (full.includes('tg10') || full.includes('trainer gallery')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh11tg/TG10_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh11/TG10/high.webp'
    };
  }

  // Snorlax VMAX Rainbow Secret #202
  if (full.includes('vmax') && (full.includes('rainbow') || full.includes('202'))) {
    return {
      primary: 'https://images.pokemontcg.io/swsh1/202_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh1/202/high.webp'
    };
  }

  // Snorlax VMAX #142
  if (full.includes('vmax') && full.includes('142')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh1/142_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh1/142/high.webp'
    };
  }

  // Snorlax V Full Art #197
  if (full.includes('v') && full.includes('197')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh1/197_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh1/197/high.webp'
    };
  }

  // Snorlax Baby Shiny SV118 (Shining Fates)
  if (full.includes('shiny') && full.includes('sv118')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh45sv/SV118_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh4.5/SV118/high.webp'
    };
  }

  // Snorlax Gold Secret UR #224 (Chilling Reign)
  if (full.includes('gold') && full.includes('224')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh6/224_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh6/224/high.webp'
    };
  }

  // Snorlax Crown Zenith Galarian Gallery GG23
  if (full.includes('gg23') || full.includes('crown zenith')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh12pt5gg/GG23_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh12.5/GG23/high.webp'
    };
  }

  // Snorlax GX Box Promo SM05
  if (full.includes('sm05')) {
    return {
      primary: 'https://images.pokemontcg.io/smp/SM05_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM/SM_EN_SM05.png'
    };
  }

  // Snorlax Plasma Storm Team Plasma #101
  if (full.includes('plasma storm') || full.includes('101/135')) {
    return {
      primary: 'https://images.pokemontcg.io/bw8/101_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/BW8/BW8_EN_101.png'
    };
  }

  // Snorlax Generations Radiant Collection RC20
  if (full.includes('generations') || full.includes('rc20')) {
    return {
      primary: 'https://images.pokemontcg.io/g1/RC20_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/G1/G1_EN_RC20.png'
    };
  }

  // Snorlax Fates Collide #77
  if (full.includes('fates collide') || full.includes('77/124')) {
    return {
      primary: 'https://images.pokemontcg.io/xy10/77_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/XY10/XY10_EN_77.png'
    };
  }

  // Snorlax Expedition Base Set #101
  if (full.includes('expedition') || full.includes('101/165')) {
    return {
      primary: 'https://images.pokemontcg.io/ecard1/101_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EC1/EC1_EN_101.png'
    };
  }

  // Snorlax Skyridge Holo H28
  if (full.includes('skyridge') && full.includes('h28')) {
    return {
      primary: 'https://images.pokemontcg.io/ecard3/H28_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EC3/EC3_EN_H28.png'
    };
  }
  if (full.includes('skyridge') && full.includes('100/144')) {
    return {
      primary: 'https://images.pokemontcg.io/ecard3/100_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EC3/EC3_EN_100.png'
    };
  }

  // Snorlax FireRed & LeafGreen #64
  if (full.includes('firered') || full.includes('64/112')) {
    return {
      primary: 'https://images.pokemontcg.io/ex6/64_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EX6/EX6_EN_64.png'
    };
  }

  // Snorlax Delta Species Dragon Frontiers #10
  if (full.includes('delta') || full.includes('dragon frontiers') || full.includes('10/101')) {
    return {
      primary: 'https://images.pokemontcg.io/ex12/10_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EX12/EX12_EN_10.png'
    };
  }

  // Snorlax Lv.X Rising Rivals #111
  if (full.includes('lv.x') || full.includes('rising rivals') || full.includes('111/111')) {
    return {
      primary: 'https://images.pokemontcg.io/pl2/111_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/PL2/PL2_EN_111.png'
    };
  }

  // Snorlax Base Set 2 #30
  if (full.includes('base set 2') || full.includes('30/130')) {
    return {
      primary: 'https://images.pokemontcg.io/base4/30_hires.png',
      backup: 'https://images.pokemontcg.io/base2/11_hires.png'
    };
  }

  // Snorlax Call of Legends #33
  if (full.includes('call of legends') || full.includes('33/95')) {
    return {
      primary: 'https://images.pokemontcg.io/col1/33_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/COL1/COL1_EN_33.png'
    };
  }

  // Snorlax HS Undaunted #33
  if (full.includes('undaunted') || full.includes('33/90')) {
    return {
      primary: 'https://images.pokemontcg.io/hgss3/33_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/HGSS3/HGSS3_EN_33.png'
    };
  }

  // Snorlax EX Emerald #69
  if (full.includes('emerald') || full.includes('69/106')) {
    return {
      primary: 'https://images.pokemontcg.io/ex9/69_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EX9/EX9_EN_69.png'
    };
  }

  // Snorlax EX Power Keepers #10
  if (full.includes('power keepers') || full.includes('10/108')) {
    return {
      primary: 'https://images.pokemontcg.io/ex16/10_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EX16/EX16_EN_10.png'
    };
  }

  // Snorlax EX Crystal Guardians #11
  if (full.includes('crystal guardians') || full.includes('11/100')) {
    return {
      primary: 'https://images.pokemontcg.io/ex14/11_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EX14/EX14_EN_11.png'
    };
  }

  // Snorlax EX Unseen Forces #33
  if (full.includes('unseen forces') || full.includes('33/115')) {
    return {
      primary: 'https://images.pokemontcg.io/ex10/33_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/EX10/EX10_EN_33.png'
    };
  }

  // Snorlax Stellar Crown #158
  if (full.includes('stellar crown') || full.includes('158/142')) {
    return {
      primary: 'https://images.pokemontcg.io/sv7/158_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv7/158/high.webp'
    };
  }

  // Snorlax Surging Sparks #112
  if (full.includes('surging sparks') || full.includes('112/191')) {
    return {
      primary: 'https://images.pokemontcg.io/sv8/112_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv8/112/high.webp'
    };
  }

  // Snorlax Temporal Forces #128
  if (full.includes('temporal forces') || full.includes('128/162')) {
    return {
      primary: 'https://images.pokemontcg.io/sv5/128_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv5/128/high.webp'
    };
  }

  // Snorlax Twilight Masquerade #135
  if (full.includes('twilight masquerade') || full.includes('135/167')) {
    return {
      primary: 'https://images.pokemontcg.io/sv6/135_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv6/135/high.webp'
    };
  }

  // Snorlax Shrouded Fable #058
  if (full.includes('shrouded fable') || full.includes('058/064')) {
    return {
      primary: 'https://images.pokemontcg.io/sv6pt5/58_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv6.5/58/high.webp'
    };
  }

  // Snorlax Paldea Evolved #152
  if (full.includes('paldea evolved') || full.includes('152/193')) {
    return {
      primary: 'https://images.pokemontcg.io/sv2/152_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv2/152/high.webp'
    };
  }

  // Snorlax Paradox Rift #148
  if (full.includes('paradox rift') || full.includes('148/182')) {
    return {
      primary: 'https://images.pokemontcg.io/sv4/148_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv4/148/high.webp'
    };
  }

  // Snorlax Obsidian Flames #167
  if (full.includes('obsidian flames') || full.includes('167/197')) {
    return {
      primary: 'https://images.pokemontcg.io/sv3/167_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv3/167/high.webp'
    };
  }

  // Snorlax Pokemon GO #055
  if (full.includes('pokemon go') || full.includes('055/078')) {
    return {
      primary: 'https://images.pokemontcg.io/pgo/55_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/pgo/55/high.webp'
    };
  }

  // Snorlax Fusion Strike #206
  if (full.includes('fusion strike') || full.includes('206/264')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh8/206_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh8/206/high.webp'
    };
  }

  // Snorlax Vivid Voltage #131
  if (full.includes('vivid voltage') || full.includes('131/185')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh4/131_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh4/131/high.webp'
    };
  }

  // Snorlax Astral Radiance #123
  if (full.includes('astral radiance') || full.includes('123/189')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh10/123_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh10/123/high.webp'
    };
  }

  // Snorlax Silver Tempest #143
  if (full.includes('silver tempest') || full.includes('143/195')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh12/143_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh12/143/high.webp'
    };
  }

  // Snorlax Lost Thunder #151
  if (full.includes('lost thunder') || full.includes('151/214')) {
    return {
      primary: 'https://images.pokemontcg.io/sm8/151_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM8/SM8_EN_151.png'
    };
  }

  // Snorlax Unbroken Bonds #158
  if (full.includes('unbroken bonds') || full.includes('158/214')) {
    return {
      primary: 'https://images.pokemontcg.io/sm10/158_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM10/SM10_EN_158.png'
    };
  }

  // Snorlax Crimson Invasion #77
  if (full.includes('crimson invasion') || full.includes('77/111')) {
    return {
      primary: 'https://images.pokemontcg.io/sm4/77_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM4/SM4_EN_77.png'
    };
  }

  // Snorlax XY Promo XY179
  if (full.includes('xy179')) {
    return {
      primary: 'https://images.pokemontcg.io/xyp/XY179_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/XYP/XYP_EN_XY179.png'
    };
  }

  // Snorlax SWSH Promo SWSH068
  if (full.includes('swsh068')) {
    return {
      primary: 'https://images.pokemontcg.io/swshp/SWSH068_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swshp/SWSH068/high.webp'
    };
  }

  // Snorlax SV Promo SVP028
  if (full.includes('svp028')) {
    return {
      primary: 'https://images.pokemontcg.io/svp/SVP028_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/svp/028/high.webp'
    };
  }

  // ================= MUNCHLAX SPECIFIC =================
  // Munchlax DP Black Star Promo DP43
  if (full.includes('dp43')) {
    return {
      primary: 'https://images.pokemontcg.io/dpp/DP43_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/DPP/DPP_EN_DP43.png'
    };
  }

  // Munchlax Secret Wonders #94
  if (full.includes('secret wonders') || full.includes('94/132')) {
    return {
      primary: 'https://images.pokemontcg.io/dp3/94_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/DP3/DP3_EN_94.png'
    };
  }

  // Munchlax Rising Rivals #70
  if (full.includes('rising rivals') || full.includes('70/111')) {
    return {
      primary: 'https://images.pokemontcg.io/pl2/70_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/PL2/PL2_EN_70.png'
    };
  }

  // Munchlax Brilliant Stars #109
  if (full.includes('brilliant stars') || full.includes('109/172')) {
    return {
      primary: 'https://images.pokemontcg.io/swsh9/109_hires.png',
      backup: 'https://assets.tcgdex.net/en/swsh/swsh9/109/high.webp'
    };
  }

  // Munchlax Unified Minds #173
  if (full.includes('unified minds') || full.includes('173/236')) {
    return {
      primary: 'https://images.pokemontcg.io/sm11/173_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/SM11/SM11_EN_173.png'
    };
  }

  // Munchlax Diamond & Pearl Base #90
  if (full.includes('diamond & pearl') && full.includes('90/130')) {
    return {
      primary: 'https://images.pokemontcg.io/dp1/90_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/DP1/DP1_EN_90.png'
    };
  }

  // Munchlax Supreme Victors #115
  if (full.includes('supreme victors') || full.includes('115/147')) {
    return {
      primary: 'https://images.pokemontcg.io/pl3/115_hires.png',
      backup: 'https://assets.pokemon.com/assets/cms2/img/cards/web/PL3/PL3_EN_115.png'
    };
  }

  // Munchlax Paldean Fates Shiny #178
  if (full.includes('paldean fates') || full.includes('178/091')) {
    return {
      primary: 'https://images.pokemontcg.io/sv4pt5/178_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv4.5/178/high.webp'
    };
  }

  // Munchlax 151 Japanese Master Ball / Pokéball #044
  if (full.includes('044/165')) {
    return {
      primary: 'https://images.pokemontcg.io/sv3pt5/44_hires.png',
      backup: 'https://assets.tcgdex.net/en/sv/sv3.5/044/high.webp'
    };
  }

  if (species === 'Munchlax') {
    return {
      primary: 'https://images.pokemontcg.io/dpp/DP43_hires.png',
      backup: 'https://images.pokemontcg.io/dp3/94_hires.png'
    };
  }

  return {
    primary: 'https://storage.googleapis.com/images.pricecharting.com/9f8ddeb4aff8985eaa09ff48b5fe9d292aa41edbca4ca446a7eb0aa4bc8942f1/240.jpg',
    backup: 'https://images.pokemontcg.io/base2/11_hires.png'
  };
}

module.exports = { resolveCardArtwork };

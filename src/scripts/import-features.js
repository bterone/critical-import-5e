const KNOWN_SECTION_HEADERS = [
  "actions",
  "bonus actions",
  "reactions",
  "legendary actions",
  "lair actions",
  "regional effects",
];
const SPELLCASTING_RGX = /(\bat will\b|\d\/\bday\b.+)\:.+/i;

export function gatherFeatures(actorData) {
  const lines = actorData.trim().split(/\n/g);

  // remove actions to reduce error possibilities
  for (const idx in lines) {
    const l = lines[idx];
    const line = l.trim().toLocaleLowerCase();
    if (KNOWN_SECTION_HEADERS.includes(line)) {
      lines.splice(idx);
      break;
    }
  }

  const idx = getSpellcastingIdx(lines);
  const spellcasting = gatherSpellcasting(lines, idx);
  console.log("spellcasting", spellcasting);

  const featureRgx = /.*(\r|\n|\r\n){2}(?<name>[a-zA-Z\s]+)\.(?<desc>.+)/gi;
  const shortActorData = lines.join(`\n`);
  const features = [];
  let match;
  while ((match = featureRgx.exec(shortActorData)) != null) {
    const m = match.groups;
    if (m) {
      features.push(m);
    }
  }
  console.log("features", features);
}

function getSpellcastingIdx(lines) {
  const KNOWN_SPELLCASTING_IDENTIFIER = ["spellcasting", "innate spellcasting"];

  for (const idx in lines) {
    const l = lines[idx];
    if (typeof l !== "string") {
      continue;
    }

    const line = l.trim().toLocaleLowerCase();
    for (const identifier of KNOWN_SPELLCASTING_IDENTIFIER) {
      if (line.includes(identifier)) {
        return idx;
      }
    }
  }
  return undefined;
}

function gatherSpellcasting(lines, startIdx) {
  const spellcasting = [];
  if (startIdx) {
    const featDesc = lines.splice(startIdx, 1);
    spellcasting.push(featDesc);

    // spells as lines
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      if (!SPELLCASTING_RGX.exec(line)) {
        continue;
      }
      const ln = lines.splice(i, 1);
      spellcasting.push(ln);
    }
  }
  return spellcasting;
}

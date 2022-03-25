export function gatherFeatures(actorData) {
  const KNOWN_SECTION_HEADERS = [
    "actions",
    "bonus actions",
    "reactions",
    "legendary actions",
    "lair actions",
    "regional effects",
  ];

  const lines = actorData.trim().split(/\n/g);

  // remove actions to reduce error possibilities
  for (const idx in lines) {
    const l = lines[idx];
    const line = l.trim().toLocaleLowerCase();
    if (KNOWN_SECTION_HEADERS.includes(line)) {
      const removed = lines.splice(idx);
      console.log("removed", removed);
      console.log("lines", lines);
      break;
    }
  }

  // todo remove spellcasting from lines
  const KNOWN_SPELLCASTING_IDENTIFIER = ["spellcasting", "innate spellcasting"];
  const spellcastingRgx = /(\bat will\b|\d\/\bday\b.+)\:.+/i;

  function getSpellcastingIdx() {
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
  const idx = getSpellcastingIdx();

  function gatherSpellcasting(lines) {
    const spellcasting = [];
    if (idx) {
      const featDesc = lines.splice(idx, 1);
      spellcasting.push(featDesc);

      // spells as lines
      for (let i = idx; i < lines.length; i++) {
        const line = lines[i];
        if (!spellcastingRgx.exec(line)) {
          continue;
        }
        const ln = lines.splice(i, 1);
        spellcasting.push(ln);
      }
    }
    return spellcasting;
  }
  const spellcasting = gatherSpellcasting(lines);
  console.log("spellcasting", spellcasting);

  function gatherFeatures(actorData) {
    const featureRgx = /.*(\r|\n|\r\n){2}(?<name>[a-zA-Z\s]+)\.(?<desc>.+)/gi;
    const features = [];
    let match;
    while ((match = featureRgx.exec(actorData)) != null) {
      const m = match.groups;
      if (m) {
        features.push(m);
      }
    }
    return features;
  }
  const features = gatherFeatures(lines.join(`\n`));
  console.log("features", features);
}

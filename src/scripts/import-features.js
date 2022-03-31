import { logConsole } from "./log";
import { trimElements } from "./common";

const KNOWN_SECTION_HEADERS = [
  "actions",
  "bonus actions",
  "reactions",
  "legendary actions",
  "lair actions",
  "regional effects",
];
// const SPELLCASTING_AT_WILL_RGX = /(\bat will\b|\d\/\bday\b.+)\:.+/i;
const CANTRIP_RGX = /\bcantrips\b.+\:\s?(?<cantrips>.+)/i;
const SPELLS_BY_LEVEL_RGX =
  /(?<level>\d+)\w+\s\blevel\b.+(?<slots>\d+)\s?\bslot.?\b\)\:\s?(?<spells>.+)/i;

export function gatherFeatures(actorData) {
  const features = {};
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
  logConsole("spellcasting", spellcasting);
  features.spellcasting = spellcasting;

  const featureRgx = /.*(\r|\n|\r\n)+(?<name>[a-zA-Z\s]+)\.(?<desc>.+)/gi;
  const shortActorData = lines.join(`\n`);
  const feats = [];
  let match;
  while ((match = featureRgx.exec(shortActorData)) != null) {
    const m = match.groups;
    if (m) {
      feats.push(m);
    }
  }
  features.feats = feats;
  return features;
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
  if (!startIdx) {
    return;
  }

  const spellcastingBasicsRgx =
    /((?<innate>\binnate spellcasting\b)\.|(?<casting>\bspellcasting\b)\.).+\bability is\b\s(?<ability>[a-zA-Z]+).+\bsave dc\b\s(?<dc>\d+)\,?\s?(?<hitBonus>(\+|\-)\d)/gi;

  const spellcasting = {};
  const spellCastingText = lines.splice(startIdx, 1)[0];
  spellcasting.desc = spellCastingText;
  const castingBasics = spellcastingBasicsRgx.exec(spellCastingText);
  spellcasting.basics = castingBasics.groups;

  const castingLines = lines.splice(startIdx).filter((element) => {
    return element != "";
  });

  if (spellcasting.basics.innate) {
    // Innate Spellcasting
    spellcasting.spells = gatherInnateSpells(castingLines);
  } else if (spellcasting.basics.casting) {
    // Spellcasting
    spellcasting.spells = gatherSpells(castingLines);
  }

  return spellcasting;
}

function gatherInnateSpells(castingLines) {
  // todo
}

function gatherSpells(castingLines) {
  const spellList = [];
  let cantrips;

  for (const line of castingLines) {
    const cantripMatch = CANTRIP_RGX.exec(line);
    const spellMatch = SPELLS_BY_LEVEL_RGX.exec(line);
    if (cantripMatch) {
      const m = cantripMatch.groups;
      cantrips = trimElements(m.cantrips, ",");
    } else if (spellMatch) {
      const m = spellMatch.groups;
      spellList.push({
        level: m.level,
        slots: m.slots,
        spells: trimElements(m.spells, ","),
      });
    }
  }

  return { cantrips, spellList };
}

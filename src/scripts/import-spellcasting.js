import { logConsole } from "./log";
import { trimElements } from "./common";

const CANTRIP_RGX = /\bcantrips\b.+\:\s?(?<cantrips>.+)/i;
const SPELLS_BY_LEVEL_RGX =
  /(?<level>\d+)\w+\s\blevel\b.+(?<slots>\d+)\s?\bslot.?\b\)\:\s?(?<spells>.+)/i;
const SPELLCASTING_AT_WILL_RGX = /\bat will\b\:\s?(?<atWill>.+)/i;
const INNATE_CASTING_PER_DAY_RGX =
  /(?<timesADay>\d+)\/\bday\b\s?.+\:\s?(?<spells>.+)/i;

// todo
// Some spell casting description hide spells in the description, like the Mehpits creature.
// Quote: "The mephit can innately cast fog cloud, requiring no material components."
// => search description for spells

export function gatherSpellcasting(actorDataWithoutActions) {
  const idx = getSpellcastingIdx(actorDataWithoutActions);
  const spellcasting = gatherSpellcastingProps(actorDataWithoutActions, idx);
  logConsole("spellcasting", spellcasting);
  return spellcasting;
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

function gatherSpellcastingProps(lines, startIdx) {
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
    spellcasting.spells = gatherInnateSpells(castingLines);
  } else if (spellcasting.basics.casting) {
    spellcasting.spells = gatherSpells(castingLines);
  }

  return spellcasting;
}

function gatherInnateSpells(castingLines) {
  const spellList = [];
  let atWill;

  for (const line of castingLines) {
    const atWillMatch = SPELLCASTING_AT_WILL_RGX.exec(line);
    const innateMatch = INNATE_CASTING_PER_DAY_RGX.exec(line);
    if (atWillMatch) {
      const m = atWillMatch.groups;
      atWill = trimElements(m.atWill, ",");
    } else if (innateMatch) {
      const m = innateMatch.groups;
      spellList.push({
        timesPerDay: m.timesADay,
        spells: trimElements(m.spells, ","),
      });
    }
  }

  return { atWill, spellList };
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

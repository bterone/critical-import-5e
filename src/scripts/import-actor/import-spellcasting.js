import { Logger } from "../log";
import { trimElements } from "../common";

const logger = new Logger("import-spellcasting.js");
logger.disable();

const CANTRIP_RGX = /\bcantrips\b.+\:\s?(?<cantrips>.+)/i;
const SPELLS_BY_LEVEL_RGX =
  /(?<level>\d+)\w+\s\blevel\b.+(?<slots>\d+)\s?\bslot.?\b\)\:\s?(?<spells>.+)/i;
const SPELLCASTING_AT_WILL_RGX = /\bat will\b\:\s?(?<atWill>.+)/i;
const INNATE_CASTING_PER_DAY_RGX =
  /(?<timesADay>\d+)\/\bday\b\s?.+\:\s?(?<spells>.+)/i;

export function gatherSpellcasting(actorDataWithoutActions) {
  const idx = getSpellcastingIdx(actorDataWithoutActions);
  const spellcasting = gatherSpellcastingProps(actorDataWithoutActions, idx);
  logger.logConsole("spellcasting", spellcasting);
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
  const hiddenSpellcastingRgx =
    /\binnate spellcasting\b\s?\((?<usesPerDay>\d+).\bday\b.+\binnately cast\b.(?<spells>.+)\,.+\bability is\b\s?(?<ability>[a-z]+)/gi;

  const spellcasting = {};
  const spellCastingText = lines.splice(startIdx, 1)[0];
  spellcasting.desc = spellCastingText;
  const castingBasics = spellcastingBasicsRgx.exec(spellCastingText);
  if (spellCastingText && !castingBasics) {
    // has hidden spells
    const hidden = hiddenSpellcastingRgx.exec(spellCastingText);
    const hiddenSpellcasting = hidden.groups;
    spellcasting.spells = {
      atWill: trimElements(hiddenSpellcasting.spells, ","),
    };
    spellcasting.basics = {
      ability: hiddenSpellcasting.ability,
      innate: "innate",
      // dc: undefined,
      // hitBonus: undefined
    };
    return spellcasting;
  }
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

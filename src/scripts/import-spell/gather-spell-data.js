import { Logger } from "../log.js";

const logger = new Logger("gather-spell-data.js");
// logger.disable();

const materialComponentRgx = /-.?-.?\((?<material>.*)?\)/i;
const atHigherLevelsRgx = /\bat higher levels\b.?\s?(?<higherLevelsDesc>.*)/i;
const atHigherLevelsDamageRgx = /(?<dmgRoll>\dd\d)/i;
const targetRgx = /(?<target>\bwilling creature\b|\ba target\b)/i;
const shapeRgx = /(?<shape>[0-9]+\b-foot\b(\s|-)?[a-z]+)/i;

/**
 * Spell params:
 *
 * level
 * castingTime
 * range/area
 * components
 * componentDesc
 * duration
 * concentration
 * school
 * attack/save
 * damage/effect
 * desc
 * atHigherLevels
 * dmg?
 * hit?
 * special effects like mage armor's AC buff?
 *
 */

export function gatherSpellData(importedSpellData) {
  const damageRgx = /(?<dmgRoll>\dd\d)\s?(?<dmgType>[a-z]*)/gi;
  const allDamageRgx =
    /(?<versatile>(\dd\d)\s?([a-z]*)\s\bdamage\b[a-zA-Z\s]+(\bstart\b|\bend\b)[a-zA-Z\s]+\bturn\b)|(?<dmgRoll>\dd\d)\s?(?<dmgType>[a-z]*)/gi;

  // todo
  // gather WotC style (Grimhollow PDF's for example)

  // importedSpellData from D&D Beyond

  logger.logConsole("importedSpellData", importedSpellData);
  const validHeaders = {
    level: "level",
    castingTime: "casting time",
    rangeArea: "range/area",
    components: "components",
    duration: "duration",
    school: "school",
    attackSave: "attack/save",
    damageEffect: "damage/effect",
  };

  const inputPortions = importedSpellData.trim().split(/\n/g);

  const rawSpellDto = {
    name: inputPortions.splice(0, 1)[0],
    rawHeaderData: { other: [] },
  };

  let currentHeader = undefined;
  for (const portion of inputPortions) {
    const value = portion.toLocaleLowerCase();
    if (!value) {
      continue;
    }

    const containsHeader = Object.values(validHeaders).indexOf(value) > -1;
    if (containsHeader) {
      // is header
      currentHeader = value;
      logger.logConsole("set currentHeader", currentHeader);
    } else if (currentHeader !== undefined) {
      // is value
      // rawSpellDto.rawHeaderData[currentHeader] = portion;

      switch (currentHeader) {
        case validHeaders.level:
          rawSpellDto.level = parseInt(portion);
          break;

        case validHeaders.castingTime:
          const casting = portion.split(" ");
          rawSpellDto.castingTime = {
            value: parseInt(casting[0]),
            type: casting[1],
          };
          break;

        case validHeaders.rangeArea:
          const rangeRgx = /((?<type>[a-zA-Z]+)?\s\()?((?<range>\d+)\s\bft\b)/i;
          const match = rangeRgx.exec(portion);
          if (!match.groups) {
            logger.logWarn(`couldn't parse range/area ${portion}`);
            continue;
          }
          const mGroups = match.groups;
          rawSpellDto.range = {
            type: mGroups.type ? mGroups.type.toLocaleLowerCase() : "ft",
            normal: parseInt(mGroups.range),
            max: 0,
          };
          break;
        case validHeaders.components:
        // todo
        case validHeaders.duration:
        // todo
        case validHeaders.school:
        // todo
        case validHeaders.attackSave:
        // todo
        case validHeaders.damageEffect:
        // todo
        default:
          logger.logWarn(`unknown RawHeader ${currentHeader}`);
          break;
      }

      currentHeader = undefined;
    } else {
      // is value without known header
      rawSpellDto.rawHeaderData.other.push(portion);
    }
  }

  // convert list of unknown data
  for (let i = 0; i < rawSpellDto.rawHeaderData.other?.length; i++) {
    const line = rawSpellDto.rawHeaderData.other[i];

    // material components
    const material = materialComponentRgx.exec(line);
    if (material) {
      rawSpellDto.materialComponents = material.groups.material;
    }

    // at higher levels
    const atHigherLevels = atHigherLevelsRgx.exec(line);
    if (atHigherLevels) {
      const desc = atHigherLevels.groups.higherLevelsDesc;
      rawSpellDto.atHigherLevels = desc;

      const match = atHigherLevelsDamageRgx.exec(desc);
      const m = match.groups;
      if (m) {
        rawSpellDto.damageAtHigherLevels = m.dmgRoll;
      }
    }

    // spell description
    const isDesc = !material && !atHigherLevels;
    if (isDesc) {
      const descLine = rawSpellDto.desc
        ? rawSpellDto.desc + `\n\n${line}`
        : line;
      rawSpellDto.desc = descLine;
    }
  }
  const desc = rawSpellDto.desc;

  // target
  const target = targetRgx.exec(desc);
  const targetMatch = target?.groups;
  if (targetMatch) {
    rawSpellDto.target = targetMatch.target;
  }

  // shape
  const shape = shapeRgx.exec(desc);
  const shapeMatch = shape?.groups;
  if (shapeMatch) {
    rawSpellDto.shape = shapeMatch.shape;
  }

  // damage
  const dmg = [];
  const versatileDmg = [];
  let match;
  while ((match = allDamageRgx.exec(desc)) != null) {
    const m = match?.groups;
    if (m.dmgRoll || m.dmgType) {
      dmg.push([m.dmgRoll, m.dmgType]);
    } else if (m.versatile) {
      let vMatch;
      while ((vMatch = damageRgx.exec(m.versatile)) != null) {
        const vm = vMatch?.groups;
        if (vm) {
          versatileDmg.push([vm.dmgRoll, vm.dmgType]);
        }
      }
    }
  }

  if (dmg.length > 0) {
    rawSpellDto.damage = dmg;
  }
  if (versatileDmg.length > 0) {
    rawSpellDto.versatileDmg = versatileDmg;
  }

  logger.logConsole("rawSpellDto", rawSpellDto);
  return rawSpellDto;
}

// todo
function shortenDuration(duration) {
  switch (duration.trim().toLocaleLowerCase()) {
    case "instantaneous":
      return "inst";
    default:
      return duration;
  }
}

// todo
function shortenSchool(school) {
  switch (school.trim().toLocaleLowerCase()) {
    case "abjuration":
      return "";
    case "transmutation":
      return "";
    case "conjuration":
      return "";
    case "divination":
      return "";
    case "enchantment":
      return "";
    case "evocation":
      return "evo";
    case "illusion":
      return "";
    case "necromancy":
      return "";
    default:
      return school;
  }
}

// todo
function shortenAttackOrSave(attackOrSave) {
  switch (attackOrSave.trim().toLocaleLowerCase()) {
    case "ranged":
      return "rsak";
    default:
      return attackOrSave;
  }
}

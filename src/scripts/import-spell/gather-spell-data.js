import { Logger } from "../log.js";

const logger = new Logger("gather-spell-data.js");
// logger.disable();

const materialComponentRgx = /-.?-.?\((?<material>.*)?\)/i;

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
  // todo
  // gather D&D Beyond
  // gather WotC style (Grimhollow PDF's for example)

  logger.logConsole("importedSpellData", importedSpellData);
  const validHeaders = [
    "level",
    "casting time",
    "range/area",
    "components",
    "duration",
    "school",
    "attack/save",
    "damage/effect",
  ];

  const inputPortions = importedSpellData.trim().split(/\n/g);

  const rawSpellDto = { name: inputPortions.splice(0, 1)[0], other: [] };

  let currentHeader = undefined;
  for (const portion of inputPortions) {
    const value = portion.toLocaleLowerCase();
    if (!value) {
      continue;
    }

    if (validHeaders.includes(value)) {
      // is header
      currentHeader = value;
      logger.logConsole("set currentHeader", currentHeader);
    } else if (currentHeader !== undefined) {
      // is value
      rawSpellDto[currentHeader] = portion;
      currentHeader = undefined;
    } else {
      // is value without known header
      rawSpellDto.other.push(portion);
    }
  }

  // material components
  if (rawSpellDto.components?.toLocaleLowerCase().includes("m")) {
    let material;
    for (let i = 0; i < rawSpellDto.other?.length; i++) {
      const component = rawSpellDto.other[i];
      material = materialComponentRgx.exec(component);
      if (material) {
        rawSpellDto.materialComponents = material.groups.material;
        // remove line from rawSpellDto.other
        rawSpellDto.other.splice(i, 1);
        break;
      }
    }
  }

  logger.logConsole("rawSpellDto", rawSpellDto);
  return rawSpellDto;
}

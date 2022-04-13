import { Logger } from "../log.js";

const logger = new Logger("gather-spell-data.js");
// logger.disable();

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

  logger.logConsole("rawSpellDto", rawSpellDto);
}

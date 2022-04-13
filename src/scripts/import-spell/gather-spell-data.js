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
  logger.logConsole("importedSpellData", importedSpellData);
}

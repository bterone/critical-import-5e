import { Logger } from "../log.js";
import { gatherSpellData } from "./gather-spell-data.js";
import { createSpell } from "./create-spell.js";

const logger = new Logger("import-spell.js");
// logger.disable();

export async function importSpell(importedSpellData) {
  if (!importedSpellData) {
    return;
  }
  const spellData = gatherSpellData(importedSpellData);
  logger.logConsole("spellData", spellData);
  await createSpell(spellData);
}

import { Logger } from "../log.js";
import { setProperty } from "./../common.js";

const logger = new Logger("create-spell.js");
// logger.disable();

export async function createSpell(spellData) {
  const item = await Item.create({
    name: spellData.name || "New Spell",
    type: "spell",
  });

  let itemUpdate = {};

  // source
  setProperty(itemUpdate, "data.source", "Critical Import 5e");

  // preparation
  setProperty(itemUpdate, "data.preparation.mode", "prepared");
  setProperty(itemUpdate, "data.preparation.prepared", true);

  // level
  if (spellData.level) {
    setProperty(itemUpdate, "data.level", parseInt(spellData.level));
  }

  // casting time
  if (spellData.castingtime) {
    setProperty(itemUpdate, "data.activation.type", "action"); // todo
    setProperty(itemUpdate, "data.activation.cost", 1);
    // setProperty(itemUpdate, "data.activation.condition", ""); // todo
  }

  // range/area
  if (spellData.rangearea) {
    setProperty(itemUpdate, "data.range.value", parseInt(spellData.rangearea));
    setProperty(itemUpdate, "data.range.units", "ft");
  }

  // target
  if (spellData.target) {
    setTarget(itemUpdate);
  }

  // components
  if (spellData.components) {
    //   "components": {
    //     "value": "",
    //     "vocal": false,
    //     "somatic": false,
    //     "material": false,
    //     "ritual": false,
    //     "concentration": false
    //   },
    const components = spellData.components;
    setProperty(itemUpdate, "data.components.vocal", components.includes("V"));
    setProperty(
      itemUpdate,
      "data.components.somatic",
      components.includes("S")
    );
    setProperty(
      itemUpdate,
      "data.components.material",
      components.includes("M")
    );
    // todo
    // ritual
    // concentration
  }

  // duration
  if (spellData.duration) {
    // setProperty(itemUpdate, "data.duration.value", "");
    setProperty(
      itemUpdate,
      "data.duration.units",
      shortenDuration(spellData.duration)
    );
  }

  // school
  if (spellData.school) {
    setProperty(itemUpdate, "data.school", shortenSchool(spellData.school));
  }

  // attack/save
  if (spellData.attacksave) {
    setProperty(
      itemUpdate,
      "data.actionType",
      shortenAttackOrSave(spellData.attacksave)
    );
  }

  // damage/effect
  if (spellData.damageeffect) {
    setProperty(itemUpdate, "data.damage.parts", spellData.damage);
  }

  // material components
  if (spellData.materialComponents) {
    //   "materials": {
    //     "value": "",
    //     "consumed": false,
    //     "cost": 0,
    //     "supply": 0
    //   },
    setProperty(
      itemUpdate,
      "data.materials.value",
      spellData.materialComponents
    );
    // todo
    // material consumed?
  }

  // at higher levels
  let atHigherLevelsDesc = "";
  if (spellData.atHigherLevels) {
    atHigherLevelsDesc = `<br><br><strong>At higher levels.</strong> ${spellData.atHigherLevels}`;
    setProperty(
      itemUpdate,
      "data.scaling.formula",
      spellData.damageAtHigherLevels
    );
    setProperty(itemUpdate, "data.scaling.mode", "level");
  }

  // spell description
  if (spellData.desc) {
    const desc = `<p>${spellData.desc}${atHigherLevelsDesc}</p>`;
    setProperty(itemUpdate, "data.description.value", desc);
  }

  await item.update(itemUpdate);

  logger.logConsole("item", item);
}

// todo set shape
function setTarget(itemUpdate) {
  // a creature
  // x creatures
  // self
  // shape is a type of target
  setProperty(itemUpdate, "data.target.type", "creature"); // cone
  setProperty(itemUpdate, "data.target.units", undefined); // ft
  setProperty(itemUpdate, "data.target.value", 1); // 15
  setProperty(itemUpdate, "data.target.width", undefined);
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

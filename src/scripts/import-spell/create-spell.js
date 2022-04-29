import { Logger } from "../log.js";
import {
  retrieveFromPackMany,
  retrieveFromPackItemImg,
  shortenAbility,
  setProperty,
} from "./../common.js";

const logger = new Logger("create-spell.js");
// logger.disable();

/**
 * create spell using FoundryVTT API:
 */

//  "Item": {
//   "types": ["weapon", "equipment", "consumable", "tool", "loot", "class", "spell", "feat", "backpack"],
//   "templates": {
//     "itemDescription": {
//       "description": {
//         "value": "",
//         "chat": "",
//         "unidentified": ""
//       },
//       "source": ""
//     },
//     "physicalItem": {
//       "quantity": 1,
//       "weight": 0,
//       "price": 0,
//       "attunement": 0,
//       "equipped": false,
//       "rarity": "",
//       "identified": true
//     },
//     "activatedEffect": {
//       "activation": {
//         "type": "",
//         "cost": 0,
//         "condition": ""
//       },
//       "duration": {
//         "value": null,
//         "units": ""
//       },
//       "target": {
//         "value": null,
//         "width": null,
//         "units": "",
//         "type": ""
//       },
//       "range": {
//         "value": null,
//         "long": null,
//         "units": ""
//       },
//       "uses": {
//         "value": null,
//         "max": "",
//         "per": null
//       },
//       "consume": {
//         "type": "",
//         "target": null,
//         "amount": null
//       }
//     }

//  "spell": {
//   "templates": ["itemDescription", "activatedEffect", "action"],
//   "level": 1,
//   "school": "",
//   "components": {
//     "value": "",
//     "vocal": false,
//     "somatic": false,
//     "material": false,
//     "ritual": false,
//     "concentration": false
//   },
//   "materials": {
//     "value": "",
//     "consumed": false,
//     "cost": 0,
//     "supply": 0
//   },
//   "preparation": {
//     "mode": "prepared",
//     "prepared": false
//   },
//   "scaling": {
//     "mode": "none",
//     "formula": null
//   }
// }

export async function createSpell(spellData) {
  const item = await Item.create({
    name: spellData.name || "New Spell",
    type: "spell",
  });

  // todo
  // actionType = rsak ?

  let itemUpdate = {};

  // source
  setProperty(itemUpdate, "data.source", "Critical Import 5e");

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
    //
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
    // actionType = rsak ?
  }

  // damage/effect
  if (spellData.damageeffect) {
    // todo gather dice
    // const damageType = spellData.damageeffect; // todo gather damage type
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
  if (spellData.atHigherLevels) {
    //
  }

  // spell description
  if (spellData.desc) {
    setProperty(
      itemUpdate,
      "data.description.value",
      `<p>${spellData.desc}</p>`
    );
  }

  // todo
  // school
  // preparation ?
  // scaling ?

  await item.update(itemUpdate);

  logger.logConsole("item", item);
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

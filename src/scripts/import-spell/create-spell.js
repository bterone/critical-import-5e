import { Logger } from "../log.js";
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
  // todo
}

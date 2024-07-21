import { Logger } from "../log.js";
import { retrieveFromPackImg, setProperty } from "./../common.js";

const logger = new Logger("create-spell.js");
// logger.disable();

export async function createSpell(spellData) {
  const item = await Item.create({
    name: spellData.name || "New Spell",
    type: "spell",
    img: await retrieveFromPackImg(spellData.name),
  });

  let itemUpdate = {};

  // source
  setProperty(itemUpdate, "system.source", "Critical Import 5e v2");

  // preparation
  setProperty(itemUpdate, "system.preparation.mode", "prepared");
  setProperty(itemUpdate, "system.preparation.prepared", false);

  // level
  if (spellData.level) {
    setProperty(itemUpdate, "system.level", spellData.level);
  }

  // casting time
  if (spellData.castingTime) {
    setProperty(itemUpdate, "system.activation.type", spellData.castingTime.type);
    setProperty(
      itemUpdate,
      "system.activation.cost",
      spellData.castingTime.value
    );
    // setProperty(itemUpdate, "system.activation.condition", ""); // todo
  }

  // range
  if (spellData.range) {
    switch (spellData.range.type) {
      case "self":
      case "touch":
        logger.logWarn("ignoring range");
        break;
      default:
        setProperty(
          itemUpdate,
          "system.range.value",
          parseInt(spellData.range.normal)
        );
        setProperty(itemUpdate, "system.range.long", 0); // for spells this is always 0
        break;
    }
    setProperty(itemUpdate, "system.range.units", spellData.range.type);
  }

  // target
  if (spellData.target) {
    const target = spellData.target;
    setProperty(itemUpdate, "system.target.type", target.type);
    setProperty(itemUpdate, "system.target.value", target.value);
  }

  // shape
  if (spellData.shape) {
    const shape = spellData.shape;
    setProperty(itemUpdate, "system.target.type", shape.type);
    setProperty(itemUpdate, "system.target.units", "ft");
    setProperty(
      itemUpdate,
      "system.target.value",
      shape.length ? shape.length : shape.value
    );
    setProperty(itemUpdate, "system.target.width", shape.width);
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
    setProperty(itemUpdate, "system.components.vocal", components.includes("V"));
    setProperty(
      itemUpdate,
      "system.components.somatic",
      components.includes("S")
    );
    setProperty(
      itemUpdate,
      "system.components.material",
      components.includes("M")
    );
    setProperty(
      itemUpdate,
      "system.components.concentration",
      spellData.concentration
    );
    // todo
    // ritual
  }

  // duration
  if (spellData.duration) {
    setProperty(itemUpdate, "system.duration.value", spellData.duration.value);
    setProperty(itemUpdate, "system.duration.units", spellData.duration.type);
  }

  // school
  if (spellData.school) {
    setProperty(itemUpdate, "system.school", spellData.school);
  }

  // actionType
  if (spellData.actionType) {
    setProperty(itemUpdate, "system.actionType", spellData.actionType);
  }

  // save
  if (spellData.save) {
    setProperty(itemUpdate, "system.save.ability", spellData.save.ability);
    setProperty(itemUpdate, "system.save.dc", spellData.save.dc);
    setProperty(itemUpdate, "system.save.scaling", spellData.save.scaling);
  }

  // todo attack ?

  // damage/effect
  if (spellData.damage) {
    setProperty(itemUpdate, "system.damage.parts", spellData.damage);
  }

  // versatile damage
  if (spellData.versatileDmg) {
    const vDmg = spellData.versatileDmg
      .map((element) => element[0])
      .reduce((prev, curr) => prev + " + " + curr);
    setProperty(itemUpdate, "system.damage.versatile", vDmg);
  }

  // material components
  if (spellData.materialComponents) {
    // todo
    //   "materials": {
    //     "value": "",
    //     "consumed": false,
    //     "cost": 0,
    //     "supply": 0
    //   },
    setProperty(
      itemUpdate,
      "system.materials.value",
      spellData.materialComponents
    );
  }

  // at higher levels
  let atHigherLevelsDesc = "";
  if (spellData.atHigherLevels) {
    atHigherLevelsDesc = `<br><br><strong>At higher levels.</strong> ${spellData.atHigherLevels}`;
    setProperty(
      itemUpdate,
      "system.scaling.formula",
      spellData.damageAtHigherLevels
    );
    setProperty(itemUpdate, "system.scaling.mode", "level");
  }

  // cantrip scaling ("at higher levels" for cantrips)
  let cantripScalingDesc = "";
  if (spellData.cantripScaling) {
    cantripScalingDesc = `<br><br><strong>Scaling;</strong> ${spellData.cantripScaling.desc}`;
    setProperty(
      itemUpdate,
      "system.scaling.formula",
      spellData.cantripScaling.dmg
    );
    setProperty(itemUpdate, "system.scaling.mode", "cantrip");
  }

  // spell description
  if (spellData.desc) {
    const desc = `<p>${spellData.desc}${atHigherLevelsDesc}${cantripScalingDesc}</p>`;
    setProperty(itemUpdate, "system.description.value", desc);
  }

  await item.update(itemUpdate);

  logger.logConsole("item", item);
}

// todo
function setTarget(itemUpdate, target) {
  // "15-foot cone" or "any creature", "willing creature", ...

  // todo
  // cut string
  // set values

  function setTargetType(itemUpdate, target) {
    // todo
    setProperty(itemUpdate, "system.target.type", "creature"); // cone, cube, enemy, ...
  }
  setTargetType(itemUpdate, target);

  function setTargetUnits(itemUpdate, target) {
    // todo
    setProperty(itemUpdate, "system.target.units", undefined); // ft, self, any, ...
  }
  setTargetUnits(itemUpdate, target);

  setProperty(itemUpdate, "system.target.value", 1); // 15
  setProperty(itemUpdate, "system.target.width", undefined);
}

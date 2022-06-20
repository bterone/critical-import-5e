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
  setProperty(itemUpdate, "data.source", "Critical Import 5e");

  // preparation
  setProperty(itemUpdate, "data.preparation.mode", "prepared");
  setProperty(itemUpdate, "data.preparation.prepared", true);

  // level
  if (spellData.level) {
    setProperty(itemUpdate, "data.level", parseInt(spellData.level));
  }

  // casting time
  if (spellData.castingTime) {
    setProperty(itemUpdate, "data.activation.type", spellData.castingTime.type);
    setProperty(
      itemUpdate,
      "data.activation.cost",
      spellData.castingTime.value
    );
    // setProperty(itemUpdate, "data.activation.condition", ""); // todo
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
          "data.range.value",
          parseInt(spellData.range.normal)
        );
        setProperty(itemUpdate, "data.range.long", 0); // for spells this is always 0
        break;
    }
    setProperty(itemUpdate, "data.range.units", spellData.range.type);
  }

  // target
  if (spellData.target) {
    const target = spellData.target;
    setProperty(itemUpdate, "data.target.type", target.type);
    setProperty(itemUpdate, "data.target.value", target.value);
  }

  // shape
  if (spellData.shape) {
    const shape = spellData.shape;
    setProperty(itemUpdate, "data.target.type", shape.type);
    setProperty(itemUpdate, "data.target.units", "ft");
    setProperty(
      itemUpdate,
      "data.target.value",
      shape.length ? shape.length : shape.value
    );
    setProperty(itemUpdate, "data.target.width", shape.width);
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
    setProperty(
      itemUpdate,
      "data.components.concentration",
      spellData.concentration
    );
    // todo
    // ritual
  }

  // duration
  if (spellData.duration) {
    setProperty(itemUpdate, "data.duration.value", spellData.duration.value);
    setProperty(itemUpdate, "data.duration.units", spellData.duration.type);
  }

  // school
  if (spellData.school) {
    setProperty(itemUpdate, "data.school", spellData.school);
  }

  // actionType
  if (spellData.actionType) {
    setProperty(itemUpdate, "data.actionType", spellData.actionType);
  }

  // save
  if (spellData.save) {
    setProperty(itemUpdate, "data.save.ability", spellData.save.ability);
    setProperty(itemUpdate, "data.save.dc", spellData.save.dc);
    setProperty(itemUpdate, "data.save.scaling", spellData.save.scaling);
  }

  // todo attack ?

  // damage/effect
  if (spellData.damage) {
    setProperty(itemUpdate, "data.damage.parts", spellData.damage);
  }

  // versatile damage
  if (spellData.versatileDmg) {
    const vDmg = spellData.versatileDmg
      .map((element) => element[0])
      .reduce((prev, curr) => prev + " + " + curr);
    setProperty(itemUpdate, "data.damage.versatile", vDmg);
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
      "data.materials.value",
      spellData.materialComponents
    );
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

// todo
function setTarget(itemUpdate, target) {
  // "15-foot cone" or "any creature", "willing creature", ...

  // todo
  // cut string
  // set values

  function setTargetType(itemUpdate, target) {
    // todo
    setProperty(itemUpdate, "data.target.type", "creature"); // cone, cube, enemy, ...
  }
  setTargetType(itemUpdate, target);

  function setTargetUnits(itemUpdate, target) {
    // todo
    setProperty(itemUpdate, "data.target.units", undefined); // ft, self, any, ...
  }
  setTargetUnits(itemUpdate, target);

  setProperty(itemUpdate, "data.target.value", 1); // 15
  setProperty(itemUpdate, "data.target.width", undefined);
}

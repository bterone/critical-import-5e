import { Logger } from "../log.js";
import {
  retrieveFromPackMany,
  retrieveFromPackImg,
  shortenAbility,
  setProperty,
} from "./../common.js";

const logger = new Logger("create-actor.js");
logger.disable();

// todo - refactor =>
// create-script should only create not mutate!
// mutation should be done inside gather script!

export async function createActor(actorData) {
  const actor = await Actor.create({
    name: actorData.race?.name || "New Actor",
    type: "npc",
  });

  let updateData = {};

  // source
  setProperty(updateData, "system.details.source", "Critical Import 5e v2");

  // attributes & initiative
  if (actorData.attributes) {
    updateData = setAttributes(updateData, actorData);
  }

  // saves
  if (actorData.saves) {
    updateData = setSaves(updateData, actorData);
  }

  // speed / movement
  if (actorData.speed) {
    updateData = setSpeed(updateData, actorData);
  }

  // health
  if (actorData.health) {
    updateData = setHealth(updateData, actorData);
  }

  // challenge
  if (actorData.challenge) {
    updateData = setChallenge(updateData, actorData);
  }

  // armor
  if (actorData.armor) {
    updateData = setArmor(updateData, actorData);
  }

  // racial data
  if (actorData.race) {
    updateData = setRace(updateData, actorData);
  }

  // damage resistances
  if (actorData.dmgResistances) {
    updateData = setResistances(updateData, actorData);
  }

  // damage immunities
  if (actorData.dmgImmunities) {
    updateData = setDmgImmunities(updateData, actorData);
  }

  // damage vulnerability
  if (actorData.dmgVulnerabilities) {
    updateData = setDmgVulnerabilities(updateData, actorData);
  }

  // conditional immunities
  if (actorData.conditionImmunities) {
    updateData = setConditionImmunities(updateData, actorData);
  }

  // languages
  if (actorData.languages) {
    updateData = setLanguages(updateData, actorData);
  }

  // proficiency bonus
  if (actorData.proficiencyBonus) {
    setProperty(
      updateData,
      "system.data.attributes.prof",
      parseInt(actorData.proficiencyBonus.profBonus)
    );
  }

  await actor.update(updateData);

  // skills
  if (actorData.skills) {
    // has to be done after basic information has been set
    const skills = createSkills(actorData.skills, actor);
    const skillsUpdate = {
      "system.skills.acr.value": skills.acr,
      "system.skills.ani.value": skills.ani,
      "system.skills.arc.value": skills.arc,
      "system.skills.ath.value": skills.ath,
      "system.skills.dec.value": skills.dec,
      "system.skills.his.value": skills.his,
      "system.skills.ins.value": skills.ins,
      "system.skills.itm.value": skills.itm,
      "system.skills.inv.value": skills.inv,
      "system.skills.med.value": skills.med,
      "system.skills.nat.value": skills.nat,
      "system.skills.prf.value": skills.prf,
      "system.skills.prc.value": skills.prc,
      "system.skills.per.value": skills.per,
      "system.skills.rel.value": skills.rel,
      "system.skills.slt.value": skills.slt,
      "system.skills.ste.value": skills.ste,
      "system.skills.sur.value": skills.sur,
    };
    await actor.update(skillsUpdate);
  }

  // senses
  if (actorData.senses) {
    await updateSenses(actor, actorData.senses);
  }

  // spells
  if (actorData.spellcasting) {
    setProperty(
      updateData,
      "system.attributes.spellcasting",
      actorData.spellcasting.basics
        ? shortenAbility(actorData.spellcasting.basics?.ability)
        : ""
    );
    await updateSpells(actor, actorData.spellcasting);
  }

  // feats
  if (actorData.features) {
    await updateFeats(actor, actorData.features);
  }

  // actions
  if (actorData.actions) {
    await updateActions(actor, actorData, actorData.actions, "action");
  }

  // bonus actions => monsters usualy dont get bonus actions BUT NPCs do!
  if (actorData.bonusActions) {
    await updateActions(actor, actorData, actorData.bonusActions, "bonus");
  }

  // reactions => monsters usualy dont get reactions (except the attack of opportunity) BUT NPCs do!
  if (actorData.reactions) {
    await updateActions(actor, actorData, actorData.reactions, "reaction");
  }

  // legendary resistances
  if (actorData.legendaryResistances) {
    await updateLegendaryResistances(actor, actorData.legendaryResistances);
  }

  // legendary actions
  if (actorData.legendaryActions) {
    const legAction = actorData.legendaryActions;
    await updateLegendaryActions(actor, legAction);
  }

  // todo
  // // "Lair-Actions"-feat
  // otherFeats.push({
  //   name: "Lair Actions",
  //   desc: undefined,
  // });

  // // "Regial-Effects"-feat
  // otherFeats.push({
  //   name: "Regial Effects",
  //   desc: undefined,
  // });

  logger.logConsole("actor", actor);
}

function setAttributes(updateData, actorData) {
  // CHA
  if (actorData.attributes.cha) {
    setProperty(
      updateData,
      "system.abilities.cha.value",
      actorData.attributes.cha.base
    );
    setProperty(
      updateData,
      "system.abilities.cha.mod",
      actorData.attributes.cha.mod
    );
  }

  // CON
  if (actorData.attributes.con) {
    setProperty(
      updateData,
      "system.abilities.con.value",
      actorData.attributes.con.base
    );
    setProperty(
      updateData,
      "system.abilities.con.mod",
      actorData.attributes.con.mod
    );
  }

  // DEX
  if (actorData.attributes.dex) {
    setProperty(
      updateData,
      "system.abilities.dex.value",
      actorData.attributes.dex.base
    );
    setProperty(
      updateData,
      "system.abilities.dex.mod",
      actorData.attributes.dex.mod
    );
    // initiative
    setProperty(
      updateData,
      "system.attributes.init.bonus",
      actorData.attributes.dex.mod
    );
  }

  // INT
  if (actorData.attributes.int) {
    setProperty(
      updateData,
      "system.abilities.int.value",
      actorData.attributes.int.base
    );
    setProperty(
      updateData,
      "system.abilities.int.mod",
      actorData.attributes.int.mod
    );
  }

  // STR
  if (actorData.attributes.str) {
    setProperty(
      updateData,
      "system.abilities.str.value",
      actorData.attributes.str.base
    );
    setProperty(
      updateData,
      "system.abilities.str.mod",
      actorData.attributes.str.mod
    );
  }

  // WIS
  if (actorData.attributes.wis) {
    setProperty(
      updateData,
      "system.abilities.wis.value",
      actorData.attributes.wis.base
    );
    setProperty(
      updateData,
      "system.abilities.wis.mod",
      actorData.attributes.wis.mod
    );
  }

  return updateData;
}

function setSaves(updateData, actorData) {
  // "proficient" represents save value

  // CHA
  setProperty(
    updateData,
    "system.abilities.cha.proficient",
    actorData.saves.cha ? 1 : 0
  );
  // CON
  setProperty(
    updateData,
    "system.abilities.con.proficient",
    actorData.saves.con ? 1 : 0
  );
  // DEX
  setProperty(
    updateData,
    "system.abilities.dex.proficient",
    actorData.saves.dex ? 1 : 0
  );
  // INT
  setProperty(
    updateData,
    "system.abilities.int.proficient",
    actorData.saves.int ? 1 : 0
  );
  // STR
  setProperty(
    updateData,
    "system.abilities.str.proficient",
    actorData.saves.str ? 1 : 0
  );
  // WIS
  setProperty(
    updateData,
    "system.abilities.wis.proficient",
    actorData.saves.wis ? 1 : 0
  );

  return updateData;
}

function setSpeed(updateData, actorData) {
  const speeds = {};
  actorData.speed.forEach((s) => {
    speeds[s.type] = s.value;
  });

  // base speed
  setProperty(
    updateData,
    "system.attributes.speed.value",
    parseInt(speeds.speed)
  );
  setProperty(
    updateData,
    "system.attributes.movement.walk",
    parseInt(speeds.speed)
  );

  // burrow
  setProperty(
    updateData,
    "system.attributes.movement.burrow",
    parseInt(speeds.burrow)
  );

  // climb
  setProperty(
    updateData,
    "system.attributes.movement.climb",
    parseInt(speeds.climb)
  );

  // fly
  setProperty(updateData, "system.attributes.movement.fly", parseInt(speeds.fly));

  // swim
  setProperty(
    updateData,
    "system.attributes.movement.swim",
    parseInt(speeds.swim)
  );

  // hover
  setProperty(
    updateData,
    "system.attributes.movement.hover",
    parseInt(speeds.hover)
  );

  return updateData;
}

function setHealth(updateData, actorData) {
  // HP current
  setProperty(updateData, "system.attributes.hp.value", actorData.health.hp);
  // HP max
  setProperty(updateData, "system.attributes.hp.max", actorData.health.hp);
  // Formular
  setProperty(
    updateData,
    "system.attributes.hp.formula",
    actorData.health.formularBonus
      ? `${actorData.health.formular} + ${actorData.health.formularBonus}`
      : actorData.health.formular
  );

  return updateData;
}

function setChallenge(updateData, actorData) {
  // CR
  setProperty(updateData, "system.details.cr", actorData.challenge.cr);
  // XP
  setProperty(updateData, "system.details.xp.value", actorData.challenge.xp);
  return updateData;
}

function setArmor(updateData, actorData) {
  setProperty(
    updateData,
    "system.attributes.ac.calc",
    formatArmor(actorData.armor)
  );

  setProperty(
    updateData,
    "system.attributes.ac.flat",
    actorData.armor.armorClass?.trim()
  );

  return updateData;
}

function setRace(updateData, actorData) {
  setProperty(
    updateData,
    "system.details.alignment",
    actorData.race.alignment?.trim()
  );
  setProperty(updateData, "system.details.race", actorData.race.race?.trim());
  setProperty(updateData, "system.details.type", actorData.race.type?.trim());
  setProperty(updateData, "system.traits.size", formatSize(actorData.race));

  return updateData;
}

function setResistances(updateData, actorData) {
  setProperty(
    updateData,
    "system.traits.dr.value",
    actorData.dmgResistances.resistances
  );
  setProperty(
    updateData,
    "system.traits.dr.custom",
    actorData.dmgResistances.custom
  );
  return updateData;
}

function setDmgImmunities(updateData, actorData) {
  setProperty(
    updateData,
    "system.traits.di.value",
    actorData.dmgImmunities.immunities
  );
  setProperty(
    updateData,
    "system.traits.di.custom",
    actorData.dmgImmunities.custom
  );
  return updateData;
}

function setDmgVulnerabilities(updateData, actorData) {
  setProperty(
    updateData,
    "system.traits.dv.value",
    actorData.dmgVulnerabilities.vulnerabilities
  );
  setProperty(
    updateData,
    "system.traits.dv.custom",
    actorData.dmgVulnerabilities.custom
  );
  return updateData;
}

function setConditionImmunities(updateData, actorData) {
  setProperty(
    updateData,
    "system.traits.ci.value",
    actorData.conditionImmunities.immunities
  );
  setProperty(
    updateData,
    "system.traits.ci.custom",
    actorData.conditionImmunities.custom
  );
  return updateData;
}

function setLanguages(updateData, actorData) {
  setProperty(
    updateData,
    "system.traits.languages.value",
    actorData.languages.langs
  );
  setProperty(
    updateData,
    "system.traits.languages.custom",
    actorData.languages.custom
  );
  return updateData;
}

async function updateLegendaryResistances(actor, legendaryResistances) {
  // actor
  const perDay = parseInt(legendaryResistances.timesADay);
  await actor.update({
    "system.resources.legres.value": perDay,
    "system.resources.legres.max": perDay,
  });
  //  feat
  const name = "Legendary Resistance";
  const itemUpdate = {
    name,
    type: "feat",
    img: await retrieveFromPackImg(name),
  };
  setProperty(itemUpdate, "system.description.value", legendaryResistances.desc);
  setProperty(itemUpdate, "system.activation.type", "special");
  setProperty(itemUpdate, "system.consume.type", "attribute");
  setProperty(itemUpdate, "system.consume.target", "resources.legres.value");
  setProperty(itemUpdate, "system.consume.amount", 1);

  const doc = new Item(itemUpdate).toObject();
  await actor.createEmbeddedDocuments("Item", [doc]);
}

async function updateSpells(actor, spellcasting) {
  // spells
  const spellPack = "dnd5e.spells";

  if (spellcasting.basics.innate) {
    // at will
    const spellsAtWill = spellcasting.spells?.atWill;
    if (spellsAtWill) {
      const atWillSpellDocs = await retrieveFromPackMany(
        spellPack,
        spellsAtWill
      );
      for (const doc of atWillSpellDocs) {
        doc["system.preparation.mode"] = "atwill";
        doc["system.preparation.prepared"] = true;
        await actor.createEmbeddedDocuments("Item", [doc]);
      }
    }

    // per day
    const spellLists = spellcasting.spells?.spellList;
    if (spellLists) {
      for (const spellList of spellLists) {
        const spellDocs = await retrieveFromPackMany(
          spellPack,
          spellList.spells
        );
        for (const doc of spellDocs) {
          const usesPerDay = spellList.timesPerDay;
          setProperty(doc, "system.uses.value", usesPerDay);
          setProperty(doc, "system.uses.max", usesPerDay);
          setProperty(doc, "system.uses.per", "day");
          setProperty(doc, "system.preparation.mode", "innate");
          setProperty(doc, "system.preparation.prepared", true);
          await actor.createEmbeddedDocuments("Item", [doc]);
        }
      }
    }
  } else if (spellcasting.basics.casting) {
    // cantrips
    const cantrips = spellcasting.spells?.cantrips;
    if (cantrips) {
      const cantripDocs = await retrieveFromPackMany(spellPack, cantrips);
      for (const doc of cantripDocs) {
        await actor.createEmbeddedDocuments("Item", [doc]);
      }
    }
    // spells
    const spellList = spellcasting.spells?.spellList;
    if (spellList) {
      for (const spellLevel of spellList) {
        const level = spellLevel.level;
        const slots = spellLevel.slots;
        const update = {};
        setProperty(update, `data.spells.spell${level}.value`, slots);
        setProperty(update, `data.spells.spell${level}.max`, slots);
        setProperty(update, `data.spells.spell${level}.override`, slots);
        await actor.update(update);

        const spells = spellLevel.spells;
        const spellDocs = await retrieveFromPackMany(spellPack, spells);
        for (const doc of spellDocs) {
          await actor.createEmbeddedDocuments("Item", [doc]);
        }
      }
    }
  }
}

async function updateFeats(actor, features) {
  for (const feat of features) {
    const featData = {
      name: feat.name,
      type: "feat",
      img: await retrieveFromPackImg(feat.name),
      // effects: undefined // effects of embeded-documents are currently not supported by FoundryVTT => maybe create feats as seperate document and link with actor?
    };
    setProperty(featData, "system.description.value", feat.desc);
    logger.logConsole("featData", featData);
    const item = new Item(featData);
    await actor.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}

// actionType can be "action", "reaction", "bonus"
function updateAction(itemUpdate, action, actorData, actionType) {
  // attack
  const isWeaponAttack = action.hit;
  if (isWeaponAttack) {
    itemUpdate.type = "weapon";
    const abilityMod =
      parseInt(actorData.attributes.str.mod) +
        parseInt(actorData.proficiencyBonus.profBonus) ===
      parseInt(action.hit)
        ? "str"
        : "dex";
    setProperty(itemUpdate, "system.ability", abilityMod);
    setProperty(itemUpdate, "system.weaponType", "natural");
    setProperty(itemUpdate, "system.identified", true);
    setProperty(itemUpdate, "system.equipped", true);
    setProperty(itemUpdate, "system.proficient", true);
  }

  // damage
  const parts = [];
  for (const dmg of action.dmg) {
    if (!dmg.formula) {
      continue;
    }

    const f = dmg.formula.trim();
    const idx = f.indexOf(" ");
    let dmgVal;
    if (idx != -1) {
      dmgVal = `${f.substring(0, idx)} + @mod`;
    } else {
      dmgVal = f;
    }
    parts.push([dmgVal, dmg.type]);
  }
  setProperty(itemUpdate, "system.damage.parts", parts);

  // versatile
  const versatile = action.versatile;
  if (versatile) {
    setProperty(itemUpdate, "system.damage.versatile", versatile.dmgroll); // todo use formula + @mod ?
    setProperty(itemUpdate, "system.properties.ver", true);
  }

  // reach
  const reach = action.reach;
  if (reach) {
    setProperty(itemUpdate, "system.reach.value", reach);
    setProperty(itemUpdate, "system.reach.units", "ft");
    setProperty(itemUpdate, "system.actionType", "mwak");

    // melee attack
    if (isWeaponAttack) {
      setProperty(itemUpdate, "system.range.value", `${reach} Feet`);
    }
  }

  // range
  const range = action.range;
  if (range) {
    setProperty(itemUpdate, "system.range.value", range.normal);
    setProperty(itemUpdate, "system.range.long", range.far);
    setProperty(itemUpdate, "system.actionType", "rwak");
    setProperty(itemUpdate, "system.ability", "dex"); // todo always dex?
  }

  // shape
  const shape = action.shape;
  if (shape) {
    setProperty(itemUpdate, "system.target.value", parseInt(shape.range));
    setProperty(itemUpdate, "system.target.type", shape.shape);
    setProperty(itemUpdate, "system.target.units", "ft");
  }

  // saves
  const save = action.savingThrow;
  if (save) {
    setProperty(itemUpdate, "system.actionType", "save");
    setProperty(itemUpdate, "system.save.ability", shortenAbility(save.ability));
    setProperty(itemUpdate, "system.save.dc", save.dc);
    setProperty(itemUpdate, "system.save.scaling", "flat");
  }

  // recharge
  const recharge = action.recharge;
  if (recharge) {
    setProperty(itemUpdate, "system.recharge.value", recharge.from);
    setProperty(itemUpdate, "system.recharge.charged", true);
  }

  // bonus action | reaction
  if (actionType) {
    setProperty(update, "system.activation.cost", 1);
    setProperty(update, "flags.adnd5e.itemInfo.type", actionType);
    setProperty(update, "system.activation.type", actionType);
  }

  return itemUpdate;
}

async function updateActions(actor, actorData, actions, actionType) {
  for (const action of actions) {
    const name = action.name;
    if (!name) {
      return;
    }

    const lowerName = name.toLocaleLowerCase();

    let itemUpdate = {
      name,
      type: "feat",
      img: await retrieveFromPackImg(lowerName),
    };
    setProperty(itemUpdate, "system.description.value", action.desc);
    setProperty(itemUpdate, "system.activation.type", actionType);
    setProperty(itemUpdate, "system.activation.cost", 1);

    if (lowerName !== "multiattack") {
      setProperty(itemUpdate, "system.quantity", 1);

      if (lowerName !== "spellcasting") {
        itemUpdate = updateAction(itemUpdate, action, actorData);
      }
    }

    const doc = new Item(itemUpdate).toObject();
    await actor.createEmbeddedDocuments("Item", [doc]);
  }
}

async function updateLegendaryActions(actor, legendaryActions) {
  const uses = legendaryActions.uses;
  const legendaryResourcesUpdate = {};
  setProperty(legendaryResourcesUpdate, "system.resources.legact.value", uses);
  setProperty(legendaryResourcesUpdate, "system.resources.legact.max", uses);
  await actor.update(legendaryResourcesUpdate);

  for (const legAction of legendaryActions.actions) {
    const itemUpdate = {
      name: legAction.name,
      type: "feat",
      img: await retrieveFromPackImg(legAction.name),
    };
    setProperty(itemUpdate, "flags.adnd5e.itemInfo.type", "legendary");
    setProperty(itemUpdate, "system.activation.type", "legendary");
    setProperty(itemUpdate, "system.activation.cost", legAction.cost);
    setProperty(itemUpdate, "system.consume.type", "attribute");
    setProperty(itemUpdate, "system.consume.target", "resources.legact.value");
    setProperty(itemUpdate, "system.consume.amount", legAction.cost);
    setProperty(itemUpdate, "system.description.value", legAction.desc);
    setProperty(itemUpdate, "system.equipped", true);
    setProperty(itemUpdate, "system.proficient", true);

    const doc = new Item(itemUpdate).toObject();
    await actor.createEmbeddedDocuments("Item", [doc]);
  }

  const name = "Legendary Actions";
  const legendaryActionDesc = {
    name,
    type: "feat",
    img: await retrieveFromPackImg(name),
  };
  setProperty(
    legendaryActionDesc,
    "system.description.value",
    legendaryActions.desc
  );
  const doc = new Item(legendaryActionDesc).toObject();
  await actor.createEmbeddedDocuments("Item", [doc]);
}

async function updateSenses(actor, senses) {
  const updateData = {};
  for (const s of senses) {
    logger.logConsole("s", s);
    setProperty(updateData, `data.attributes.senses.${s.sense}`, s.mod);
  }
  await actor.update(updateData);
}

function formatArmor(armor) {
  if (!armor?.armorType) {
    return "";
  }

  let armorType;
  const type = armor.armorType.trim().toLocaleLowerCase();
  if (type.includes("natural armor")) {
    armorType = "natural";
  } else {
    // todo handle armor items
    armorType = type;
  }
  return armorType;
}

function formatSize(race) {
  let size;
  const sizeData = race?.size?.trim().toLocaleLowerCase();
  switch (sizeData) {
    // case "tiny":
    //   break;
    case "small":
      size = "sm";
      break;
    case "medium":
      size = "med";
      break;
    case "large":
      size = "lg";
      break;
    // case "huge":
    //   break;
    case "gargantuan":
      size = "grg";
      break;
    default:
      size = sizeData;
      break;
  }
  return size;
}

function createSkills(actorSkills, actor) {
  function calcSkillVal(actor, key, val) {
    const attribute = actor.data.data.skills[key].ability;
    const attributeMod = actor.data.data.abilities[attribute].mod;
    const proficiencyBonus = actor.data.data.attributes.prof;
    return (val - attributeMod) / proficiencyBonus;
  }

  const skillMap = {
    acrobatics: "acr",
    "animal handling": "ani",
    arcana: "arc",
    athletics: "ath",
    deception: "dec",
    history: "his",
    insight: "ins",
    intimidation: "itm",
    investigation: "inv",
    medicine: "med",
    nature: "nat",
    performance: "prf",
    perception: "prc",
    persuasion: "per",
    religion: "rel",
    "sleight of hand": "slt",
    stealth: "ste",
    survival: "sur",
  };

  const skills = {};
  for (const skill in actorSkills) {
    const skillProperty = skillMap[skill.trim().toLocaleLowerCase()];
    if (!skillProperty) {
      logger.logWarn("unkown skill", skill);
      continue;
    }
    const skillVal = parseInt(actorSkills[skill]);
    skills[skillProperty] = skillVal;
  }

  logger.logConsole("skills", skills);

  for (const skill in skills) {
    const val = skills[skill];
    skills[skill] = calcSkillVal(actor, skill, val);
  }

  logger.logConsole("skills", skills);
  return skills;
}

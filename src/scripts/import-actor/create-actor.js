import { logConsole, logWarn } from "../log.js";

export async function createActor(actorData) {
  // todo
  // Spells
  const actor = await Actor.create({
    name: actorData.race.name,
    type: "npc",
  });

  const speeds = formatSpeeds(actorData);

  // a single object because multiple "update"-function calls slow the app down
  const updateData = {
    // source
    "data.details.source": "Critical Import 5e",
    // attributes; saves === "proficient"
    "data.abilities.cha.value": actorData.attributes.cha.base,
    "data.abilities.cha.mod": actorData.attributes.cha.mod,
    "data.abilities.cha.proficient": actorData.saves.cha ? 1 : 0,
    "data.abilities.con.value": actorData.attributes.con.base,
    "data.abilities.con.mod": actorData.attributes.con.mod,
    "data.abilities.con.proficient": actorData.saves.con ? 1 : 0,
    "data.abilities.dex.value": actorData.attributes.dex.base,
    "data.abilities.dex.mod": actorData.attributes.dex.mod,
    "data.abilities.dex.proficient": actorData.saves.dex ? 1 : 0,
    "data.abilities.int.value": actorData.attributes.int.base,
    "data.abilities.int.mod": actorData.attributes.int.mod,
    "data.abilities.int.proficient": actorData.saves.int ? 1 : 0,
    "data.abilities.str.value": actorData.attributes.str.base,
    "data.abilities.str.mod": actorData.attributes.str.mod,
    "data.abilities.str.proficient": actorData.saves.str ? 1 : 0,
    "data.abilities.wis.value": actorData.attributes.wis.base,
    "data.abilities.wis.mod": actorData.attributes.wis.mod,
    "data.abilities.wis.proficient": actorData.saves.wis ? 1 : 0,
    // init
    "data.attributes.init.bonus": actorData.attributes?.dex?.mod,
    // speed
    "data.attributes.speed.value": parseInt(speeds.speed),
    "data.attributes.movement.walk": parseInt(speeds.speed),
    "data.attributes.movement.burrow": parseInt(speeds.burrow),
    "data.attributes.movement.climb": parseInt(speeds.climb),
    "data.attributes.movement.fly": parseInt(speeds.fly),
    "data.attributes.movement.swim": parseInt(speeds.swim),
    "data.attributes.movement.hover": parseInt(speeds.hover),
    // health
    "data.attributes.hp.value": actorData.health.hp,
    "data.attributes.hp.max": actorData.health.hp,
    "data.attributes.hp.formula": `${actorData.health.formular} + ${actorData.health.formularBonus}`,
    // challenge
    "data.details.cr": actorData.challenge.cr,
    "data.details.xp.value": actorData.challenge.xp,
    // armor
    "data.attributes.ac.calc": formatArmor(actorData),
    "data.attributes.ac.flat": actorData.armor.armorClass?.trim(),
    // racialData
    "data.details.alignment": actorData.race.alignment?.trim(),
    "data.details.race": actorData.race.race?.trim(),
    "data.details.type": actorData.race.type?.trim(),
    "data.traits.size": formatSize(actorData),
    // proficiency bonus
    "data.data.attributes.prof": parseInt(actorData.proficiencyBonus.profBonus),
    // damage resistances
    "data.traits.dr.value": actorData.dmgResistances?.resistances,
    "data.traits.dr.custom": actorData.dmgResistances?.custom,
    // damage immunities
    "data.traits.di.value": actorData.dmgImmunities?.immunities,
    "data.traits.di.custom": actorData.dmgImmunities?.custom,
    // damage vulnerability
    "data.traits.dv.value": actorData.dmgVulnerabilities?.vulnerabilities,
    "data.traits.dv.custom": actorData.dmgVulnerabilities?.custom,
    // conditional immunities
    "data.traits.ci.value": actorData.conditionImmunities?.immunities,
    "data.traits.ci.custom": actorData.conditionImmunities?.custom,
    // languages
    "data.traits.languages.value": actorData.languages?.langs,
    "data.traits.languages.custom": actorData.languages?.custom,
  };
  await actor.update(updateData);

  // skills
  // has to be done after basic information has been set
  const skills = createSkills(actorData, actor);
  const skillsUpdate = {
    "data.skills.acr.value": skills.acr,
    "data.skills.ani.value": skills.ani,
    "data.skills.arc.value": skills.arc,
    "data.skills.ath.value": skills.ath,
    "data.skills.dec.value": skills.dec,
    "data.skills.his.value": skills.his,
    "data.skills.ins.value": skills.ins,
    "data.skills.itm.value": skills.itm,
    "data.skills.inv.value": skills.inv,
    "data.skills.med.value": skills.med,
    "data.skills.nat.value": skills.nat,
    "data.skills.prf.value": skills.prf,
    "data.skills.prc.value": skills.prc,
    "data.skills.per.value": skills.per,
    "data.skills.rel.value": skills.rel,
    "data.skills.slt.value": skills.slt,
    "data.skills.ste.value": skills.ste,
    "data.skills.sur.value": skills.sur,
  };
  await actor.update(skillsUpdate);

  logConsole("actor", actor);
}

function formatSpeeds(actorData) {
  const speeds = {};
  actorData.speed.forEach((s) => {
    speeds[s.type] = s.value;
  });
  return speeds;
}

function formatArmor(actorData) {
  let armorType;
  const type = actorData.armor.armorType.trim().toLocaleLowerCase();
  if (type.includes("natural armor")) {
    armorType = "natural";
  } else {
    // todo handle armor items
    armorType = type;
  }
  return armorType;
}

function formatSize(actorData) {
  let size;
  const sizeData = actorData.race.size.trim().toLocaleLowerCase();
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

function createSkills(actionData, actor) {
  function calcSkillVal(actor, key, val) {
    const attribute = actor.data.data.skills[key].ability;
    const attributeMod = actor.data.data.abilities[attribute].mod;
    const proficiencyBonus = actor.data.data.attributes.prof;
    return (val - attributeMod) / proficiencyBonus;
  }

  const skills = {};
  for (const s in actionData.skills) {
    const skillVal = actionData.skills[s];
    switch (s.trim().toLocaleLowerCase()) {
      case "acrobatics":
        skills.acr = parseInt(skillVal);
        break;
      case "animal handling":
        skills.ani = parseInt(skillVal);
        break;
      case "arcana":
        skills.arc = parseInt(skillVal);
        break;
      case "athletics":
        skills.ath = parseInt(skillVal);
        break;
      case "deception":
        skills.dec = parseInt(skillVal);
        break;
      case "history":
        skills.his = parseInt(skillVal);
        break;
      case "insight":
        skills.ins = parseInt(skillVal);
        break;
      case "intimidation":
        skills.itm = parseInt(skillVal);
        break;
      case "investigation":
        skills.inv = parseInt(skillVal);
        break;
      case "medicine":
        skills.med = parseInt(skillVal);
        break;
      case "nature":
        skills.nat = parseInt(skillVal);
        break;
      case "performance":
        skills.prf = parseInt(skillVal);
        break;
      case "perception":
        skills.prc = parseInt(skillVal);
        break;
      case "persuasion":
        skills.per = parseInt(skillVal);
        break;
      case "religion":
        skills.rel = parseInt(skillVal);
        break;
      case "sleight of hand":
        skills.slt = parseInt(skillVal);
        break;
      case "stealth":
        skills.ste = parseInt(skillVal);
        break;
      case "survival":
        skills.sur = parseInt(skillVal);
        break;
      default:
        logWarn("unkown skill", s);
        break;
    }
  }
  logConsole("skills", skills);

  for (const skill in skills) {
    const val = skills[skill];
    skills[skill] = calcSkillVal(actor, skill, val);
  }

  logConsole("skills", skills);
  return skills;
}

function createAction(actionData) {
  // todo
  const action = {};
  return action;
}

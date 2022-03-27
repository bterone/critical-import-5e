import { logConsole, logWarn } from "./log.js";
import { gatherActions } from "./import-actions.js";
import { gatherFeatures } from "./import-features.js";

export async function importActor(importedActorData) {
  const actorData = gatherActorData(importedActorData);
  logConsole("actorData", actorData);
  await createActor(actorData);
}

function gatherActorData(importedActorData) {
  const attributesRgx =
    /(?<attribute>[a-zA-z]{3})(\r\n|\r|\n)(?<base>\d+)\s+?\((?<mod>(\+|-)\d+)\)/gi;
  const racialDetailsRgx =
    /(?<name>.+)(\r|\n|\r\n)(?<size>(Tiny|Small|Medium|Large|Huge|Gargantuan))\s(?<type>.+)\s?(?<race>.+)?\s?,\s?(?<alignment>.+)(\r|\n|\r\n)/gi;
  const armorRgx =
    /(armor|armour) class\s?(?<armorClass>\d+)\s?(\((?<armorType>.+)\))?/gi;
  const healthRgx =
    /(hit points|hp)\s?(?<hp>\d+)\s?(\(?(?<formular>\d+d\d+)?(\s?\+\s?(?<formularBonus>\d+))?)?/gi;
  const speedRgx =
    /(?<type>(speed|climb|fly|burrow|swim))\s+?(?<value>\d+\s?[^,|\r|\n|\r\n]+)/gi;
  const savesRgx = /(?<ability>str|dex|con|int|wis|cha) (?<mod>(\+|\-)\d+)/gi;
  const skillsRgx =
    /(?<skill>acrobatics|arcana|animal handling|athletics|deception|history|insight|intimidation|investigation|medicine|nature|perception|performance|persuasion|religion|sleight of hand|stealth|survival) (?<mod>(\+|\-)\d+)/gi;
  const dmgImmunitiesRgx =
    /(damage immunities|damage immunity)\s?(?<immunities>.+)/gi;
  const dmgVulnerbilitiesRgx = / /; // todo
  const dmgResistancesRgx = / /; // todo
  const sensesRgx =
    /(?<sense>darkvision|blindsight|tremorsense|truesight|passive perception)\s?(?<mod>\d+)/gi;
  const languagesRgx = /(languages|language)\s?(?<languages>.*)/gi;
  const challengeRgx = /(challenge|cr)\s?(?<cr>([\d/]+))\s?\((?<xp>[\d,]+)/gi;
  const proficiencyBonusRgx =
    /(proficiency bonus|prof bonus)\s?(?<profBonus>\+\d+)/gi;
  const legendaryResistancesRgx =
    /legendary resistance\s?\(?(?<timesADay>\d+).day.?\.?(?<desc>.+)/gi;

  logConsole("gathering actor data ...");
  const actorData = {};

  const racialDetails = racialDetailsRgx.exec(importedActorData);
  if (racialDetails) {
    actorData.race = racialDetails.groups;
    logConsole("racialDetails", racialDetails.groups);
  }

  const armor = armorRgx.exec(importedActorData);
  if (armor) {
    actorData.armor = armor.groups;
    logConsole("armor", armor.groups);
  }

  const health = healthRgx.exec(importedActorData);
  if (health) {
    actorData.health = health.groups;
    logConsole("health", health.groups);
  }

  function gatherSpeed(actorData) {
    const speed = [];
    let match;
    while ((match = speedRgx.exec(actorData)) != null) {
      const m = match.groups;
      const type = m.type.toLocaleLowerCase();
      const value = m.value.toLocaleLowerCase();
      speed.push({ type, value: value });
    }
    return speed;
  }
  const speed = gatherSpeed(importedActorData);
  actorData.speed = speed;
  logConsole("speed", speed);

  function gatherAttributes(actorData) {
    const attributes = {};
    let match;
    while ((match = attributesRgx.exec(actorData)) != null) {
      const m = match.groups;
      attributes[m.attribute.toLocaleLowerCase()] = {
        base: m.base,
        mod: m.mod,
      };
    }
    return attributes;
  }
  const attributes = gatherAttributes(importedActorData);
  actorData.attributes = attributes;
  logConsole("attributes", attributes);

  function gatherSaves(actorData) {
    const saves = {};
    let match;
    while ((match = savesRgx.exec(actorData)) != null) {
      const m = match.groups;
      saves[m.ability.toLocaleLowerCase()] = m.mod;
    }
    return saves;
  }
  const saves = gatherSaves(importedActorData);
  actorData.saves = saves;
  logConsole("saves", saves);

  function gatherSkills(actorData) {
    const skills = {};
    let match;
    while ((match = skillsRgx.exec(actorData)) != null) {
      const m = match.groups;
      skills[m.skill] = m.mod;
    }
    return skills;
  }
  const skills = gatherSkills(importedActorData);
  actorData.skills = skills;
  logConsole("skills", skills);

  const immunities = dmgImmunitiesRgx.exec(importedActorData);
  if (immunities) {
    logConsole("immunities", immunities.groups);
  }

  function gatherSenses(actorData) {
    const senses = [];
    let match;
    while ((match = sensesRgx.exec(actorData)) != null) {
      const m = match.groups;
      senses.push({ sense: m.sense.toLocaleLowerCase(), mod: m.mod });
    }
    return senses;
  }
  const senses = gatherSenses(importedActorData);
  actorData.senses = senses;
  logConsole("senses", senses);

  const languages = languagesRgx.exec(importedActorData);
  if (languages) {
    actorData.languages = languages.groups;
    logConsole("languages", languages.groups);
  }

  const challenge = challengeRgx.exec(importedActorData);
  if (challenge) {
    actorData.challenge = challenge.groups;
    logConsole("challenge", challenge.groups);
  }

  const profBonus = proficiencyBonusRgx.exec(importedActorData);
  if (profBonus) {
    actorData.proficiencyBonus = profBonus.groups;
    logConsole("profBonus", profBonus.groups);
  }

  const legendaryResistances = legendaryResistancesRgx.exec(importedActorData);
  if (legendaryResistances) {
    actorData.legendaryResistances = legendaryResistances.groups;
    logConsole("legendaryResistances", legendaryResistances.groups);
  }

  function gatherSections(actorData) {
    const sectionHeaders = [
      "actions",
      "bonus actions",
      "reactions",
      "legendary actions",
      "lair actions",
      "regional effects",
    ];
    const sections = {};
    let header = "";
    for (const line of actorData.trim().split(/\n/g)) {
      const l = line.toLocaleLowerCase();
      if (!l) {
        continue;
      } else if (sectionHeaders.includes(l)) {
        header = l;
        sections[header] = [];
      } else if (sections[header]) {
        sections[header].push(line);
      }
    }
    return sections;
  }
  const sections = gatherSections(importedActorData);
  logConsole("sections", sections);

  // Actions
  const act = sections.actions;
  if (act) {
    const actions = gatherActions(act);
    actorData.actions = actions;
    logConsole("actions", actions);
  }

  // bonus actions
  const bActions = sections["bonus actions"];
  if (bActions) {
    const bonusActions = gatherActions(bActions);
    actorData.bonusActions = bonusActions;
    logConsole("bonus actions", bonusActions);
  }
  // Reactions
  const rActions = sections.reactions;
  if (rActions) {
    const reactions = gatherActions(rActions);
    actorData.reactions = reactions;
    logConsole("reactions", reactions);
  }

  // Legendary Actions
  const lActions = sections["legendary actions"];
  if (lActions) {
    // first section is legendary actions description
    const desc = lActions.splice(0, 1);
    actorData.legendaryActions = {};
    actorData.legendaryActions.desc = desc;
    logConsole("legendary actions desc", desc); //todo handle desc as feature ?
    const legendaryActions = gatherActions(lActions);
    actorData.legendaryActions.actions = legendaryActions;
    logConsole("legendary actions", legendaryActions);
  }

  // Lair actions
  const layActions = sections["lair actions"];
  if (layActions) {
    const lairActions = gatherActions(layActions);
    actorData.lairActions = lairActions;
    logConsole("lair actions", lairActions);
  }

  // regional effects
  const rEffect = sections["regional effects"];
  if (rEffect) {
    const regionalEffects = gatherActions(rEffect);
    actorData.regionalEffects = regionalEffects;
    logConsole("regional effects", regionalEffects);
  }

  const features = gatherFeatures(importedActorData);
  actorData.features = features;
  logConsole("features", features);

  return actorData;
}

async function createActor(actorData) {
  // todo
  // Spells
  const actor = await Actor.create({
    name: actorData.race.name,
    type: "npc",
  });

  const speeds = formatSpeeds(actorData);

  // a single object because multiple "update"-function calls slow the app down
  const updateData = {
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
  };
  await actor.update(updateData);

  // skills
  // has to be done after basic information has been set
  const skills = createSkills(actorData, actor);
  const skillsUpdate = {
    "data.data.skills.acr.value": skills.acr,
    "data.data.skills.ani.value": skills.ani,
    "data.data.skills.arc.value": skills.arc,
    "data.data.skills.ath.value": skills.ath,
    "data.data.skills.dec.value": skills.dec,
    "data.data.skills.his.value": skills.his,
    "data.data.skills.ins.value": skills.ins,
    "data.data.skills.itm.value": skills.itm,
    "data.data.skills.inv.value": skills.inv,
    "data.data.skills.med.value": skills.med,
    "data.data.skills.nat.value": skills.nat,
    "data.data.skills.prf.value": skills.prf,
    "data.data.skills.prc.value": skills.prc,
    "data.data.skills.per.value": skills.per,
    "data.data.skills.rel.value": skills.rel,
    "data.data.skills.slt.value": skills.slt,
    "data.data.skills.ste.value": skills.ste,
    "data.data.skills.sur.value": skills.sur,
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
  // function calcSkillVal(actor, key, val) {
  //   const attribute = actor.data.data.skills[key].ability;
  //   const attributeMod = actor.data.data.abilities[attribute].mod;
  //   const proficiencyBonus = actor.data.data.attributes.prof;
  //   return (val - attributeMod) / proficiencyBonus;
  // }

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
  // logConsole("skills", skills);

  // for (const skill in skills) {
  //   const val = skills[skill];
  //   skills[skill] = calcSkillVal(actor, skill, val);
  // }

  logConsole("skills", skills);
  return skills;
}

function createAction(actionData) {
  // todo
  const action = {};
  return action;
}

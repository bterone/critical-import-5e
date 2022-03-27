import { logConsole } from "./log.js";
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

  const racialInfo = createRacialInfo(actorData);
  await actor.update(racialInfo);

  const armor = createArmor(actorData);
  await actor.update(armor);

  const cr = createChallenge(actorData);
  await actor.update(cr);

  const health = createHealth(actorData);
  await actor.update(health);

  const speed = createSpeed(actorData);
  await actor.update(speed);

  const init = createInitiative(actorData);
  await actor.update(init);

  const attributes = createAttributes(actorData);
  await actor.update(attributes);

  logConsole("actor", actor);
}

function createRacialInfo(actorData) {
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

  const racialData = {
    data: {
      details: {
        alignment: actorData.race.alignment?.trim(),
        race: actorData.race.race?.trim(),
        type: actorData.race.type?.trim(),
      },
      traits: {
        size: size,
      },
    },
  };
  logConsole("racialData", racialData);
  return racialData;
}

function createArmor(actorData) {
  let armorType;
  const type = actorData.armor.armorType.trim().toLocaleLowerCase();
  if (type.includes("natural armor")) {
    armorType = "natural";
  } else {
    // todo handle armor items
    armorType = type;
  }

  const armor = {
    data: {
      attributes: {
        ac: {
          calc: armorType,
          flat: actorData.armor.armorClass?.trim(),
        },
      },
    },
  };
  logConsole("armor", armor);
  return armor;
}

function createChallenge(actorData) {
  const challenge = {
    data: {
      details: {
        cr: actorData.challenge.cr,
        xp: { value: actorData.challenge.xp },
      },
    },
  };
  logConsole("challenge", challenge);
  return challenge;
}

function createHealth(actorData) {
  const health = {
    data: {
      attributes: {
        hp: {
          value: actorData.health.hp,
          max: actorData.health.hp,
          formula: `${actorData.health.formular} + ${actorData.health.formularBonus}`,
        },
      },
    },
  };
  logConsole("health", health);
  return health;
}

function createSpeed(actorData) {
  const speeds = {};
  actorData.speed.forEach((s) => {
    speeds[s.type] = s.value;
  });

  const speed = {
    data: {
      attributes: {
        speed: {
          value: parseInt(speeds.speed),
        },
        movement: {
          walk: parseInt(speeds.speed),
          burrow: parseInt(speeds.burrow),
          climb: parseInt(speeds.climb),
          fly: parseInt(speeds.fly),
          swim: parseInt(speeds.swim),
          hover: parseInt(speeds.hover),
        },
      },
    },
  };
  logConsole("speed", speed);
  return speed;
}

function createInitiative(actorData) {
  const init = {
    "data.attributes.init.bonus": actorData.attributes?.dex?.mod,
  };
  logConsole("init", init);
  return init;
}

function createAttributes(actorData) {
  // saves === "proficient"
  const attributes = {
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
  };
  logConsole(attributes);
  return attributes;
}

function createAction(actionData) {
  // todo
  const action = {};
  return action;
}

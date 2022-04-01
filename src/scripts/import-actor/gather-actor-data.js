import { logConsole } from "../log.js";
import { gatherActions } from "../import-actions.js";
import { gatherSpellcasting } from "../import-spellcasting.js";

export function gatherActorData(importedActorData) {
  // Regex needs to be calculated each time a actor is imported. If not, the regex will fail!
  const racialDetailsRgx =
    /(?<name>.+)(\r|\n|\r\n)(?<size>(Tiny|Small|Medium|Large|Huge|Gargantuan))\s(?<type>.+)\s?(?<race>.+)?\s?,\s?(?<alignment>.+)(\r|\n|\r\n)/gi;
  const armorRgx =
    /(armor|armour) class\s?(?<armorClass>\d+)\s?(\((?<armorType>.+)\))?/gi;
  const healthRgx =
    /(hit points|hp)\s?(?<hp>\d+)\s?(\(?(?<formular>\d+d\d+)?(\s?\+\s?(?<formularBonus>\d+))?)?/gi;
  const dmgImmunitiesRgx =
    /(damage immunities|damage immunity)\s?(?<immunities>.+)/gi;
  const dmgVulnerabilitiesRgx =
    /\bdamage\svulnerabilities\b\s(?<vulnerabilities>.+)/gi;
  const dmgResistancesRgx = /\bdamage\sresistances\b\s(?<resistances>.+)/gi;
  const conditionImmunitesRgx =
    /\bcondition\simmunities\b\s(?<immunities>.+)/gi;
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

  const speed = gatherSpeed(importedActorData);
  actorData.speed = speed;
  logConsole("speed", speed);

  const attributes = gatherAttributes(importedActorData);
  actorData.attributes = attributes;
  logConsole("attributes", attributes);

  const saves = gatherSaves(importedActorData);
  actorData.saves = saves;
  logConsole("saves", saves);

  const skills = gatherSkills(importedActorData);
  actorData.skills = skills;
  logConsole("skills", skills);

  const dmgImmu = extractCsvDict(
    dmgImmunitiesRgx.exec(importedActorData),
    "immunities"
  );
  if (dmgImmu) {
    logConsole("dmgImmu", dmgImmu);
    actorData.dmgImmunities = {};
    actorData.dmgImmunities.immunities = dmgImmu.types;
    actorData.dmgImmunities.custom = dmgImmu.custom;
  }

  const dmgRes = extractCsvDict(
    dmgResistancesRgx.exec(importedActorData),
    "resistances"
  );
  if (dmgRes) {
    logConsole("dmgRes", dmgRes);
    actorData.dmgResistances = {};
    actorData.dmgResistances.resistances = dmgRes.types;
    actorData.dmgResistances.custom = dmgRes.custom;
  }

  const dmgVul = extractCsvDict(
    dmgVulnerabilitiesRgx.exec(importedActorData),
    "vulnerabilities"
  );
  if (dmgVul) {
    logConsole("dmgVul", dmgVul);
    actorData.dmgVulnerabilities = {};
    actorData.dmgVulnerabilities.vulnerabilities = dmgVul.types;
    actorData.dmgVulnerabilities.custom = dmgVul.custom;
  }

  const conditionImmun = extractCsvDict(
    conditionImmunitesRgx.exec(importedActorData),
    "immunities"
  );
  if (conditionImmun) {
    logConsole("conditionImmun", conditionImmun);
    actorData.conditionImmunities = {};
    actorData.conditionImmunities.immunities = conditionImmun.types;
    actorData.conditionImmunities.custom = conditionImmun.custom;
  }

  const senses = gatherSenses(importedActorData);
  actorData.senses = senses;
  logConsole("senses", senses);

  const langs = extractCsvDict(
    languagesRgx.exec(importedActorData),
    "languages"
  );
  if (langs) {
    logConsole("langs", langs);
    actorData.languages = {};
    actorData.languages.langs = langs.types;
    actorData.languages.custom = langs.custom;
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

  // remove actions for error prevention
  const reducedActorData = removeActions(importedActorData);

  // features
  const features = gatherFeatures(reducedActorData);
  actorData.features = features.features;
  logConsole("features", features);

  // spellcasting
  const spellcasting = gatherSpellcasting(reducedActorData);
  actorData.spellcasting = spellcasting;
  logConsole("spellcasting", spellcasting);

  return actorData;
}

function removeActions(actorData) {
  const KNOWN_SECTION_HEADERS = [
    "actions",
    "bonus actions",
    "reactions",
    "legendary actions",
    "lair actions",
    "regional effects",
  ];
  const reducedActorData = actorData.trim().split(/\n/g);
  // remove actions to reduce error possibilities
  for (const idx in reducedActorData) {
    const l = reducedActorData[idx];
    const line = l.trim().toLocaleLowerCase();
    if (KNOWN_SECTION_HEADERS.includes(line)) {
      reducedActorData.splice(idx);
      break;
    }
  }
  return reducedActorData;
}

function gatherSpeed(actorData) {
  const speedRgx =
    /(?<type>(speed|climb|fly|burrow|swim))\s+?(?<value>\d+\s?[^,|\r|\n|\r\n]+)/gi;

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

function gatherAttributes(actorData) {
  const attributesRgx =
    /(?<attribute>[a-zA-z]{3})(\r\n|\r|\n)(?<base>\d+)\s+?\((?<mod>(\+|-)\d+)\)/gi;

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

function gatherSaves(actorData) {
  const savesRgx = /(?<ability>str|dex|con|int|wis|cha) (?<mod>(\+|\-)\d+)/gi;

  const saves = {};
  let match;
  while ((match = savesRgx.exec(actorData)) != null) {
    const m = match.groups;
    saves[m.ability.toLocaleLowerCase()] = m.mod;
  }
  return saves;
}

function gatherSkills(actorData) {
  const skillsRgx =
    /(?<skill>acrobatics|arcana|animal handling|athletics|deception|history|insight|intimidation|investigation|medicine|nature|perception|performance|persuasion|religion|sleight of hand|stealth|survival) (?<mod>(\+|\-)\d+)/gi;

  const skills = {};
  let match;
  while ((match = skillsRgx.exec(actorData)) != null) {
    const m = match.groups;
    skills[m.skill] = m.mod;
  }
  return skills;
}

function gatherSenses(actorData) {
  const sensesRgx =
    /(?<sense>darkvision|blindsight|tremorsense|truesight|passive perception)\s?(?<mod>\d+)/gi;

  const senses = [];
  let match;
  while ((match = sensesRgx.exec(actorData)) != null) {
    const m = match.groups;
    senses.push({
      sense: m.sense.toLocaleLowerCase().trim().replace(" ", ""),
      mod: m.mod,
    });
  }
  return senses;
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

export function gatherFeatures(actorDataWithoutActions) {
  const featureRgx = /.*(\r|\n|\r\n)+(?<name>[a-zA-Z\s]+)\.(?<desc>.+)/gi;

  const features = {};
  const shortActorData = actorDataWithoutActions.join(`\n`);
  const feats = [];
  let match;
  while ((match = featureRgx.exec(shortActorData)) != null) {
    const m = match.groups;
    if (m) {
      feats.push(m);
    }
  }
  features.feats = feats;
  return features;
}

function extractCsvDict(csvDict, propName) {
  if (!csvDict) {
    return;
  }

  logConsole("damageTypes", csvDict);

  const values = csvDict.groups?.[propName].trim().toLocaleLowerCase();
  logConsole("types", values);
  if (values.includes(";")) {
    // list with custom conditions
    const sections = values.split(";");
    const vs = sections[0].replace(" ", "").split(",");
    const vals = [];
    for (const v of vs) {
      vals.push(v.trim());
    }
    const custom = sections[1];
    return { types: vals, custom };
  } else if (values.includes("from")) {
    // custom condition only
    return { types: undefined, custom: values };
  } else {
    // types only
    const vals = [];
    for (const v of values.replace(" ", "").split(",")) {
      vals.push(v.trim());
    }
    return {
      types: vals,
      custom: undefined,
    };
  }
}

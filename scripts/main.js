function createActorSheet(actorData) {
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
  const sensesRgx =
    /(?<sense>darkvision|blindsight|tremorsense|truesight|passive perception)\s?(?<mod>\d+)/gi;
  const languagesRgx = /(languages|language)\s?(?<languages>.*)/gi;
  const challengeRgx = /(challenge|cr)\s?(?<cr>([\d/]+))\s?\((?<xp>[\d,]+)/gi;
  const proficiencyBonusRgx =
    /(proficiency bonus|prof bonus)\s?(?<profBonus>\+\d+)/gi;
  const legendaryResistancesRgx =
    /legendary resistance\s?\(?(?<timesADay>\d+).day.?\.?(?<desc>.+)/gi;

  const racialDetails = racialDetailsRgx.exec(actorData);
  console.log("racialDetails", racialDetails.groups);

  const armor = armorRgx.exec(actorData);
  console.log("armor", armor.groups);

  const health = healthRgx.exec(actorData);
  console.log("health", health.groups);

  function gatherSpeed() {
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
  const speed = gatherSpeed();
  console.log("speed", speed);

  function gatherAttributes() {
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
  const attributes = gatherAttributes();
  console.log("attributes", attributes);

  function gatherSaves() {
    const saves = {};
    let match;
    while ((match = savesRgx.exec(actorData)) != null) {
      const m = match.groups;
      saves[m.ability.toLocaleLowerCase()] = m.mod;
    }
    return saves;
  }
  const saves = gatherSaves();
  console.log("saves", saves);

  function gatherSkills() {
    const skills = {};
    let match;
    while ((match = skillsRgx.exec(actorData)) != null) {
      const m = match.groups;
      skills[m.skill] = m.mod;
    }
    return skills;
  }
  const skills = gatherSkills();
  console.log("skills", skills);

  const immunities = dmgImmunitiesRgx.exec(actorData);
  console.log("immunities", immunities.groups);

  function gatherSenses() {
    const senses = [];
    let match;
    while ((match = sensesRgx.exec(actorData)) != null) {
      const m = match.groups;
      senses.push({ sense: m.sense.toLocaleLowerCase(), mod: m.mod });
    }
    return senses;
  }
  const senses = gatherSenses();
  console.log("senses", senses);

  const languages = languagesRgx.exec(actorData);
  console.log("languages", languages.groups);

  const challenge = challengeRgx.exec(actorData);
  console.log("challenge", challenge.groups);

  const profBonus = proficiencyBonusRgx.exec(actorData);
  console.log("profBonus", profBonus.groups);

  const legendaryResistances = legendaryResistancesRgx.exec(actorData);
  console.log("legendaryResistances", legendaryResistances.groups);

  function gatherSections() {
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
  const sections = gatherSections();
  console.log("sections", sections);

  // Actions
  function gatherActions(sections) {
    // const spellCastingRegex =
    //   /\((?<slots>\d+) slot|(?<perday>\d+)\/day|spellcasting ability is (?<ability>\w+)|spell save dc (?<savedc>\d+)/gi;
    // const spellLevelRegex = /(?<level>\d+)(.+)level spellcaster/i;

    const actionBasicsRgx = /(?<name>[a-zA-Z]+)(.|\s|(\r|\n|\r\n))(?<desc>.+)/i;
    const dmgRgx =
      /(?<flatDmg>\d+)\s?\((?<formula>\d+d\d+\s?(\+?\s?\d+)?).+?(?<type>\bbludgeoning\b|\bpiercing\b|\bslashing\b|\bacid\b|\bcold\b|\bfire\b|\blightning\b|\bnecrotic\b|\bpoison\b|\bpsychic\b|\bradiant\b|\bthunder\b)\s?damage/gi;
    const actionVersatileRgx =
      /\((?<dmgroll>\d+d\d+(\s??\+\s??\d+)?)\)\s?(?<dmgtype>\w+)\s?damage if used with two hands/i; // todo find test actor
    const actionHitRgx = /(attack|damage):\s?\+(?<toHit>\d+)\s?to\s?hit/i;
    const actionReachRgx = /reach (?<reach>\d+) ?(ft|'|’)/i;
    const actionRangeRgx = /range\s?(?<normal>\d+)\/(?<far>\d+)\s??(ft|'|’)/i;
    const actionShapedTargetRgx =
      /(?<range>\d+)?-(foot|ft?.|'|’)\s?(?<shape>\w+)/i;
    const actionRechargeRgx = /recharge\s?(?<from>\d+)((\–|\-)(?<to>\d+))?/i;
    const actionSavingThrowRgx =
      /dc\s?(?<dc>\d+)\s?(?<ability>\w+)\s?saving throw/i;

    const acts = sections.actions;
    const actions = [];

    for (const a of acts) {
      const action = {};

      const actionBasics = actionBasicsRgx.exec(a);
      const ab = actionBasics?.groups;
      if (ab) {
        action.name = ab.name;
        action.desc = ab.desc;
      }

      const dmg = [];
      let match;
      while ((match = dmgRgx.exec(a)) != null) {
        const m = match.groups;
        if (m) {
          dmg.push({ flat: m.flatDmg, formula: m.formula, type: m.type });
        }
      }
      action.dmg = dmg;

      const versatile = actionVersatileRgx.exec(a);
      const v = versatile?.groups;
      if (v) {
        action.versatile = v; // todo
      }

      const hit = actionHitRgx.exec(a);
      const h = hit?.groups;
      if (h) {
        action.hit = h.toHit;
      }

      const reach = actionReachRgx.exec(a);
      const rea = reach?.groups;
      if (rea) {
        action.reach = rea.reach;
      }

      const range = actionRangeRgx.exec(a);
      const r = range?.groups;
      if (r) {
        action.range = { normal: r.normal, far: r.far };
      }

      const shape = actionShapedTargetRgx.exec(a);
      const sh = shape?.groups;
      if (sh) {
        action.shape = { range: sh.range, shape: sh.shape };
      }

      const recharge = actionRechargeRgx.exec(a);
      const re = recharge?.groups;
      if (re) {
        action.recharge = { from: re.from, to: re.to };
      }

      const save = actionSavingThrowRgx.exec(a);
      const s = save?.groups;
      if (s) {
        action.savingThrow = { ability: s.ability, dc: s.dc };
      }

      actions.push(action);
    }
    // todo actor action (from D&D 5e template.json)
    // "action": {
    //   "ability": null,
    //   "actionType": null,
    //   "attackBonus": 0,
    //   "chatFlavor": "",
    //   "critical": {
    //     "threshold": null,
    //     "damage": ""
    //   },
    //   "damage": {
    //     "parts": [],
    //     "versatile": ""
    //   },
    //   "formula": "",
    //   "save": {
    //     "ability": "",
    //     "dc": null,
    //     "scaling": "spell"
    //   }
    // },
    return actions;
  }
  const actions = gatherActions(sections);
  console.log("actions", actions);
  // Bonus actions
  // Reactions
  // Legendary Actions
  // Lair actions
  // regional effects
  // Spells
  // Features (see night hag)

  // todo
  // await Actor.create({
  //   name: "Test NPC",
  //   type: "npc",
  // });
}

// used for item, spell, class, monster feature, racial feature
function createItemSheet() {
  // todo
}

function openImportDialog(title, callback) {
  /**
   * HTMLElement.outerHTML does't work for input.value!
   * => because of this, a string representation is necessary
   */
  const content =
    `
       <div>
        <textarea id="importDialog` +
    title +
    `" wrap="hard" cols="1" placeholder="Usage:
          - Paste the full ` +
    title +
    `statblock text, formatted following the WotC formular, into this box.
          - If copy-paste errors occure, a fix inside this box may be done."></textarea>
       </div>
     `;

  let d = new Dialog({
    title: "Critical Import 5e - Import " + title,
    content,
    buttons: {
      done: {
        icon: '<i class="fas fa-file-download"></i>',
        label: "Import",
        callback: callback,
      },
    },
    default: "close",
    render: (html) =>
      console.log("onRender - Register interactivity in the rendered dialog"),
    close: (html) => {
      console.log("closed Import " + title + " dialog");
    },
  });
  d.render(true);
}

function createImportButton(label, callback) {
  const icon = document.createElement("i");
  icon.classList = "fas fa-file-download";

  const btn = document.createElement("button");
  btn.classList = "dndbeyondSync-menu-btn";
  btn.innerText = label;
  btn.onclick = callback;
  btn.appendChild(icon);
  return btn;
}

function getDialogId(label) {
  return "importDialog-" + label + "-input";
}

Hooks.on("ready", () => {
  console.log("critical-import-5e | starting ...");
});

const DIALOG_ID = "importDialog";
// monster, NPC
Hooks.on("renderActorDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  const label = "Actor ";
  footer.appendChild(
    createImportButton("Import " + label, () => {
      openImportDialog(label, async () => {
        const actorData = document.getElementById(DIALOG_ID + label).value;
        await createActorSheet(actorData);
      });
    })
  );
});

// item, spell, class, monster feature, racial feature
Hooks.on("renderItemDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  const labelItem = "Item ";
  footer.appendChild(
    createImportButton("Import " + labelItem, () => {
      openImportDialog(labelItem, () => {
        console.log(labelItem);
      });
    })
  );

  const labelSpell = "Spell ";
  footer.appendChild(
    createImportButton("Import " + labelSpell, () => {
      openImportDialog(labelSpell, () => {
        console.log(labelSpell);
      });
    })
  );

  const labelClass = "Class ";
  footer.appendChild(
    createImportButton("Import " + labelClass, () => {
      openImportDialog(labelClass, () => {
        console.log(labelClass);
      });
    })
  );

  const labelFeature = "Feature ";
  footer.appendChild(
    createImportButton("Import " + labelFeature, () => {
      openImportDialog(labelFeature, () => {
        console.log(labelFeature);
      });
    })
  );
});

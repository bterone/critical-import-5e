// For action titles, the first word has to start with a capital letter, followed by 0-3 other words, ignoring prepositions,
// followed by a period. Support words with hyphens, non-capital first letter, and parentheses like '(Recharge 5-6)'.
const actionTitleRegex =
  /^(([A-Z]\w+[ \-]?)(\s(of|and|the|from|in|at|on|with|to|by)\s)?(\w+ ?){0,3}(\([\w –\-\/]+\))?)\./;
const racialDetailsRegex =
  /^(?<size>\bfine\b|\bdiminutive\b|\btiny\b|\bsmall\b|\bmedium\b|\blarge\b|\bhuge\b|\bgargantuan\b|\bcolossal\b)\s(?<type>\w+)([,|\s]+\((?<race>[\w|\s]+)\))?([,|\s]+(?<alignment>[\w|\s]+))?/i;
const armorRegex =
  /^((armor|armour) class) (?<ac>\d+)( \((?<armortype>.+)\))?/i;
const healthRegex =
  /^(hit points) (?<hp>\d+) \((?<formula>\d+d\d+( ?[\+|\-|−|–] ?\d+)?)\)/i;
const speedRegex = /(?<name>\w+) (?<value>\d+)/gi;
const abilityNamesRegex = /\bstr\b|\bdex\b|\bcon\b|\bint\b|\bwis\b|\bcha\b/gi;
const abilitySavesRegex =
  /(?<name>\bstr\b|\bdex\b|\bcon\b|\bint\b|\bwis\b|\bcha\b) (?<modifier>[\+|-]\d+)/gi;
const abilityValuesRegex = /(?<base>\d+)\s?\((?<modifier>[\+|\-|−|–]\d+)\)/g;
const skillsRegex =
  /(?<name>\bacrobatics\b|\barcana\b|\banimal handling\b|\bathletics\b|\bdeception\b|\bhistory\b|\binsight\b|\bintimidation\b|\binvestigation\b|\bmedicine\b|\bnature\b|\bperception\b|\bperformance\b|\bpersuasion\b|\breligion\b|\bsleight of hand\b|\bstealth\b|\bsurvival\b) (?<modifier>[\+|-]\d+)/gi;
const damageTypesRegex =
  /\bbludgeoning\b|\bpiercing\b|\bslashing\b|\bacid\b|\bcold\b|\bfire\b |\blightning\b|\bnecrotic\b|\bpoison\b|\bpsychic\b|\bradiant\b|\bthunder\b|/gi;
const sensesRegex =
  /(?<name>\bdarkvision\b|\bblindsight\b|\btremorsense\b|\btruesight\b) (?<modifier>\d+)/i;
const challengeRegex = /^challenge (?<cr>(½|[\d/]+)) \((?<xp>[\d,]+)/i;
const spellCastingRegex =
  /\((?<slots>\d+) slot|(?<perday>\d+)\/day|spellcasting ability is (?<ability>\w+)|spell save dc (?<savedc>\d+)/gi;
const spellLevelRegex = /(?<level>\d+)(.+)level spellcaster/i;
const attackRegex = /(attack|damage): \+(?<tohit>\d+) to hit/i;
const reachRegex = /reach (?<reach>\d+) ?(ft|'|’)/i;
const rangeRegex = /range (?<near>\d+)\/(?<far>\d+) ?(ft|'|’)/i;
const rechargeRegex = /\(recharge (?<recharge>\d+)([–|-]\d+)?\)/i;
const savingThrowRegex = /dc (?<savedc>\d+) (?<saveability>\w+) saving throw/i;
const versatileRegex =
  /\((?<damageroll>\d+d\d+( ?\+ ?\d+)?)\) (?<damagetype>\w+) damage if used with two hands/i;
const targetRegex = /(?<range>\d+)?-(foot|ft?.|'|’) (?<shape>\w+)/i;
const damageRollsQuery =
  "(?<={0})[\\s\\w\\d,]+\\((?<damageroll1>\\d+d\\d+)( \\+ (?<damagemod1>\\d+))?\\) (?<damagetype1>\\w+)(.+plus.+\\((?<damageroll2>\\d+d\\d+( \\+ (?<damagemod2>\\d+))?)\\) (?<damagetype2>\\w+))?";

async function createActorSheet(actorData) {
  // actorData = actorData.replace(/\n/g, "");
  // console.log(actorData);

  var line = actorData.split(/\n/g);
  for (var i = 0; i < line.length; i++) {
    // todo
    console.log([i] + ". ", line[i]);
  }

  /**
   * OTHER VALUES TO BE SET
   * types = "npc" => currently only NPC possilbe
   * initative    => common.attributes.init
   * blindsight   => common.creature.attributes.senses.blindsight
   * tremorsense  => common.creature.attributes.senses.tremorsense
   * truesight    => common.creature.attributes.senses.truesight
   */

  /**
   * OTHER VALUES TO =>>MAY<<= SET
   * description                    => common.details
   * currency                       => common.currency
   * skills (acrobatics and so on)  => common.creature.skills
   * spells                         => common.creature.spells
   * spell DC                       => common.creature.bonuses.spell.dc
   * spellcasting attribute         => common.creature.attributes.spellcasting
   * swarm                          => common.npc.details.type.swarm
   * NPC type                       => common.npc.details.type
   * Book source                    => common.npm.details.source
   * Vehicle                        => common.vehicle
   */

  // Goblin               => name
  // Small                => common.traits.size
  // humanoid (goblinoid) => common.creature.details.race
  // neutral evil         => common.creature.details.alignment

  // Armor Class 15 (Leather Armor, Shield) => common.attributes.ac

  // Hit Points 7 (2d6) => common.attributes.hp
  // Speed 30 ft.       => common.attributes.movement

  /**
   * common.abilities
   */
  // STR      => common.abilities[str]
  // 8        => common.abilities[str].value
  // (-1)     => common.abilities[str].bonuses.check & common.abilities[str].bonuses.save
  // DEX
  // 14 (+2)
  // CON
  // 10 (+0)
  // INT
  // 10 (+0)
  // WIS
  // 8 (-1)
  // CHA
  // 8 (-1)

  // Skills Stealth +6          => common.creature.skills.ste
  // Senses Darkvision 60 ft.   => common.creature.attributes.senses.darkvision
  // Passive Perception 9       => common.creature.skills.per.bonuses.passive
  // Languages Common, Goblin   => common.creature.traits.languages
  // Challenge 1/4              => common.npc.cr
  // (50 XP)                    => common.npc.xp.value
  // Proficiency Bonus +2       => ???

  /**
   * Features => template.json => feat
   */
  // Nimble Escape. The goblin can take the Disengage or Hide action as a bonus action on each of its turns.

  /**
   * Actions => ???
   */
  // Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.
  // Shortbow. Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.

  await Actor.create({
    name: "Test NPC",
    type: "npc",
  });
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

const dialogId = "importDialog";

// monster, NPC
Hooks.on("renderActorDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  const label = "Actor ";
  footer.appendChild(
    createImportButton("Import " + label, () => {
      openImportDialog(label, async () => {
        const actorData = document.getElementById(dialogId + label).value;
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

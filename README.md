# critical-import-5e

FoundryVTT import module for monsters, NPCs, items, spells, and so on.

## Development

### Dev board

The kanban board can be found here:
https://trello.com/b/GZDotdDc/critical-import-5e

### Development environment

For a simple development environment add a symlink for the root directory of this repository into your FoundryVTT modules dir.

#### MacOS example

```
ln -s ~/src/critical-import-5e/ /Users/Beaver/Library/Application\ Support/FoundryVTT/Data/modules
```

To build the project run the following command

```
yarn run build
```

## FoundryVTT Actor overview

### OTHER VALUES TO BE SET

- types = "npc" => currently only NPC possilbe
- initative => common.attributes.init
- blindsight => common.creature.attributes.senses.blindsight
- tremorsense => common.creature.attributes.senses.tremorsense
- truesight => common.creature.attributes.senses.truesight

### OTHER VALUES TO =>>MAY<<= SET

- description => common.details
- currency => common.currency
- skills (acrobatics and so on) => common.creature.skills
- spells => common.creature.spells
- spell DC => common.creature.bonuses.spell.dc
- spellcasting attribute => common.creature.attributes.spellcasting
- swarm => common.npc.details.type.swarm
- NPC type => common.npc.details.type
- Book source => common.npm.details.source
- Vehicle => common.vehicle

- Goblin => name
- Small => common.traits.size
- humanoid (goblinoid) => common.creature.details.race
- neutral evil => common.creature.details.alignment

- Armor Class 15 (Leather Armor, Shield) => common.attributes.ac

- Hit Points 7 (2d6) => common.attributes.hp
- Speed 30 ft. => common.attributes.movement

### common.abilities

- STR => common.abilities[str]
- 8 => common.abilities[str].value
- (-1) => common.abilities[str].bonuses.check & common.abilities[str].bonuses.save
- DEX
- 14 (+2)
- CON
- 10 (+0)
- INT
- 10 (+0)
- WIS
- 8 (-1)
- CHA
- 8 (-1)

- Skills Stealth +6 => common.creature.skills.ste
- Senses Darkvision 60 ft. => common.creature.attributes.senses.darkvision
- Passive Perception 9 => common.creature.skills.per.bonuses.passive
- Languages Common, Goblin => common.creature.traits.languages
- Challenge 1/4 => common.npc.cr
- (50 XP) => common.npc.xp.value
- Proficiency Bonus +2 => ???

### Features => template.json => feat

- Nimble Escape. The goblin can take the Disengage or Hide action as a bonus action on each of its turns.

### Actions => tamplate.json => action

#### see code snip below

```
      "action": {
        "ability": null,
        "actionType": null,
        "attackBonus": 0,
        "chatFlavor": "",
        "critical": {
          "threshold": null,
          "damage": ""
        },
        "damage": {
          "parts": [],
          "versatile": ""
        },
        "formula": "",
        "save": {
          "ability": "",
          "dc": null,
          "scaling": "spell"
        }
      },
```

- Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.
- Shortbow. Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.

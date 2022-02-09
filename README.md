# critical-import-5e

FoundryVTT import module for monsters, NPCs, items, spells, and so on.

## Development

For a simple development environment add a symlink for the root directory of this repository into your FoundryVTT modules dir.

### MacOS example

```
ln -s ~/src/critical-import-5e/ /Users/Beaver/Library/Application\ Support/FoundryVTT/Data/modules
```

## Import algorithmic

### Actor import

The following describes the core principle of the import algorithmic for actor's.

- Read user input as lines of strings
- determine sections by cutting lines array by each empty row
  - First section is always
    - Name
    - Size
    - Race / Subrace
    - Alignment
  - Second section is always
    - AC with armor type
    - HP flat and with calculation
    - Speed
  - Third section is always
    - Abilities
      - STR label
      - STR value and modifier
      - DEX label
      - DEX value and modifier
      - CON label
      - CON value and modifier
      - INT label
      - INT value and modifier
      - WIS label
      - WIS value and modifier
      - CHA label
      - CHA value and modifier
  - Fourth section mixed but may contain
    - Saving throws
    - Skills
    - Damage resistences
    - Damage immunities
    - Damage vulnerabilities
    - Senses
    - Languages
    - CR with XP
    - Proficiency Bonus

### Import examples

#### Goblin

Goblin
Small humanoid (goblinoid) , neutral evil

Armor Class 15 (Leather Armor, Shield)
Hit Points 7 (2d6)
Speed 30 ft.

STR
8 (-1)
DEX
14 (+2)
CON
10 (+0)
INT
10 (+0)
WIS
8 (-1)
CHA
8 (-1)

Skills Stealth +6
Senses Darkvision 60 ft., Passive Perception 9
Languages Common, Goblin
Challenge 1/4 (50 XP)
Proficiency Bonus +2

Nimble Escape. The goblin can take the Disengage or Hide action as a bonus action on each of its turns.

Actions
Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.

Shortbow. Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.

#### Adult Red Dragon

Adult Red Dragon
Huge dragon , chaotic evil

Armor Class 19 (Natural Armor)
Hit Points 256 (19d12 + 133)
Speed 40 ft., climb 40 ft., fly 80 ft.

STR
27 (+8)
DEX
10 (+0)
CON
25 (+7)
INT
16 (+3)
WIS
13 (+1)
CHA
21 (+5)

Saving Throws DEX +6, CON +13, WIS +7, CHA +11
Skills Perception +13, Stealth +6
Damage Immunities Fire
Senses Blindsight 60 ft., Darkvision 120 ft., Passive Perception 23
Languages Common, Draconic
Challenge 17 (18,000 XP)
Proficiency Bonus +6

Legendary Resistance (3/Day). If the dragon fails a saving throw, it can choose to succeed instead.

Actions
Multiattack. The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.

Bite. Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage.

Claw. Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage.

Tail. Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage.

Frightful Presence. Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.

Fire Breath (Recharge 5–6). The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one.

Legendary Actions
The dragon can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The dragon regains spent legendary actions at the start of its turn.

Detect. The dragon makes a Wisdom (Perception) check.

Tail Attack. The dragon makes a tail attack.

Wing Attack (Costs 2 Actions). The dragon beats its wings. Each creature within 10 feet of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.

#### Night Hag

Night Hag
Medium fiend , neutral evil

Armor Class 17 (Natural Armor)
Hit Points 112 (15d8 + 45)
Speed 30 ft.

STR
18 (+4)
DEX
15 (+2)
CON
16 (+3)
INT
16 (+3)
WIS
14 (+2)
CHA
16 (+3)

Skills Deception +7, Insight +6, Perception +6, Stealth +6
Damage Resistances Cold, Fire; Bludgeoning, Piercing, and Slashing from Nonmagical Attacks that aren't Silvered
Condition Immunities Charmed
Senses Darkvision 120 ft., Passive Perception 16
Languages Abyssal, Common, Infernal, Primordial
Challenge 5 (1,800 XP)
Proficiency Bonus +3

Innate Spellcasting. The hag's innate spellcasting ability is Charisma (spell save DC 14, +6 to hit with spell attacks). She can innately cast the following spells, requiring no material components:

At will: detect magic, magic missile

2/day each: plane shift (self only), ray of enfeeblement, sleep

Magic Resistance. The hag has advantage on saving throws against spells and other magical effects.

Actions
Claws.(Hag Form Only). Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage.

Change Shape. The hag magically polymorphs into a Small or Medium female humanoid, or back into her true form. Her statistics are the same in each form. Any equipment she is wearing or carrying isn't transformed. She reverts to her true form if she dies.

Etherealness. The hag magically enters the Ethereal Plane from the Material Plane, or vice versa. To do so, the hag must have a heartstone in her possession.

Nightmare Haunting (1/Day). While on the Ethereal Plane, the hag magically touches a sleeping humanoid on the Material Plane. A protection from evil and good spell cast on the target prevents this contact, as does a magic circle. As long as the contact persists, the target has dreadful visions. If these visions last for at least 1 hour, the target gains no benefit from its rest, and its hit point maximum is reduced by 5 (1d10). If this effect reduces the target's hit point maximum to 0, the target dies, and if the target was evil, its soul is trapped in the hag's soul bag. The reduction to the target's hit point maximum lasts until removed by the greater restoration spell or similar magic.

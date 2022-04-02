import { logConsole, logWarn } from "./log";

export function trimElements(list, delimiter) {
  return list.split(delimiter).map((el) => el.trim());
}

export async function retrieveFromPack(packName, itemNames) {
  const pack = game.packs.get(packName);
  if (!pack) {
    return;
  }

  const items = [];
  for (const itemName of itemNames) {
    logConsole("itemName", itemName);
    const item = pack.index.find(
      (i) => itemName.toLowerCase() === i.name.toLowerCase()
    );
    if (!item) {
      continue;
    }
    const doc = await pack.getDocument(item._id);
    logConsole("doc", doc);
    items.push(doc.toObject());
  }
  return items;
}

export function shortenAbility(longAbilityName) {
  switch (longAbilityName.trim().toLowerCase()) {
    case "strength":
      return "str";
    case "dexterity":
      return "dex";
    case "constitution":
      return "con";
    case "intelligence":
      return "int";
    case "wisdom":
      return "wis";
    case "charisma":
      return "cha";
    default:
      logWarn("unknown ability", longAbilityName);
      break;
  }
}

import { logConsole } from "./log";

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

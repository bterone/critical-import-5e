export function trimElements(list, delimiter) {
  return list.split(delimiter).map((el) => el.trim());
}

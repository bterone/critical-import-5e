import { Logger } from "../log";

const logger = new Logger("import-actions.js");
logger.disable();

const NAME_RGX = /^(?<name>([a-zA-Z\d\(\)\/\-\–]+\s?){1,5})\./i;

export function gatherActions(rawActions) {
  // const spellCastingRegex =
  //   /\((?<slots>\d+) slot|(?<perday>\d+)\/day|spellcasting ability is (?<ability>\w+)|spell save dc (?<savedc>\d+)/gi;
  // const spellLevelRegex = /(?<level>\d+)(.+)level spellcaster/i;
  const actions = [];

  for (const a of rawActions) {
    const actionName = NAME_RGX.exec(a);
    const isNewAction = actionName?.groups.name;
    if (isNewAction) {
      const action = createAction(a);
      actions.push(action);
    } else if (actions.length > 0) {
      const previousAction = actions[actions.length - 1];
      previousAction.desc += a;
    } else {
      logger.logWarn("Unable to parse action", a);
    }
  }

  return actions;
}

const ACTION_BASICS_RGX =
  /(?<name>[a-zA-Z\s\d\(\)\/\-\–]+(\.\(.+\))?)\.\s?(?<desc>.+)/i;
const VERSATILE_RGX =
  /\((?<dmgroll>\d+d\d+(\s??\+\s??\d+)?)\)\s?(?<dmgtype>\w+)\s?damage if used with two hands/i; // todo find test actor
const HIT_RGX = /(attack|damage):\s?\+(?<toHit>\d+)\s?to\s?hit/i;
const REACH_RGX = /reach (?<reach>\d+) ?(ft|'|’)/i;
const RANGE_RGX = /range\s?(?<normal>\d+)\/(?<far>\d+)\s??(ft|'|’)/i;
const SHAPED_TARGET_RGX =
  /\W(?<range>\d+)?-(­-)?(foot|ft?.|'|’)\s?(?<shape>\w+)/i;
const RECHARGE_RGX = /recharge\s?(?<from>\d+)((\–|\-)(?<to>\d+))?/i;
const SAVING_THROW_RGX = /dc\s?(?<dc>\d+)\s?(?<ability>\w+)\s?saving throw/i;

function createAction(a) {
  const dmgRgx =
    /(?<flatDmg>\d+)\s?\((?<formula>\d+d\d+\s?(\+?\s?\d+)?).+?(?<type>\bbludgeoning\b|\bpiercing\b|\bslashing\b|\bacid\b|\bcold\b|\bfire\b|\blightning\b|\bnecrotic\b|\bpoison\b|\bpsychic\b|\bradiant\b|\bthunder\b)\s?damage/gi;

  const action = {};

  const actionBasics = ACTION_BASICS_RGX.exec(a);
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

  const versatile = VERSATILE_RGX.exec(a);
  const v = versatile?.groups;
  if (v) {
    action.versatile = v; // todo does it work?
  }

  const hit = HIT_RGX.exec(a);
  const h = hit?.groups;
  if (h) {
    action.hit = h.toHit;
  }

  const reach = REACH_RGX.exec(a);
  const rea = reach?.groups;
  if (rea) {
    action.reach = rea.reach;
  }

  const range = RANGE_RGX.exec(a);
  const r = range?.groups;
  if (r) {
    action.range = { normal: r.normal, far: r.far };
  }

  const shape = SHAPED_TARGET_RGX.exec(a);
  const sh = shape?.groups;
  if (sh) {
    action.shape = { range: sh.range, shape: sh.shape };
  }

  const recharge = RECHARGE_RGX.exec(a);
  const re = recharge?.groups;
  if (re) {
    action.recharge = { from: re.from, to: re.to };
  }

  const save = SAVING_THROW_RGX.exec(a);
  const s = save?.groups;
  if (s) {
    action.savingThrow = { ability: s.ability, dc: s.dc };
  }

  return action;
}

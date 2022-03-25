export function gatherActions(rawActions) {
  // const spellCastingRegex =
  //   /\((?<slots>\d+) slot|(?<perday>\d+)\/day|spellcasting ability is (?<ability>\w+)|spell save dc (?<savedc>\d+)/gi;
  // const spellLevelRegex = /(?<level>\d+)(.+)level spellcaster/i;

  const actionBasicsRgx =
    /(?<name>[a-zA-Z\s\d()/]+(\.\([a-zA-Z\s\d()/]+\))?)(.|\s|(\r|\n|\r\n))(?<desc>.+)/i;
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

  const actions = [];

  for (const a of rawActions) {
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

  return actions;
}

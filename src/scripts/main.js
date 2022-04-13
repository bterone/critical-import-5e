import { openImportDialog } from "./dialog.js";
import { createImportButton } from "./inject.js";
import { importActor } from "./import-actor/import-actor.js";
import { importSpell } from "./import-spell/import-spell.js";
import { Logger } from "./log.js";

const logger = new Logger("main.js");
logger.disable();

function readUserInput(label) {
  return document.getElementById(`critical-import-input-${label}`).value;
}

Hooks.on("ready", () => {
  logger.logConsole("critical-import-5e | starting ...");
});

// monster, NPC
Hooks.on("renderActorDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  const labelActor = "Actor";
  footer.appendChild(
    createImportButton("Import " + labelActor, async () => {
      await openImportDialog(
        labelActor,
        "Please paste your actor (formated in the WotC style) in here!",
        async () => {
          const actorData = readUserInput(labelActor);
          await importActor(actorData);
        }
      );
    })
  );
});

// item, spell, class, monster feature, racial feature
Hooks.on("renderItemDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  // const labelItem = "Item ";
  // footer.appendChild(
  //   createImportButton("Import " + labelItem, () => {
  //     openImportDialog(labelItem, () => {
  //       logger.logConsole(labelItem);
  //     });
  //   })
  // );

  const labelSpell = "Spell";
  footer.appendChild(
    createImportButton("Import " + labelSpell, async () => {
      await openImportDialog(
        labelSpell,
        "Please paste your spell (formated in the WotC style) in here!",
        async () => {
          const spellData = readUserInput(labelSpell);
          await importSpell(spellData);
        }
      );
    })
  );

  // const labelClass = "Class ";
  // footer.appendChild(
  //   createImportButton("Import " + labelClass, () => {
  //     openImportDialog(labelClass, () => {
  //       logger.logConsole(labelClass);
  //     });
  //   })
  // );

  // const labelFeature = "Feature ";
  // footer.appendChild(
  //   createImportButton("Import " + labelFeature, () => {
  //     openImportDialog(labelFeature, () => {
  //       logger.logConsole(labelFeature);
  //     });
  //   })
  // );
});

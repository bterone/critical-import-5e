import { openImportDialog } from "./dialog.js";
import { createImportButton } from "./inject.js";
import { importActor } from "./import-actor/import-actor.js";
import { Logger } from "./log.js";

const logger = new Logger("main.js");
logger.disable();

// function getDialogId(label) {
//   return "importDialog-" + label + "-input";
// }

Hooks.on("ready", () => {
  logger.logConsole("critical-import-5e | starting ...");
});

// monster, NPC
Hooks.on("renderActorDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  const label = "Actor";
  footer.appendChild(
    createImportButton("Import " + label, async () => {
      await openImportDialog(label, async () => {
        const actorData = document.getElementById(
          "critical-import-input-actor"
        ).value;
        await importActor(actorData);
      });
    })
  );
});

// // item, spell, class, monster feature, racial feature
// Hooks.on("renderItemDirectory", (args) => {
//   const footer = args.element[0].getElementsByTagName("footer")[0];
//   const labelItem = "Item ";
//   footer.appendChild(
//     createImportButton("Import " + labelItem, () => {
//       openImportDialog(labelItem, () => {
//         logger.logConsole(labelItem);
//       });
//     })
//   );

//   const labelSpell = "Spell ";
//   footer.appendChild(
//     createImportButton("Import " + labelSpell, () => {
//       openImportDialog(labelSpell, () => {
//         logger.logConsole(labelSpell);
//       });
//     })
//   );

//   const labelClass = "Class ";
//   footer.appendChild(
//     createImportButton("Import " + labelClass, () => {
//       openImportDialog(labelClass, () => {
//         logger.logConsole(labelClass);
//       });
//     })
//   );

//   const labelFeature = "Feature ";
//   footer.appendChild(
//     createImportButton("Import " + labelFeature, () => {
//       openImportDialog(labelFeature, () => {
//         logger.logConsole(labelFeature);
//       });
//     })
//   );
// });

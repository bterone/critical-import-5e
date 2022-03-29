import { openImportDialog, createImportButton } from "./dialog.js";
import { importActor } from "./import-actor/import-actor.js";
import { logConsole } from "./log.js";

// function getDialogId(label) {
//   return "importDialog-" + label + "-input";
// }

Hooks.on("ready", () => {
  logConsole("critical-import-5e | starting ...");
});

const DIALOG_ID = "importDialog";
// monster, NPC
Hooks.on("renderActorDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  const label = "Actor ";
  footer.appendChild(
    createImportButton("Import " + label, () => {
      openImportDialog(label, async () => {
        const actorData = document.getElementById(DIALOG_ID + label).value;
        await importActor(actorData);
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
        logConsole(labelItem);
      });
    })
  );

  const labelSpell = "Spell ";
  footer.appendChild(
    createImportButton("Import " + labelSpell, () => {
      openImportDialog(labelSpell, () => {
        logConsole(labelSpell);
      });
    })
  );

  const labelClass = "Class ";
  footer.appendChild(
    createImportButton("Import " + labelClass, () => {
      openImportDialog(labelClass, () => {
        logConsole(labelClass);
      });
    })
  );

  const labelFeature = "Feature ";
  footer.appendChild(
    createImportButton("Import " + labelFeature, () => {
      openImportDialog(labelFeature, () => {
        logConsole(labelFeature);
      });
    })
  );
});

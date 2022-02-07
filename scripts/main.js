function openImportDialog(title, callback) {
  /**
   * HTMLElement.outerHTML does't work for input.value!
   * => because of this, a string representation is necessary
   */
  const content =
    `
       <div>
        <textarea id="sbi-input" wrap="hard" cols="1" placeholder="Usage:
          - Paste the full ` +
    title +
    `statblock text, formatted following the WotC formular, into this box.
          - If copy-paste errors occure, a fix inside this box may be done."></textarea>
       </div>
     `;

  let d = new Dialog({
    title: "Critical Import 5e - Import " + title,
    content,
    buttons: {
      done: {
        icon: '<i class="fas fa-file-download"></i>',
        label: "Import",
        callback: callback,
        // callback: () => {
        //   const u = document.getElementById(
        //     "dndbeyondSync-pc-sync-input"
        //   ).value;
        //   urls[u] = actorId;
        //   saveData(CHARACTER_URLS, urls);
        // },
      },
    },
    default: "close",
    render: (html) =>
      console.log("onRender - Register interactivity in the rendered dialog"),
    close: (html) => {
      console.log("closed Import " + title + " dialog");
    },
  });
  d.render(true);
}

function createImportButton(label, callback) {
  const icon = document.createElement("i");
  icon.classList = "fas fa-file-download";

  const btn = document.createElement("button");
  btn.classList = "dndbeyondSync-menu-btn";
  btn.innerText = label;
  btn.onclick = callback;
  btn.appendChild(icon);
  return btn;
}

Hooks.on("ready", () => {
  console.log("critical-import-5e | starting ...");
});

// monster, NPC
Hooks.on("renderActorDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  const label = "Actor ";
  footer.appendChild(
    createImportButton("Import " + label, () => {
      openImportDialog(label, () => {
        console.log(label);
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
        console.log(labelItem);
      });
    })
  );

  const labelSpell = "Spell ";
  footer.appendChild(
    createImportButton("Import " + labelSpell, () => {
      openImportDialog(labelSpell, () => {
        console.log(labelSpell);
      });
    })
  );

  const labelClass = "Class ";
  footer.appendChild(
    createImportButton("Import " + labelClass, () => {
      openImportDialog(labelClass, () => {
        console.log(labelClass);
      });
    })
  );

  const labelFeature = "Feature ";
  footer.appendChild(
    createImportButton("Import " + labelFeature, () => {
      openImportDialog(labelFeature, () => {
        console.log(labelFeature);
      });
    })
  );
});

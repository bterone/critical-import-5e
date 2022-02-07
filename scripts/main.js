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
  footer.appendChild(
    createImportButton("Import Actor ", () => {
      console.log("button actor clicked");
    })
  );
});

// item, spell, class, monster feature, racial feature
Hooks.on("renderItemDirectory", (args) => {
  const footer = args.element[0].getElementsByTagName("footer")[0];
  footer.appendChild(
    createImportButton("Import Item ", () => {
      console.log("button item clicked");
    })
  );

  footer.appendChild(
    createImportButton("Import Spell ", () => {
      console.log("button spell clicked");
    })
  );

  footer.appendChild(
    createImportButton("Import Class ", () => {
      console.log("button class clicked");
    })
  );

  footer.appendChild(
    createImportButton("Import Feature ", () => {
      console.log("button feature clicked");
    })
  );
});

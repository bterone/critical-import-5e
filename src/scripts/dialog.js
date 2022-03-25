import { logConsole } from "./log.js";

export function openImportDialog(title, callback) {
  /**
   * HTMLElement.outerHTML does't work for input.value!
   * => because of this, a string representation is necessary
   */
  const content =
    `
       <div>
        <textarea id="importDialog` +
    title +
    `" wrap="hard" cols="1" placeholder="Usage:
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
      },
    },
    default: "close",
    render: (html) =>
      logConsole("onRender - Register interactivity in the rendered dialog"),
    close: (html) => {
      logConsole("closed Import " + title + " dialog");
    },
  });
  d.render(true);
}

export function createImportButton(label, callback) {
  const icon = document.createElement("i");
  icon.classList = "fas fa-file-download";

  const btn = document.createElement("button");
  btn.classList = "dndbeyondSync-menu-btn";
  btn.innerText = label;
  btn.onclick = callback;
  btn.appendChild(icon);
  return btn;
}

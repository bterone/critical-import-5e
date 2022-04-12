import { Logger } from "./log.js";

const logger = new Logger("dialog.js");
logger.disable();

export async function openImportDialog(title, callback) {
  /**
   * HTMLElement.outerHTML does't work for input.value!
   * => because of this, a string representation is necessary
   */
  const content = `
    <div class="critical-import-container">
    <textarea
      id="critical-import-input-actor"
      class="critical-import-input"
      wrap="hard"
      cols="1"
      placeholder="Please paste your actor (formated in the WotC style) in here!"
    ></textarea>
  </div>  
     `;

  const options = {
    id: "critical-import-dialog-" + title,
    resizable: false,
    popup: true,
    title: "Critical Import 5e - Import " + title,
    classes: [],
  };

  let d = new Dialog(
    {
      content,
      buttons: {
        done: {
          classes: ["critical-import-btn"],
          icon: '<i class="fas fa-file-download"></i>',
          label: "Import",
          callback: async () => await callback(),
        },
      },
      render: (html) => {
        //
      },
    },
    options
  );
  d.render(true);
}

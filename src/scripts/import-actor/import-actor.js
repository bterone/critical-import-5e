import { Logger } from "../log.js";
import { gatherActorData } from "./gather-actor-data.js";
import { createActor } from "./create-actor.js";

const logger = new Logger("import-actor.js");
// logger.disable();

export async function importActor(importedActorData) {
  const actorData = gatherActorData(importedActorData);
  logger.logConsole("actorData", actorData);
  await createActor(actorData);
}

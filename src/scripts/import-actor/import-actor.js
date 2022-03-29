import { logConsole } from "../log.js";
import { gatherActorData } from "./gather-actor-data.js";
import { createActor } from "./create-actor.js";

export async function importActor(importedActorData) {
  const actorData = gatherActorData(importedActorData);
  logConsole("actorData", actorData);
  await createActor(actorData);
}

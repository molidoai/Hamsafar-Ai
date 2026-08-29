import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { checkUpdate, compareVersion, verifyManifestSignature, UpdateManifest } from "../src";

const paths = [
  join(process.cwd(), "infrastructure/updates/manifest.json"),
  join(process.cwd(), "../../infrastructure/updates/manifest.json"),
];
const file = paths.find((p) => existsSync(p));
if (!file) throw new Error("manifest missing");
const manifest = JSON.parse(readFileSync(file, "utf8")) as UpdateManifest;

if (compareVersion("0.2.0", "0.1.0") <= 0) throw new Error("compare failed");

const none = checkUpdate("0.1.0", manifest);
if (none.updateAvailable) throw new Error("same version must not update");
if (!verifyManifestSignature(manifest)) throw new Error("signature failed");

const next = checkUpdate("0.0.9", { ...manifest, latest: "0.1.0", minSupported: "0.1.0" });
if (!next.updateAvailable || !next.forceUpdate) throw new Error("force update failed");

console.log("UPDATE_TESTS_PASS");

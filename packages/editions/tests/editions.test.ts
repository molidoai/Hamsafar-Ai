import { canUse, getEdition } from "../src";

if (getEdition("personal").priceMonthlyIrr !== 0) throw new Error("personal price");
if (getEdition("family").priceMonthlyUsd !== 6) throw new Error("family price");
if (canUse("personal", "sos")) throw new Error("personal sos");
if (!canUse("family", "sos")) throw new Error("family sos");
if (!canUse("pro", "advancedAi")) throw new Error("pro ai");
console.log("EDITIONS_TESTS_PASS");

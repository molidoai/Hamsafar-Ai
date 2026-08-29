export interface Artifact {
  url: string;
  sha256: string;
  signed: boolean;
  required: boolean;
}

export interface UpdateManifest {
  app: string;
  latest: string;
  minSupported: string;
  current?: string;
  channel: "local" | "github";
  notes: string;
  releasedAt: string;
  signature: {
    algorithm: "SHA256-MANIFEST";
    keyId: string;
    value: string;
  };
  artifacts: {
    android?: Artifact;
    ios?: Artifact;
    web?: Artifact;
  };
}

export function parseVersion(v: string): number[] {
  return v.split(".").map((n) => Number(n) || 0);
}

export function compareVersion(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

export function checkUpdate(current: string, manifest: UpdateManifest) {
  const updateAvailable = compareVersion(manifest.latest, current) > 0;
  const forceUpdate = compareVersion(current, manifest.minSupported) < 0;
  return {
    current,
    latest: manifest.latest,
    updateAvailable,
    forceUpdate,
    notes: manifest.notes,
    channel: manifest.channel,
    signature: manifest.signature,
    artifacts: manifest.artifacts,
  };
}

export function verifyManifestSignature(manifest: UpdateManifest): boolean {
  if (!manifest.signature?.value || !manifest.signature.keyId) return false;
  if (manifest.signature.algorithm !== "SHA256-MANIFEST") return false;
  return manifest.signature.value.startsWith("sig_");
}

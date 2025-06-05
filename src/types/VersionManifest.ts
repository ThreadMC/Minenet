/**
 * Represents a Minecraft version entry in the version manifest.
 */
export type Version = {
  id: string;
  type: string;
  url: string;
  time: string;
  releaseTime: string;
  sha1?: string;
  complianceLevel?: number;
};

/**
 * The Minecraft version manifest, containing latest and all available versions.
 */
export type VersionManifest = {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: Version[];
};

/**
 * Detailed information about a specific Minecraft version.
 */
export type VersionDetails = {
  id: string;
  type: string;
  time: string;
  releaseTime: string;
  mainClass: string;
  arguments?: any;
  libraries: Array<any>;
  downloads: {
    client: { url: string; sha1: string; size: number };
    server: { url: string; sha1: string; size: number };
    [key: string]: any;
  };
  assetIndex?: any;
};

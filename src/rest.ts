import { PISTON, MOJANG_API } from "./constants.js";
import { VersionType } from "./enums/VersionType.js";
import type {
  Version,
  VersionManifest,
  VersionDetails,
} from "./types/VersionManifest.js";

/**
 * Low-level REST client for interacting with Mojang and piston-meta APIs.
 * Handles fetching version manifests, version details, assets, libraries, and user data.
 */
export class Rest {
  private VERSION_MANIFEST_DATA: VersionManifest | null = null;
  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.initialize();
  }

  private async initialize() {
    if (!this.VERSION_MANIFEST_DATA) {
      try {
        this.VERSION_MANIFEST_DATA = await this.fetchVersionManifest();
      } catch (error) {
        console.error("Error initializing version manifest data:", error);
        throw error;
      }
    }
  }

  async fetchVersion(version: string) {
    await this.initialized;
    const versionData = this.VERSION_MANIFEST_DATA?.versions?.find(
      (v: Version) => v.id === version,
    );
    if (!versionData) {
      throw new Error(`Version ${version} not found in manifest`);
    }

    const response = await fetch(versionData.url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async fetchVersions(type: VersionType) {
    await this.initialized;
    const versions = this.VERSION_MANIFEST_DATA?.versions?.filter(
      (v: Version) => v.type === type,
    );
    if (!versions || versions.length === 0) {
      throw new Error(`No versions found for type ${type}`);
    }
    return versions;
  }

  async fetchLatestVersion(type: VersionType) {
    await this.initialized;
    const versions = this.VERSION_MANIFEST_DATA?.versions?.filter(
      (v: Version) => v.type === type,
    );
    if (!versions || versions.length === 0) {
      throw new Error(`No versions found for type ${type}`);
    }

    const latestVersion = versions.reduce((latest, current) => {
      return new Date(latest.releaseTime) > new Date(current.releaseTime)
        ? latest
        : current;
    });

    return latestVersion;
  }

  /**
   * Fetch the Minecraft version manifest from piston-meta.
   * @returns The version manifest JSON.
   */
  async fetchVersionManifest() {
    const response = await fetch(PISTON.VERSION_MANIFEST);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Fetch the asset index for a specific version.
   * @param version The version ID.
   * @returns The asset index JSON.
   */
  async fetchAssetIndex(version: string) {
    const details = await this.fetchVersion(version);
    if (!details.assetIndex?.url)
      throw new Error("No asset index for version " + version);
    const response = await fetch(details.assetIndex.url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  /**
   * Download a Minecraft library JAR file as an ArrayBuffer.
   * @param libraryPath The path to the library.
   * @returns The library file as an ArrayBuffer.
   */
  async fetchLibrary(libraryPath: string) {
    const url = PISTON.LIBRARIES_BASE + libraryPath;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.arrayBuffer();
  }

  /**
   * Fetch a Mojang user profile by username.
   * @param username The Minecraft username.
   * @returns The user profile JSON.
   */
  async fetchUserProfile(username: string) {
    const response = await fetch(
      MOJANG_API.USER_PROFILE + encodeURIComponent(username),
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  /**
   * Fetch the name history for a given UUID.
   * @param uuid The user's UUID.
   * @returns The name history array.
   */
  async fetchNameHistory(uuid: string) {
    const url = MOJANG_API.NAME_HISTORY.replace(
      "{uuid}",
      uuid.replace(/-/g, ""),
    );
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  /**
   * Fetch the skin and/or cape textures for a user by UUID.
   * @param uuid The user's UUID (with or without dashes).
   * @returns The textures object containing skin/cape URLs, or null if not found.
   */
  async fetchUserTextures(uuid: string) {
    const url = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid.replace(
      /-/g,
      "",
    )}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const texturesProperty = data.properties?.find(
      (p: any) => p.name === "textures",
    );
    if (!texturesProperty) return null;
    const decoded = JSON.parse(atob(texturesProperty.value));
    return decoded.textures || null;
  }
}

/**
 * Fetch the Minecraft version manifest from piston-meta.
 * @returns The version manifest JSON.
 */
export async function fetchVersionManifest(): Promise<VersionManifest> {
  const response = await fetch(PISTON.VERSION_MANIFEST);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

/**
 * Fetch detailed information about a specific Minecraft version.
 * @param version The version ID.
 * @returns The version details JSON.
 */
export async function fetchVersionDetails(
  version: string,
): Promise<VersionDetails> {
  const manifest = await fetchVersionManifest();
  const versionData = manifest.versions.find((v) => v.id === version);
  if (!versionData) throw new Error(`Version ${version} not found`);
  const response = await fetch(versionData.url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

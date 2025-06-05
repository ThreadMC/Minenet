import { PISTON, MOJANG_API } from "./constants";
import { VersionType } from "./enums/VersionType";
import type {
  Version,
  VersionManifest,
  VersionDetails,
} from "./types/VersionManifest";

/**
 * Low-level REST client for interacting with Mojang and piston-meta APIs.
 * Handles fetching version manifests, version details, assets, libraries, and user data.
 */
export class Rest {
  private VERSION_MANIFEST_DATA: VersionManifest | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Rest client by fetching the version manifest if not already loaded.
   * @private
   */
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

  /**
   * Fetch details for a specific Minecraft version.
   * @param version The version ID.
   * @returns The version details JSON.
   */
  async fetchVersion(version: string) {
    try {
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
    } catch (error) {
      console.error(`Failed to fetch version ${version}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all versions of a given type (release or snapshot).
   * @param type The version type.
   * @returns Array of versions.
   */
  async fetchVersions(type: VersionType) {
    try {
      if (!this.VERSION_MANIFEST_DATA) {
        await this.fetchVersionManifest();
      }

      const versions = this.VERSION_MANIFEST_DATA?.versions?.filter(
        (v: Version) => v.type === type,
      );
      if (!versions || versions.length === 0) {
        throw new Error(`No versions found for type ${type}`);
      }
      return versions;
    } catch (error) {
      console.error(`Failed to fetch versions of type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Fetch the latest version of a given type.
   * @param type The version type.
   * @returns The latest version object.
   */
  async fetchLatestVersion(type: VersionType) {
    try {
      if (!this.VERSION_MANIFEST_DATA) {
        await this.fetchVersionManifest();
      }

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
    } catch (error) {
      console.error(`Failed to fetch latest version of type ${type}:`, error);
      throw error;
    }
  }

  /**
   * Fetch the Minecraft version manifest from piston-meta.
   * @returns The version manifest JSON.
   */
  async fetchVersionManifest() {
    try {
      const response = await fetch(PISTON.VERSION_MANIFEST);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch version manifest:", error);
      throw error;
    }
  }

  /**
   * Fetch the asset index for a specific version.
   * @param version The version ID.
   * @returns The asset index JSON.
   */
  async fetchAssetIndex(version: string) {
    try {
      const details = await this.fetchVersion(version);
      if (!details.assetIndex?.url)
        throw new Error("No asset index for version " + version);
      const response = await fetch(details.assetIndex.url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch asset index for ${version}:`, error);
      throw error;
    }
  }

  /**
   * Download a Minecraft library JAR file as an ArrayBuffer.
   * @param libraryPath The path to the library.
   * @returns The library file as an ArrayBuffer.
   */
  async fetchLibrary(libraryPath: string) {
    try {
      const url = PISTON.LIBRARIES_BASE + libraryPath;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.arrayBuffer();
    } catch (error) {
      console.error(`Failed to fetch library ${libraryPath}:`, error);
      throw error;
    }
  }

  /**
   * Fetch a Mojang user profile by username.
   * @param username The Minecraft username.
   * @returns The user profile JSON.
   */
  async fetchUserProfile(username: string) {
    try {
      const response = await fetch(
        MOJANG_API.USER_PROFILE + encodeURIComponent(username),
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch user profile for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Fetch the name history for a given UUID.
   * @param uuid The user's UUID.
   * @returns The name history array.
   */
  async fetchNameHistory(uuid: string) {
    try {
      const url = MOJANG_API.NAME_HISTORY.replace(
        "{uuid}",
        uuid.replace(/-/g, ""),
      );
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch name history for ${uuid}:`, error);
      throw error;
    }
  }

  /**
   * Fetch the current Mojang server status.
   * @returns The Mojang server status JSON.
   */
  async fetchMojangStatus() {
    try {
      const response = await fetch(MOJANG_API.SERVER_STATUS);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch Mojang server status:", error);
      throw error;
    }
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

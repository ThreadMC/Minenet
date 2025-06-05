import { Rest, fetchVersionManifest, fetchVersionDetails } from "./rest.js";
import { VersionType } from "./enums/VersionType.js";
import { Server } from "./server.js";
import type {
  Version,
  VersionManifest,
  VersionDetails,
} from "./types/VersionManifest.js";

/**
 * Main API client for interacting with Minecraft version data, Mojang APIs, and Minecraft servers.
 * Provides high-level methods for fetching version info, server status, user profiles, and more.
 */
export class Client {
  private rest: Rest;
  private server: Server;

  /**
   * Create a new Client instance.
   */
  constructor() {
    this.rest = new Rest();
    this.server = new Server();
  }

  /**
   * Fetch detailed information about a specific Minecraft version.
   * @param version The version ID (e.g., "1.20.4").
   * @returns The version details as returned by the manifest.
   */
  async fetchVersion(version: string) {
    return await this.rest.fetchVersion(version);
  }

  /**
   * Fetch all Minecraft versions of a given type (release or snapshot).
   * @param type The version type (VersionType.RELEASE or VersionType.SNAPSHOT).
   * @returns An array of versions matching the type.
   */
  async fetchVersions(type: VersionType) {
    return await this.rest.fetchVersions(type);
  }

  /**
   * Fetch the latest Minecraft version of a given type.
   * @param type The version type (VersionType.RELEASE or VersionType.SNAPSHOT).
   * @returns The latest version object.
   */
  async fetchLatestVersion(type: VersionType) {
    return await this.rest.fetchLatestVersion(type);
  }

  /**
   * Get the status of a Minecraft server using the server list ping protocol.
   * @param host The server hostname or IP.
   * @param port The server port (default 25565).
   * @returns The server status response.
   */
  async getServerStatus(host: string, port: number = 25565) {
    return await this.server.getStatus(host, port);
  }

  /**
   * Ping a Minecraft server and return the latency in milliseconds.
   * @param host The server hostname or IP.
   * @param port The server port (default 25565).
   * @returns The latency in ms.
   */
  async pingServer(host: string, port: number = 25565) {
    return await this.server.ping(host, port);
  }

  /**
   * Fetch the asset index for a specific Minecraft version.
   * @param version The version ID.
   * @returns The asset index JSON.
   */
  async fetchAssetIndex(version: string) {
    return await this.rest.fetchAssetIndex(version);
  }

  /**
   * Download a Minecraft library JAR file as an ArrayBuffer.
   * @param libraryPath The path to the library (e.g., "com/mojang/brigadier/1.0.18/brigadier-1.0.18.jar").
   * @returns The library file as an ArrayBuffer.
   */
  async fetchLibrary(libraryPath: string) {
    return await this.rest.fetchLibrary(libraryPath);
  }

  /**
   * Fetch a Mojang user profile by username.
   * @param username The Minecraft username.
   * @returns The user profile JSON.
   */
  async fetchUserProfile(username: string) {
    return await this.rest.fetchUserProfile(username);
  }

  /**
   * Fetch the name history for a given UUID.
   * @deprecated This endpoint has been removed on the 13th September 2022.
   * For more information, see: https://shorturl.at/31VrF
   * @param uuid The user's UUID (with or without dashes).
   * @returns The name history array.
   */
  async fetchNameHistory(uuid: string) {
    // return await this.rest.fetchNameHistory(uuid);
    return Promise.reject(
      new Error(
        "This endpoint has been removed on the 13th September 2022. For more information, see: https://shorturl.at/31VrF",
      ),
    );
  }

  /**
   * Fetch the skin and/or cape textures for a user by UUID.
   * @param uuid The user's UUID (with or without dashes).
   * @returns The textures object containing skin/cape URLs, or null if not found.
   */
  async fetchUserTextures(uuid: string) {
    return await this.rest.fetchUserTextures(uuid);
  }
}

export {
  VersionType,
  Version,
  VersionManifest,
  VersionDetails,
  fetchVersionManifest,
  fetchVersionDetails,
};

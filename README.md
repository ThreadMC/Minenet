# minecraft-api

[![npm version](https://img.shields.io/npm/v/@threadmc/minecraft-api.svg)](https://www.npmjs.com/package/@threadmc/minecraft-api)
[![license](https://img.shields.io/github/license/threadmc/minecraft-api)](LICENSE)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

**minecraft-api** is an advanced TypeScript/JavaScript client for interacting with Minecraft version data, Mojang APIs, piston-meta, and Minecraft servers. It provides high-level and low-level APIs for fetching version manifests, server status, user profiles, libraries, and more.

## Features

- Fetch Minecraft version manifests and details (release & snapshot)
- Query Minecraft server status, ping, and legacy ping
- Download Minecraft libraries and asset indexes
- Fetch Mojang user profiles and name history
- Retrieve Mojang server status
- Fully typed and written in TypeScript

## Installation

```sh
npm install @threadmc/minecraft-api
# or
yarn add @threadmc/minecraft-api
# or
pnpm add @threadmc/minecraft-api
# or
bun add @threadmc/minecraft-api
```

## Usage

```typescript
import { Client, VersionType } from "@threadmc/minecraft-api";

const client = new Client();

async function main() {
  // Fetch latest release version details
  const latestRelease = await client.fetchLatestVersion(VersionType.RELEASE);
  console.log("Latest Release:", latestRelease);

  // Fetch server status
  const status = await client.getServerStatus("mc.hypixel.net");
  console.log("Hypixel Status:", status);

  // Fetch Mojang user profile
  const profile = await client.fetchUserProfile("JonasCraftHD");
  console.log("User Profile:", profile);
}

main();
```

## API

### Client

- `fetchVersion(version: string)`
- `fetchVersions(type: VersionType)`
- `fetchLatestVersion(type: VersionType)`
- `getServerStatus(host: string, port?: number)`
- `pingServer(host: string, port?: number)`
- `fetchAssetIndex(version: string)`
- `fetchLibrary(libraryPath: string)`
- `fetchUserProfile(username: string)`
- `fetchNameHistory(uuid: string)`
- `fetchMojangStatus()`

### Types

- `Version`
- `VersionManifest`
- `VersionDetails`
- `VersionType` (`RELEASE` | `SNAPSHOT`)

## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/threadmc/minecraft-api).

### Development

- Clone the repository
- Run `npm install`
- Use `npm run build` to compile TypeScript
- Use `npm run format` to format code

### Code Style

This project uses [Prettier](https://prettier.io/) for code formatting.

## License

BSD 3-Clause License. See [LICENSE](LICENSE) for details.

import { Client, VersionType } from "@threadmc/minecraft-api";

const client = new Client();

async function main() {
  const version = await client.fetchVersion("1.21.5");
  const stableVersions = await client.fetchVersions(VersionType.RELEASE);

  const userProfile = await client.fetchUserProfile("JonasCraftHD");
  const uuid = userProfile.id;
  const userTextures = await client.fetchUserTextures(uuid);

  console.log("Version:", version);
  console.log("Stable Versions:", stableVersions);
  console.log("User Profile:", userProfile);
  console.log("UUID:", uuid);
  console.log("User Textures:", userTextures);
}

main();

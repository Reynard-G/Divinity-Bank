export default async function minecraftProfileFromUUID({ uuid }) {
  try {
    const mojangResponse = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
    );
    return mojangResponse.status === 200 ? await mojangResponse.json() : null;
  } catch (error) {
    return null;
  }
}

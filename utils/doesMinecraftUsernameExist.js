export default async function doesMinecraftUsernameExist(minecraftUsername) {
  try {
    const mojangResponse = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${minecraftUsername}`,
    );
    return mojangResponse.status === 200 ? await mojangResponse.json() : null;
  } catch (error) {
    return null;
  }
}

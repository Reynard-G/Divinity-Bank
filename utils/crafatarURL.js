/**
 * Generates a URL for a Crafatar avatar based on the provided UUID, size, and overlay option.
 *
 * @param {string} uuid - The UUID of the player.
 * @param {number} size - The size of the avatar in pixels.
 * @param {boolean} [overlay=true] - Whether to include the skin overlay.
 * @returns {string} The generated URL for the Crafatar avatar.
 */
export default function crafatarURL(uuid, size, overlay = true) {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay=${overlay}`;
}

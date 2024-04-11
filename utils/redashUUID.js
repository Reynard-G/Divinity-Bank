/**
 * Adds dashes to a UUID string.
 *
 * @param {string} uuid - The UUID string to convert.
 * @returns {string} The UUID string with dashes.
 */
export default function redashUUID(uuid) {
  return (
    uuid.substring(0, 8) +
    '-' +
    uuid.substring(8, 12) +
    '-' +
    uuid.substring(12, 16) +
    '-' +
    uuid.substring(16, 20) +
    '-' +
    uuid.substring(20)
  );
}

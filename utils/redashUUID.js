/**
 * Adds dashes to a UUID string.
 *
 * @param {string} uuid - The UUID string to convert.
 * @returns {string} The UUID string with dashes.
 */
export default function redashUUID(uuid) {
  return (
    uuid.substr(0, 8) +
    '-' +
    uuid.substr(8, 4) +
    '-' +
    uuid.substr(12, 4) +
    '-' +
    uuid.substr(16, 4) +
    '-' +
    uuid.substr(20)
  );
}

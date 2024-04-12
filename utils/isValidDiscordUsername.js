export default function isValidDiscordUsername(username) {
  // Trim the username to remove leading/trailing whitespace
  username = username.trim();

  // Check if the username is between 2 and 32 characters long
  if (username.length < 2 || username.length > 32) {
    return false;
  }

  // Check if the username contains only permitted characters
  const permittedCharacters = /^[a-z0-9_.]+$/;
  if (!permittedCharacters.test(username)) {
    return false;
  }

  // Check if the username has consecutive periods
  if (username.includes('..')) {
    return false;
  }

  // Convert the username to lowercase
  username = username.toLowerCase();

  // All requirements are met, so the username is valid
  return username;
}

/**
 * Checks if the given string represents a number with more than two decimal places.
 *
 * @param value - The string to be checked
 * @returns True if the string has more than two decimal places, false otherwise
 *
 * @example
 * isMoreThanTwoDecimalPlaces("12.345") // returns true
 * isMoreThanTwoDecimalPlaces("12.34")  // returns false
 * isMoreThanTwoDecimalPlaces("12")     // returns false
 */
export function isMoreThanTwoDecimalPlaces(value: string): boolean {
  const regex = /^\d+(\.\d{3,})$/;
  return regex.test(value);
}

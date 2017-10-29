// Atleast 1 number, 1 uppercase, 1 lowercase and atleast 8 characters long. Taken from https://stackoverflow.com/questions/14850553/javascript-regex-for-password-containing-at-least-8-characters-1-number-1-uppe
const strongPasswordRegex: RegExp = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)

export {
  strongPasswordRegex
}

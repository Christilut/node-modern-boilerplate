// Atleast 1 number, 1 uppercase, 1 lowercase, 1 special character and atleast 8 characters long. Taken from https://stackoverflow.com/questions/14850553/javascript-regex-for-password-containing-at-least-8-characters-1-number-1-uppe
export const strongPasswordRegex: RegExp = new RegExp(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{8,}$/)


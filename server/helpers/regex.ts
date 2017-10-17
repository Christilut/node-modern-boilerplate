const strongPasswordRegex: RegExp = new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&+=]).*$/)

export {
  strongPasswordRegex
}

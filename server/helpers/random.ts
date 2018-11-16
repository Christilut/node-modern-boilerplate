import * as Randomize from 'randomatic'

export function generateReadableNumber(length: number = 8) {
  return Randomize('A0', length, { exclude: '0oOiIlL1' })
}

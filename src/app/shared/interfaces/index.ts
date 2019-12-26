/**
 * Color set interface
 * @interface
 */
export interface ColorSet {
  foreground: string,
  background: string,
  blackorwhite: string
}


export interface TrackSettings {
  octave: number
  display: boolean,
  colors: ColorSet
}
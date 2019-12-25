import { Injectable } from '@angular/core';

// Color inversion
import invert, { RGB, RgbArray, HexColor, BlackWhite } from 'invert-color';
import { ColorSet } from '../../interfaces';


@Injectable({
  providedIn: 'root'
})
export class ColorsService {

  public Saturation: number = .75;
  public Lightness: number = 0.5;

  constructor() {
    this.convertHSLtoRGB = this.convertHSLtoRGB.bind(this);
    this.convertRGBtoHex = this.convertRGBtoHex.bind(this);
    this.GenerateColors = this.GenerateColors.bind(this);
    this.generateHSLValues = this.generateHSLValues.bind(this);
    this.Invert = this.Invert.bind(this);
  }

  private convertHSLtoRGB(h: number, s: number, l: number): number[] {
    // console.log(`Converting ${h},${s},${l}`)
    var r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      let hue2rgb = function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [ Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) ];
  }



  private convertRGBtoHex(r: number, g: number, b: number): string {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  /**
   * Generates a set of evenly spaced colors on a color wheel.
   * @param {number} amount - The number of colors to generate
   * @returns {string[]} Hex codes representing colors
   */
  public GenerateColors(amount: number): string[] {
    let hsl: number[] = this.generateHSLValues(amount);
    // console.log("HSL: ", hsl);
    let rgb: number[][] = hsl.map((val: number) => this.convertHSLtoRGB(val/360, this.Saturation, this.Lightness));
    // console.log("RGB: ", rgb);
    return rgb.map((val: number[]) => this.convertRGBtoHex(val[0], val[1], val[2]));
  }

  private generateHSLValues(num: number): number[] {
    let values: number[] = [];
    for (let i=0;i<num;++i) {
      values.push((i * (360 / num) % 360));
    }

    return values;
  }

  /**
   * Generates a set of evenly spaced colors, with inversions
   * @param {number} num - The number of colors to generate.
   * @returns {ColorSet}
   */
  public GenerateColorSets(num: number): ColorSet[] {
    return this.GenerateColors(num).map((color: string) => {
      return {
        background: color,
        foreground: this.Invert(color, true),
        blackorwhite: this.Invert(color, true)
      };
    });
  }

  /**
   * Inverts color
   * @param {string} color - The color to invert
   * @param {boolean} bw - Whether or not to return full black or full white
   * @returns {string}
   */ 
  public Invert(color: string, bw: boolean=false): string {
    return invert(color, bw);
  }


}

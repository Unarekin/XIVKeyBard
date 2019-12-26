import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import {
  faChevronUp,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'keybard-numerictextbox',
  templateUrl: './numerictextbox.component.html',
  styleUrls: ['./numerictextbox.component.scss']
})
export class NumericTextBoxComponent  implements OnInit {
  public Images: any = {
    up: faChevronUp,
    down: faChevronDown
  };

  @Input()
  public FormatFunc: (value: number) => string;

  @Output()
  public onValueChange: EventEmitter<number> = new EventEmitter<number>();

  private _value: number = 0;
  @Input()
  public get value(): number {
    return this._value;
  }

  public set value(value: number) {
    this._value = value;
    this.FormatValue(value);
  }

  public FormattedValue: string = "";

  constructor() {
    
  }

  ngOnInit() {
  }

  public ValueChange($event) {
    console.log("Value Change: ", $event);
    // this.value = value;
  }

  public FormatValue(value: number) {
    let formatted: string = value.toString();
    if (this.FormatFunc)
      formatted = this.FormatFunc(value);

    this.FormattedValue = formatted;
    this.onValueChange.emit(value);
  }

}

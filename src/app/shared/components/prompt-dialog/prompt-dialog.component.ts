import { Inject, Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.scss']
})
export class PromptDialogComponent implements OnInit {
  public Response: string = "";
  public Message: string = "";

  constructor(
    public dialogRef: MatDialogRef<PromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.onCancelClick = this.onCancelClick.bind(this);
    this.onOkClick = this.onOkClick.bind(this);

    this.Response = data.value;
    this.Message = data.message;
  }

  ngOnInit() {
  }


  public onCancelClick(): void {
    this.dialogRef.close({confirmed: false});
  }

  public onOkClick(): void {
    this.dialogRef.close({
      confirmed: true,
      response: this.Response
    });
  }



}


// import { Inject, Component, OnInit } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

// @Component({
//   selector: 'keybard-confirmation-dialog',
//   templateUrl: './confirmation-dialog.component.html',
//   styleUrls: ['./confirmation-dialog.component.scss']
// })
// export class ConfirmationDialogComponent implements OnInit {

//   constructor(
//     public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
//     @Inject(MAT_DIALOG_DATA) public Message: string
//   ) { }

//   ngOnInit() {
//   }

//   public onNoClick(): void {
//     this.dialogRef.close();
//   }

// }

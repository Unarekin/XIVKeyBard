import * as Phaser from 'phaser';

export class PianoRollScene extends Phaser.Scene {
  private info: Phaser.GameObjects.Text = null;
  // private gridLines: Phaser.Geom.Line[] = [];
  private verticalLines: Phaser.Geom.Line[] = [];
  private horizontalLines: Phaser.Geom.Line[] = [];
  private whiteKeyLabels: Phaser.GameObjects.Text[] = [];
  private blackKeyLabels: Phaser.GameObjects.Text[] = [];
  private blackKeyLabelOffsets: number[] = [0, 4, 0, -4, 0, 6, 0, 0, 4, 0, -4, 0, 6, 0, 0, 4, 0, -4, 0, 6, 0];

  private graphics;
  private whiteKeyCount: number = 22;


  private loadedSprites: any = {};

  private get WhiteKeyWidth(): number {
    return (this.game.scale.gameSize.width) / this.whiteKeyCount;
  }

  constructor() {
    super({key: 'main'});

    this.create = this.create.bind(this);
    this.preload = this.preload.bind(this);
    this.update = this.update.bind(this);
    this.resize = this.resize.bind(this);

    this.drawGrid = this.drawGrid.bind(this);
    this.createVerticalGridLines = this.createVerticalGridLines.bind(this);
    this.createHorizontalLines = this.createHorizontalLines.bind(this);
    this.updateKeyLabels = this.updateKeyLabels.bind(this);
    this.createKeyLabels = this.createKeyLabels.bind(this);
    this.createWhiteKeyLabels = this.createWhiteKeyLabels.bind(this);
    this.createBlackKeyLabels = this.createBlackKeyLabels.bind(this);
  }

  create() {
    
    // this.bgtile = this.add.tileSprite(0, 0, 1440, 900, 'bgtile');
    this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x3b3b3b}});
    
    
    
    this.createVerticalGridLines();
    // this.createHorizontalLines();

    this.loadedSprites['keys'] = this.add.sprite(0,0,'keys');
    this.loadedSprites['keys'].displayWidth = this.game.scale.gameSize.width;
    this.loadedSprites['keys'].displayHeight = 100;
    this.loadedSprites['keys'].x = this.game.scale.gameSize.width/2;
    this.loadedSprites['keys'].y = this.game.scale.gameSize.height - (this.loadedSprites['keys'].displayHeight/2);


    this.info = this.add.text(10, 10, '', { font: '12px Arial', fill: '#FFFFFF'});
    this.createKeyLabels();
    this.game.scale.on('resize', this.resize);

  }

  preload() {
    this.load.setBaseURL('');
    this.load.image('bgtile', 'assets/images/pianoGrid.png');
    this.load.image('keys', 'assets/images/PianoKeys.png');
  }

  update() {
    this.info.setText(
      'FPS: ' + this.game.loop.actualFps.toFixed(2) + '\n'
      //+ 'Size: ' + this.game.scale.gameSize.width + 'x' + this.game.scale.gameSize.height + '\n'
      //+ 'Step: ' + this.game.scale.gameSize.width / this.whiteKeyCount
    );
    // this.bgtile.tilePositionY -= 1;

    // console.log(this.game.scale.gameSize);

    // Draw lines!
    this.drawGrid();
  }

  private createKeyLabels() {
    this.createWhiteKeyLabels();
    this.createBlackKeyLabels();
  }

  private createBlackKeyLabels() {
    // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;
    let y: number = this.game.scale.gameSize.height - 100;

    let notes: string[] = ["C#", "E♭", "", "F#", "G#", "B♭", ""];
    let octaves: number[] = [3, 4, 5];

    let labelStyle: any = {
      fill: '#FFFFFF',
      font: '12px Arial',
      align: 'center'
    };

    octaves.forEach((octave: number, octaveIndex: number) => {
      notes.forEach((note: string, noteIndex: number) => {
        // if (note) {
          // let pitch: string = note + octave;
          let pitch: string = note;
          let x: number = (((octaveIndex * notes.length) + noteIndex) * this.WhiteKeyWidth) + this.WhiteKeyWidth;
          this.blackKeyLabels.push(this.add.text(x, y, pitch, labelStyle));
        // }
      });
    });
  }


  private createWhiteKeyLabels() {
    // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;
    let notes: string[] = ["C", "D", "E", "F", "G", "A", "B"];
    let octaves: number[] = [3, 4, 5];

    let y: number = this.game.scale.gameSize.height - 25;

    let labelStyle: any = {
      fill: '#000000',
      font: '12px Arial',
      align: 'center'
    };

    octaves.forEach((octave: number, octaveIndex: number) => {
      notes.forEach((note: string, noteIndex: number) => {
        // let pitch: string = note + octave;
        let pitch: string = note;
        let x: number = (((octaveIndex * notes.length) + noteIndex) * this.WhiteKeyWidth) + (this.WhiteKeyWidth/2);

        this.whiteKeyLabels.push(this.add.text(x, y, pitch, labelStyle));
      });
    });

    this.whiteKeyLabels.push(this.add.text(this.game.scale.gameSize.width - (this.WhiteKeyWidth/2), y, "C6", labelStyle));
  }

  private createVerticalGridLines() {
    // let keyStep: number = 800 / this.whiteKeyCount;
    // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;

    for (let i=1;i<this.whiteKeyCount;i++) {
      let x = this.WhiteKeyWidth * i;
      this.verticalLines.push(new Phaser.Geom.Line(x, 0, x, 900));
    }
  }

  private createHorizontalLines() {
    for (let i=1;i<10000;i++) {
      let y = this.game.scale.gameSize.height - (i * 100);
      this.horizontalLines.push(new Phaser.Geom.Line(0, y, this.game.scale.gameSize.width, y));
      // this.horizontalLines.push(new Phaser.Geom.Line(0, i * 100, this.game.scale.gameSize.width, i * 100));
    }
  }



  private drawGrid() {
    // Move existing lines down.
    // this.gridLines.forEach((line: Phaser.Geom.Line) => { line.})

    // let vertStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;


    this.graphics.clear();
    this.verticalLines.forEach((line: Phaser.Geom.Line, index: number) => {
      let step: number = this.WhiteKeyWidth * (index + 1);
      line.x1 = step;
      line.x2 = step;

      this.graphics.strokeLineShape(line);
    });

    // this.horizontalLines.forEach((line: Phaser.Geom.Line, index: number) => {
    //   line.y1 += 1;
    //   line.y2 += 1;

    //   this.graphics.strokeLineShape(line);
    // });
  }



  private resize(gameSize, baseSize, displaySize, resolution) {
    // let width = gameSize.width;
    // let height = gameSize.height;
    // // Resize cameras
    // this.cameras.resize(width, height);
    
    this.loadedSprites['keys'].x = this.game.scale.gameSize.width/2;
    this.loadedSprites['keys'].y = this.game.scale.gameSize.height - (this.loadedSprites['keys'].displayHeight/2);
    this.loadedSprites['keys'].displayWidth = this.game.scale.gameSize.width;



    this.updateKeyLabels(this.whiteKeyLabels, -25);
    this.updateKeyLabels(this.blackKeyLabels, -75, (this.WhiteKeyWidth / 2), this.blackKeyLabelOffsets);
  }

  private updateKeyLabels(labels: Phaser.GameObjects.Text[], yOffset: number = 0, xGlobalOffset: number = 0, xOctaveOffset: number[] = []) {

    // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;
    let y: number = this.game.scale.gameSize.height + yOffset;

    for (let i=0;i<labels.length;i++) {
      let text: Phaser.GameObjects.Text = labels[i];
      // let offset: number = (typeof xOffset == 'number' ? xOffset : xOffset[i]);
      let offset: number = xGlobalOffset;
      if (xOctaveOffset && xOctaveOffset.length && xOctaveOffset[i])
        offset += xOctaveOffset[i];

      text.setX(((i * this.WhiteKeyWidth) + (this.WhiteKeyWidth/2) - (text.width/2)) + offset);

      text.setY(y);
    }
  }

  
}
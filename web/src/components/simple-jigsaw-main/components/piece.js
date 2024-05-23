export default class Piece {
  constructor(args) {
    this.id = args.id;
    this.oriX = args.oriX;
    this.oriY = args.oriY;
    this.zindex = 0;
    this.coordinates = args.coordinates;

    // canvas draw params
    this.sx = args.sx;
    this.sy = args.sy;
    this.sWidth = args.sWidth;
    this.sHeight = args.sHeight;
    this.dx = args.dx;
    this.dy = args.dy;
    this.dWidth = args.dWidth;
    this.dHeight = args.dHeight;

    // mouse offset
    this.mouseOffsetX = null;
    this.mouseOffsetY = null;

    // cluster offset
    this.clusterOffsetX = 0;
    this.clusterOffsetY = 0;

    this.shape = args.shape;
  }

  draw(ctx, image, moving) {
    ctx.save();
    // trace the shape outline
    const hookLength = this.dWidth * 0.25; // 1/4 of each piece width
    const hookThickness = this.dWidth * 0.3; // 1/3 of each piece width

    ctx.beginPath();
    let pen = { x: this.dx, y: this.dy };
    ctx.moveTo(pen.x, pen.y);

    // top side
    this.#traceLine(ctx, pen, (this.dWidth - hookThickness) / 2, 0);
    if (this.shape[0] === 0) {
      this.#traceLine(ctx, pen, 0, -hookLength * this.shape[0]);
      this.#traceLine(ctx, pen, hookThickness, 0);
      this.#traceLine(ctx, pen, 0, hookLength * this.shape[0]);
    } else if (this.shape[0] === 1) {
      this.#traceArcTSideC(ctx, pen, hookThickness * 0.5);
    } else if (this.shape[0] === -1) {
      this.#traceArcTSideAC(ctx, pen, hookThickness * 0.5);
    }
    this.#traceLine(ctx, pen, (this.dWidth - hookThickness) / 2, 0);

    // right side
    this.#traceLine(ctx, pen, 0, (this.dHeight - hookThickness) / 2);

    if (this.shape[1] === 0) {
      this.#traceLine(ctx, pen, hookLength * this.shape[1], 0);
      this.#traceLine(ctx, pen, 0, hookThickness);
      this.#traceLine(ctx, pen, -hookLength * this.shape[1], 0);
    } else if (this.shape[1] === 1) {
      this.#traceArcRSideC(ctx, pen, hookThickness * 0.5);
    } else if (this.shape[1] === -1) {
      this.#traceArcRSideAC(ctx, pen, hookThickness * 0.5);
    }
    this.#traceLine(ctx, pen, 0, (this.dHeight - hookThickness) / 2);
    // this.#traceLine(ctx, pen, 0, this.dHeight / 2); // arc

    // bottom side
    this.#traceLine(ctx, pen, -(this.dWidth - hookThickness) / 2, 0);

    if (this.shape[2] === 0) {
      this.#traceLine(ctx, pen, 0, hookLength * this.shape[2]);
      this.#traceLine(ctx, pen, -hookThickness, 0);
      this.#traceLine(ctx, pen, 0, -hookLength * this.shape[2]);
    } else if (this.shape[2] === 1) {
      this.#traceArcBSideC(ctx, pen, hookThickness * 0.5);
    } else if (this.shape[2] === -1) {
      this.#traceArcBSideAC(ctx, pen, hookThickness * 0.5);
    }
    this.#traceLine(ctx, pen, -(this.dWidth - hookThickness) / 2, 0);

    // left side
    this.#traceLine(ctx, pen, 0, -(this.dHeight - hookThickness) / 2);

    if (this.shape[3] === 0) {
      this.#traceLine(ctx, pen, -hookLength * this.shape[3], 0);
      this.#traceLine(ctx, pen, 0, -hookThickness);
      this.#traceLine(ctx, pen, hookLength * this.shape[3], 0);
    } else if (this.shape[3] === -1) {
      this.#traceArcLSideC(ctx, pen, hookThickness * 0.5);
    } else if (this.shape[3] === 1) {
      this.#traceArcLSideAC(ctx, pen, hookThickness * 0.5);
    }
    this.#traceLine(ctx, pen, 0, -(this.dHeight - hookThickness) / 2);

    // draw the image in the outline
    ctx.clip();
    ctx.drawImage(
      image,
      this.sx - hookLength,
      this.sy - hookLength,
      this.sWidth + 2 * hookLength,
      this.sHeight + 2 * hookLength,
      this.dx - hookLength,
      this.dy - hookLength,
      this.dWidth + 2 * hookLength,
      this.dHeight + 2 * hookLength
    );

    // draw the outline
    ctx.closePath();
    moving ? (ctx.strokeStyle = "white") : (ctx.strokeStyle = "black");
    ctx.lineWidth = 5;

    ctx.stroke();
    ctx.restore();
  }

  #traceLine(ctx, pen, dx, dy) {
    pen.x += dx;
    pen.y += dy;
    ctx.lineTo(pen.x, pen.y);
  }

  #traceArcTSideC(ctx, pen, radius) {
    pen.x += radius;
    ctx.arc(pen.x, pen.y, radius, Math.PI, 0, false);
    pen.x += radius;
  }
  #traceArcTSideAC(ctx, pen, radius) {
    pen.x += radius;
    ctx.arc(pen.x, pen.y, radius, Math.PI, 0, true);
    pen.x += radius;
  }

  #traceArcRSideC(ctx, pen, radius) {
    pen.y += radius;
    ctx.arc(pen.x, pen.y, radius, (Math.PI * 3) / 2, Math.PI / 2, false);
    pen.y += radius;
  }
  #traceArcRSideAC(ctx, pen, radius) {
    pen.y += radius;
    ctx.arc(pen.x, pen.y, radius, (Math.PI * 3) / 2, Math.PI / 2, true);
    pen.y += radius;
  }

  #traceArcBSideC(ctx, pen, radius) {
    pen.x -= radius;
    ctx.arc(pen.x, pen.y, radius, 0, Math.PI, false);
    pen.x -= radius;
  }
  #traceArcBSideAC(ctx, pen, radius) {
    pen.x -= radius;
    ctx.arc(pen.x, pen.y, radius, 0, Math.PI, true);
    pen.x -= radius;
  }

  #traceArcLSideC(ctx, pen, radius) {
    pen.y -= radius;
    ctx.arc(pen.x, pen.y, radius, Math.PI / 2, (Math.PI * 3) / 2, true);
    pen.y -= radius;
  }
  #traceArcLSideAC(ctx, pen, radius) {
    pen.y -= radius;
    ctx.arc(pen.x, pen.y, radius, Math.PI / 2, (Math.PI * 3) / 2, false);
    pen.y -= radius;
  }

  bounds() {
    return {
      top: this.dy,
      bottom: this.dy + this.dHeight,
      left: this.dx,
      right: this.dx + this.dWidth,
    };
  }

  isClicked(mouseX, mouseY) {
    return (
      this.between(mouseX, this.bounds().left, this.bounds().right) &&
      this.between(mouseY, this.bounds().top, this.bounds().bottom)
    );
  }

  computeMouseOffset(mouseX, mouseY) {
    this.mouseOffsetX = mouseX - this.dx;
    this.mouseOffsetY = mouseY - this.dy;
  }

  isMatch(otherPiece) {
    const topMatch = this.matchFromTop(otherPiece);
    const bottomMatch = this.matchFromBottom(otherPiece);
    const leftMatch = this.matchFromLeft(otherPiece);
    const rightMatch = this.matchFromRight(otherPiece);
    return topMatch || bottomMatch || leftMatch || rightMatch;
  }

  matchFromTop(otherPiece) {
    return (
      this.coordinates.x === otherPiece.coordinates.x &&
      this.coordinates.y + 1 === otherPiece.coordinates.y &&
      this.near(this.dx, otherPiece.dx, 20) &&
      this.near(this.dy + this.dHeight, otherPiece.dy, 20)
    );
  }

  matchFromBottom(otherPiece) {
    return (
      this.coordinates.x === otherPiece.coordinates.x &&
      this.coordinates.y - 1 === otherPiece.coordinates.y &&
      this.near(this.dx, otherPiece.dx, 20) &&
      this.near(this.dy - this.dHeight, otherPiece.dy, 20)
    );
  }

  matchFromLeft(otherPiece) {
    return (
      this.coordinates.x + 1 === otherPiece.coordinates.x &&
      this.coordinates.y === otherPiece.coordinates.y &&
      this.near(this.dx + this.dWidth, otherPiece.dx, 20) &&
      this.near(this.dy, otherPiece.dy, 20)
    );
  }

  matchFromRight(otherPiece) {
    return (
      this.coordinates.x - 1 === otherPiece.coordinates.x &&
      this.coordinates.y === otherPiece.coordinates.y &&
      this.near(this.dx - this.dWidth, otherPiece.dx, 20) &&
      this.near(this.dy, otherPiece.dy, 20)
    );
  }

  between(x, min, max) {
    return x >= min && x <= max;
  }

  near(a, b, tolerance) {
    return Math.abs(a - b) <= tolerance;
  }
}

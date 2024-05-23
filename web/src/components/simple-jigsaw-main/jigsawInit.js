// puzzleUtils.js

import Puzzle from "./components/puzzle.js";

let activeCluster = null;
let nextZindex = 0;
let widthPieces = 4;
let heightPieces = 4;
let canvasWidth
export default function puzzleInit(image, canvas, canvasW, canvasH, puzzleComplete) {

  const ctx = canvas.getContext("2d");
  canvasWidth = canvasW;
  const canvasHeight = canvasH;
  
  // set up canvas
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.drawImage(image, 0, 0, canvasW, canvasH);

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let puzzle = null;

  puzzle = new Puzzle({
    image: image,
    widthPixels: image.width,
    heightPixels: image.height,
    widthPieces: widthPieces,
    heightPieces: heightPieces,
  });
  puzzle.initialize(canvas);
  clearCanvas(ctx);
  puzzle.draw(ctx, canvas);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);

  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", handleTouchEnd);

  function clearCanvas(ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function handleTouchStart(event){
    const mouseX = event.targetTouches[0].clientX - ctx.canvas.getBoundingClientRect().left;
    const mouseY = event.targetTouches[0].clientY - ctx.canvas.getBoundingClientRect().top;
    const selectedCluster = puzzle.getClickedCluster(mouseX, mouseY);
    if (selectedCluster) {
      selectedCluster.moving = true;
      activeCluster = selectedCluster;
      nextZindex++;
      activeCluster.zindex = nextZindex;
      drawBoard();
    }
  }

  function handleTouchMove(event){
    if (activeCluster) {
      const mouseX = event.targetTouches[0].clientX - ctx.canvas.getBoundingClientRect().left;
      const mouseY = event.targetTouches[0].clientY - ctx.canvas.getBoundingClientRect().top;
      activeCluster.position.x = mouseX - activeCluster.mouseOffsetX;
      activeCluster.position.y = mouseY - activeCluster.mouseOffsetY;
      activeCluster.rearrangePieces();
      drawBoard();
    }
  }

  function handleTouchEnd(event){
    if (activeCluster) {
      puzzle.clusters.forEach((otherCluster) => {
        if (otherCluster != activeCluster) {
          const matchFound = activeCluster.isMatch(otherCluster);
          if (matchFound) {
            puzzle.mergeClusters(activeCluster, otherCluster);
            if (activeCluster.pieces.length === widthPieces * heightPieces) {
              puzzle.finalArrangePieces(ctx, puzzle);
              puzzleComplete()
            }
          }
        }
      });
      activeCluster.moving = false;
      activeCluster = null;
    }
    drawBoard();
  }

  function handleMouseDown(event) {
    const mouseX = event.clientX - ctx.canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - ctx.canvas.getBoundingClientRect().top;
    const selectedCluster = puzzle.getClickedCluster(mouseX, mouseY);
    if (selectedCluster) {
      selectedCluster.moving = true;
      activeCluster = selectedCluster;
      nextZindex++;
      activeCluster.zindex = nextZindex;
      drawBoard();
    }
  }

  function handleMouseMove(event) {
    if (activeCluster) {
      const mouseX = event.clientX - ctx.canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - ctx.canvas.getBoundingClientRect().top;
      activeCluster.position.x = mouseX - activeCluster.mouseOffsetX;
      activeCluster.position.y = mouseY - activeCluster.mouseOffsetY;
      activeCluster.rearrangePieces();
      drawBoard();
    }
  }

  function handleMouseUp() {
    if (activeCluster) {
      puzzle.clusters.forEach((otherCluster) => {
        if (otherCluster != activeCluster) {
          const matchFound = activeCluster.isMatch(otherCluster);
          if (matchFound) {
            puzzle.mergeClusters(activeCluster, otherCluster);
            if (activeCluster.pieces.length === widthPieces * heightPieces) {
              puzzle.finalArrangePieces(ctx, puzzle);
              puzzleComplete()
            }
          }
        }
      });
      activeCluster.moving = false;
      activeCluster = null;
    }
    drawBoard();
  }

  function drawBoard() {
    clearCanvas(ctx);
    puzzle.draw(ctx);
  }


  function puzzleComplete() {
    const event = new CustomEvent('puzzleCompleteEvent', { detail: 'Puzzle is complete!', canvasWidth:canvasWidth });
    document.dispatchEvent(event);
  }
}

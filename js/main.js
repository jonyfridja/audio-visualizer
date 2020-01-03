'use strict';
let gFileEl = null;
let gAudioEl = null;
let gIsPlaying = false;
let gCanvasEl = null;
let gCtx = null;

let shouldLoad = true;
let gAudioContext = new (AudioContext || webkitAudioContext)();
let gAnalyser = gAudioContext.createAnalyser();
let gMediaSrc = null;

window.addEventListener('load', init, false);
function init() {
  gFileEl = document.getElementById('thefile');
  gAudioEl = document.getElementById('audio');
  gCanvasEl = document.getElementById('canvas');
  gCtx = gCanvasEl.getContext('2d');
  addEventListeners();
}

function addEventListeners() {
  gFileEl.addEventListener('change', fileOnChangeHandler);

  gAudioEl.addEventListener('pause', () => {
    gIsPlaying = false;
  });
  gAudioEl.addEventListener('play', () => {
    gIsPlaying = true;
    renderFrame();
  });
}

function fileOnChangeHandler(ev) {
  console.log('once')
  // load file
  var { files } = this;
  gAudioEl.src = URL.createObjectURL(files[0]);
  gAudioEl.load();
  if (shouldLoad) {
    gMediaSrc = gAudioContext.createMediaElementSource(gAudioEl);
    shouldLoad = false;
  }
  // gMediaSrc = gAudioContext.createMediaElementSource(gAudioEl);

  gMediaSrc.connect(gAnalyser);
  gAnalyser.connect(gAudioContext.destination);

  // resize canvas
  gCanvasEl.width = window.innerWidth;
  gCanvasEl.height = window.innerHeight;

  gAudioEl.play();
  gIsPlaying = true;
  renderFrame();
}

function getFreqData() {
  gAnalyser.fftSize = 512;
  const bufferLength = gAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  gAnalyser.getByteFrequencyData(dataArray);
  return dataArray;
}

function clearCanvas() {
  gCtx.clearRect(0, 0, gCanvasEl.width, gCanvasEl.height);
}

function renderFrame() {
  if (!gIsPlaying) return;
  requestAnimationFrame(renderFrame);
  const dataArray = getFreqData();
  
  const WIDTH = gCanvasEl.width;
  const HEIGHT = gCanvasEl.height / 2;
  const barWidth = WIDTH / dataArray.length;

  let x = 0;
  gCtx.fillStyle = '#000';
  clearCanvas();
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = dataArray[i];
    const minHeight = 10;
    var r = barHeight + 25 * (i / dataArray.length);
    var g = 250 * (i / dataArray.length);
    var b = 50;

    gCtx.fillStyle ='#000000';
    // gCtx.fillRect()
    gCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }
}

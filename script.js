


// --- SETUP CANVAS.

var isblank = true; // keep track of blank so suggestions don't show up when there's nothing
var drawing; // save the drawing at every step so it can be loaded when resizing

const canvas = document.getElementById("canvas")

let labelContainer = document.getElementById("label-container"); // to display ai's results

// get the position of the canvas
var bodyRect = document.body.getBoundingClientRect(),
    rect = canvas.getBoundingClientRect(),
    offset = rect.top - bodyRect.top;

canvas.height = canvas.offsetHeight;
canvas.width = canvas.offsetWidth;


// prepare mouse
let draw = false
let prevX = null
let prevY = null

// connect mouse/touch listeners
window.addEventListener("mousedown", (e) => draw = true );
window.addEventListener("mouseup", (e) => draw = false );
window.addEventListener("touchstart", (e) => {draw = true; ; prevX = null; prevY = null; }) // reset the previous values when just starting
window.addEventListener("touchend", (e) => {draw = false; prevX = null; prevY = null;})
window.addEventListener("mousemove", (e) => { if (mouseinarea(e)) {drawline(e); } });
window.addEventListener("touchmove", (e) => { if (touchinarea(e)) {drawline(e.touches[0]);} });


// set up canvas
const ctx = canvas.getContext("2d")
ctx.lineWidth = 5
ctx.strokeStyle = "#000"



// -- DRAW THE LINE!
function drawline(touchpos) {
  isblank = false

  // ensure that the size is correct
  bodyRect = document.body.getBoundingClientRect(),
  rect = canvas.getBoundingClientRect(),
  offset = rect.top - bodyRect.top;

  // no need to draw anything if it's the first point
  if(prevX == null || prevY == null || !draw){
      prevX = touchpos.clientX + window.pageXOffset - rect.left
      prevY = touchpos.clientY + window.pageYOffset - offset
      return
  }

  // update current position
  let currentX = touchpos.clientX + window.pageXOffset - rect.left
  let currentY = touchpos.clientY + window.pageYOffset- offset

  // draw the thing using a line!
  ctx.beginPath()
  ctx.moveTo(prevX, prevY)
  ctx.lineTo(currentX, currentY)
  ctx.stroke()

  // update "previous" position
  prevX = currentX
  prevY = currentY

  // update ai
  predict()

  // save drawing to be loaded on page resize
  drawing = canvas.toDataURL()

}



// --- OTHER CANVAS FUNCTIONS

// clears the canvas, updates suggestions
function clearcanvas(){
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  isblank = true
  predict()
  drawing = canvas.toDataURL() // save the cleared drawing too
}

// connect the 'clear' button
let clearBtn = document.querySelector(".clear")
clearBtn.addEventListener("click", clearcanvas)


// create a blank canvas
const blank = document.createElement('canvas');
blank.width = canvas.width;
blank.height = canvas.height;
blank.getContext('2d').fillStyle = "#fff"
blank.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);

// use the buffer blank canvas to test if the current canvas is blank
function isCanvasBlank() {
  return canvas.toDataURL() === blank.toDataURL();
}

// test whether mouse/touch is inside the canvas
function mouseinarea(e) {
  return e.clientX >= (window.pageXOffset + rect.left) && e.clientX <= (window.pageXOffset + rect.right) && e.clientY >= (window.pageYOffset + rect.top) && e.clientY <= (window.pageYOffset + rect.bottom);
}

// same as mouseinarea, but for touchscreens (it's a bit different)
function touchinarea(e) {
  return e.touches[0].clientX >= (rect.left) && e.touches[0].clientX <= (rect.right) && e.touches[0].clientY >= (rect.top) && e.touches[0].clientY <= ( rect.bottom)
}





// --- ON RESIZE

var reload_timeout;
// on resize, set a timeout to update the thing if there's no more resizing in .1s
window.addEventListener("resize", (event) => {
  clearTimeout(reload_timeout);
  reload_timeout = setTimeout(resizedw, 100);
}, true);

// restore the canvas after resizing
function resizedw(){
  // grab the pos and size
  bodyRect = document.body.getBoundingClientRect(),
      rect = canvas.getBoundingClientRect(),
      offset = rect.top - bodyRect.top;

  canvas.height = canvas.offsetHeight;
  canvas.width = canvas.offsetWidth;

  // make sure the canvas context is still the same
  ctx.lineWidth = 5
  ctx.strokeStyle = "#000"

  // restore the drawing if there is a previously saved one
  if (drawing == null) return;

  var image = new Image()
  image.src = drawing // load in the drawing
  image.onload = function(){ // load the drawing onto canvas once it's ready
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  }

}




// --- THE AI PART.

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/73FVn0D9A/";

let model, maxPredictions = 9; // set up values for ai
document.onload = init() // run the init on page load


// -- INITIATE MODEL
async function init() {
    clearcanvas() // prep the canvas on page start

    // load the model and metadata
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);

    labelContainer.innerHTML = "" // clear the label, get rid of the 'loading' text

    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    // on when done, check if canvas is blank
    isblank = isCanvasBlank();

    // run the first prediction!
    predict();
}


// -- UPDATE PREDICTIONS
async function predict() {

  // get the predictions!
  try {
    var prediction = await model.predictTopK( canvas );
  }
  catch(TypeError) {
    // this happens if the model is not done loading yet; just wait more!
    return;
  }

  // set the results to blank if there's no drawing
  if (isblank) {
    for (var i = 0; i < maxPredictions; i++) {
      labelContainer.childNodes[i].innerHTML = ""
    }
    return;
  }

  // prepare the results for each prediction
  for (let i = 0; i < maxPredictions; i++) {
      var thename = prediction[i].className

      // subtitle text (name: 0.00%)
      var classPrediction = thename + ": " + (prediction[i].probability * 100).toFixed(1) + "%";


      // add the symbol too
      labelContainer.childNodes[i].innerHTML = '<p class="tp">' + thename + '</p><p>' + classPrediction + '</p>'

      // special case for epiku2
      if (prediction[i].className == "epiku2") {
        labelContainer.childNodes[i].innerHTML = '<p class="tp epiku2">󱦃</p><p>' + classPrediction + '</p>'
      }
  }
}

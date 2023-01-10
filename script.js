


// DRAWING STUFF.

var empty = true

const canvas = document.getElementById("canvas")

let model, webcam, maxPredictions;

let labelContainer = document.getElementById("label-container");



var bodyRect = document.body.getBoundingClientRect(),
    rect = canvas.getBoundingClientRect(),
    offset = rect.top - bodyRect.top;

canvas.height = canvas.offsetHeight;
canvas.width = canvas.offsetWidth;

const ctx = canvas.getContext("2d")

let prevX = null
let prevY = null

ctx.lineWidth = 7
ctx.strokeStyle = "#000"

let draw = false

function clearcanvas(){
  setempty()
  ctx.fillStyle = "#fff"
  // ctx.beginPath()
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // ctx.stroke()
  // ctx.strokeStyle = "#000"
}

let clearBtn = document.querySelector(".clear")
clearBtn.addEventListener("click", clearcanvas)

function mouseinarea(e) {
  var value = e.clientX >= (window.pageXOffset + rect.left) && e.clientX <= (window.pageXOffset + rect.right) && e.clientY >= (window.pageYOffset + rect.top) && e.clientY <= (window.pageYOffset + rect.bottom)
  // console.log(value)

  return value

}


window.addEventListener("mousedown", (e) => {
  draw = true;
  if ( mouseinarea(e) ){ empty = false }

});

window.addEventListener("mouseup", (e) => {draw = false; })
window.addEventListener("touchstart", (e) => {draw = true; empty = false; prevX = null; prevY = null; })
window.addEventListener("touchend", (e) => {draw = false; prevX = null; prevY = null;})


window.addEventListener("mousemove", (e) => {
    if (!mouseinarea(e)){ return }

    bodyRect = document.body.getBoundingClientRect(),
    rect = canvas.getBoundingClientRect(),
    offset = rect.top - bodyRect.top;


    if(prevX == null || prevY == null || !draw){
        prevX = e.clientX + window.pageXOffset - rect.left
        prevY = e.clientY + window.pageYOffset - offset
        return
    }

    let currentX = e.clientX + window.pageXOffset - rect.left
    let currentY = e.clientY + window.pageYOffset- offset

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()

    prevX = currentX
    prevY = currentY

    predict()
})

addEventListener("resize", (event) => {
  bodyRect = document.body.getBoundingClientRect(),
      rect = canvas.getBoundingClientRect(),
      offset = rect.top - bodyRect.top;

  canvas.height = canvas.offsetHeight;
  canvas.width = canvas.offsetWidth;

  ctx.lineWidth = 10
  ctx.strokeStyle = "#000"
  clearcanvas();
});


window.addEventListener("touchmove", (e) => {
    // if (!mouseinarea(e)){ return }

    bodyRect = document.body.getBoundingClientRect(),
    rect = canvas.getBoundingClientRect(),
    offset = rect.top - bodyRect.top;


    if(prevX == null || prevY == null || !draw){
        prevX = e.touches[0].clientX + window.pageXOffset - rect.left
        prevY = e.touches[0].clientY + window.pageYOffset - offset
        return
    }

    let currentX = e.touches[0].clientX + window.pageXOffset - rect.left
    let currentY = e.touches[0].clientY + window.pageYOffset - offset

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()

    prevX = currentX
    prevY = currentY
})




// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel

const URL = "https://teachablemachine.withgoogle.com/models/73FVn0D9A/";


document.onload = init()

// Load the image model and setup the webcam
async function init() {
    clearcanvas()
    // console.log("init")
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)

    model = await tmImage.load(modelURL, metadataURL);
    // console.log(model.getTotalClasses());

    maxPredictions = 9 //model.getTotalClasses();

    // console.log(model)

    //
    // window.requestAnimationFrame(loop);


    labelContainer.innerHTML = ""
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
    // labelContainer.innerHTML = ""
    // // for (let i = 0; i < maxPredictions; i++) { // and class labels
    // //     labelContainer.appendChild(document.createElement("div"));
    // // }
}
//
// async function loop() {
//     // webcam.update(); // update the webcam frame
//     await predict();
//     window.requestAnimationFrame(loop);
// }

function convertCanvasToImage() {
  let canvas = document.getElementById("canvas");
  let image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

function setempty(){
  empty = true
  // console.log(labelContainer.childNodes)
  if (labelContainer.childNodes.length <= 1) return;

  for (var i = 0; i < 9; i++) {
    labelContainer.childNodes[i].innerHTML = ""
  }
}

async function predict() {

  var prediction = await model.predictTopK( canvas );

  if (empty) {
    for (var i = 0; i < maxPredictions; i++) {
      labelContainer.childNodes[i].innerHTML = ""
    }
  }

  for (let i = 0; i < maxPredictions; i++) {
      var classPrediction =
          prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(1) + "%";

      labelContainer.childNodes[i].innerHTML = '<p class="tp">' + prediction[i].className + '</p><p>' + classPrediction + '</p>'

  }



}

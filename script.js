


// DRAWING STUFF.


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

  return value

}


window.addEventListener("mousedown", (e) => draw = true );
window.addEventListener("mouseup", (e) => draw = false );
window.addEventListener("touchstart", (e) => {draw = true; ; prevX = null; prevY = null; })
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
    save()
})

var drawing;

function save(){
  console.log("save")
  drawing = canvas.toDataURL()
}

var doit;


function resizedw(){
  if (drawing != null) {
    var image = new Image()
    image.src = drawing
    image.onload = function(){
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    }
  }
}


window.addEventListener("resize", (event) => {
  console.log("A.")

  bodyRect = document.body.getBoundingClientRect(),
      rect = canvas.getBoundingClientRect(),
      offset = rect.top - bodyRect.top;

  canvas.height = canvas.offsetHeight;
  canvas.width = canvas.offsetWidth;

  ctx.lineWidth = 10
  ctx.strokeStyle = "#000"
  // clearcanvas();
  clearTimeout(doit);
  doit = setTimeout(resizedw, 100);

}, true);



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

    predict()

})




// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel

const URL = "https://teachablemachine.withgoogle.com/models/73FVn0D9A/";


document.onload = init()

// Load the image model and setup the webcam
async function init() {
    clearcanvas()
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)

    model = await tmImage.load(modelURL, metadataURL);

    maxPredictions = 9 //model.getTotalClasses();


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

    predict();
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


function isCanvasBlank() {
  return !canvas.getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height).data
    .some(channel => channel !== 0);
}

async function predict() {


  var prediction = await model.predictTopK( canvas );

  if (isCanvasBlank()) {
    for (var i = 0; i < maxPredictions; i++) {
      labelContainer.childNodes[i].innerHTML = ""
    }

    console.log("blank")
  }

  for (let i = 0; i < maxPredictions; i++) {
      var classPrediction =
          prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(1) + "%";

      labelContainer.childNodes[i].innerHTML = '<p class="tp">' + prediction[i].className + '</p><p>' + classPrediction + '</p>'

  }



}





//
//
// document.getElementById("toenglish").onclick = toenglish()
// document.getElementById("totp").onclick = totp()

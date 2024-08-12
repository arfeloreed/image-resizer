const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

// load the image
async function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError("Please select an image");
    return;
  }

  // get original dimensions of image file
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  // for output path
  const homedir = await window.os.homedir();
  const outputPathValue = await window.path.join(homedir, "Downloads");
  outputPath.innerText = outputPathValue;
}

// send image to main.js
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertError("Please upload an image.");
    return;
  }

  if (width === "" || height === "") {
    alertError("Please fill width or height inputs.");
    return;
  }

  // send to main
  ipc.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

// notify user when the resize is done
ipc.on("resize:done", () => {
  alertSuccess("Image successfully resized.");
});

// check if file is an image and its types
function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"];
  return file && acceptedImageTypes.includes(file["type"]);
}

// notifications config
function alertError(message) {
  Toastify({
    text: message,
    duration: 5000,
    close: false,
    gravity: "top",
    position: "center",
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  }).showToast();
}

function alertSuccess(message) {
  Toastify({
    text: message,
    duration: 5000,
    close: false,
    gravity: "top",
    position: "center",
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  }).showToast();
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);

// Get necessary elements from the DOM
const canvasMain = document.getElementById('canvasMain');
const ctxMain = canvasMain.getContext('2d');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const divtop = document.getElementById('overlay');
const errorMessage = document.getElementById('errordiv');

// Initialize variables
let img = new Image();
let zoom = 1;
let isDragging = false;
let startX, startY, initialX, initialY, scaledLeft, scaledTop, scaledWidth, scaledHeight;
let scaledLeftStart = 0;
let scaledTopStart = 0; 
let dxg = 0;
let dyg = 0; 
const scale = 4;

// Event listener for image input
document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();    
    reader.onload = function(e) {
        img.onload = function() {
            // Reset variables on image load
            scaledWidth = img.width;
            scaledHeight = img.height;
            scaledTop = 0;
            scaledLeft = 0;
            zoom = 1;
            cropImage2();
        }
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}); 

// Function to zoom in
function zoomIn() {
    dozoom(zoom * 1.005);
    document.getElementById('zoomer').value = zoom;
    cropImage2();
}

// Function to zoom out
function zoomOut() {
    dozoom(zoom/1.005);
    document.getElementById('zoomer').value = zoom;
    cropImage2();
}

// Function to apply zoom
function dozoom(newzoom) {
    factor = newzoom / zoom;
    zoom = newzoom;
    scaledTop = scaledTop * factor;
    scaledLeft = scaledLeft * factor;
    scaledWidth = zoom * img.width / scale;
    scaledHeight = zoom * img.height / scale;
}

function rangechange() {
    newzoom = document.getElementById('zoomer').value;
    dozoom(newzoom);
    cropImage();
}

function rangeMouseUp() {
    newzoom = document.getElementById('zoomer').value;
    dozoom(newzoom);
    cropImage2();
}

// Function to move image center
function moveCenter(dx, dy) {
    scaledLeft = scaledLeftStart + dx ;
    scaledTop = scaledTopStart + dy;
    cropImage();
}

// Event listeners for mouse actions
divtop.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = divtop.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    divtop.style.cursor = 'grabbing';
    scaledLeftStart = scaledLeft;
    scaledTopStart = scaledTop;
    cropImage();
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        moveCenter(dx,dy);
    }
});

document.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        divtop.style.cursor = 'grab';
        cropImage2();
        document.body.style.userSelect = '';
    }
});

// Function to crop image
function cropImage() {
    // Error handling
    if (img.src == '') {
        errorMessage.textContent = 'Image is not selected';
        showErrorMessage();
    } else {
        errorMessage.textContent = 'Image is not in the frame';
        hideErrorMessage();
    }

    // Crop image
    const cropX = -scaledLeft * scale;
    const cropY = -scaledTop * scale;
    let cropWidth = 1422;
    let cropHeight = 800;

    canvas.width = cropWidth;
    canvas.height = cropHeight;
    canvasMain.height = cropHeight/scale;
    canvasMain.width = cropWidth/scale;

    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxMain.fillStyle = "red";
    ctxMain.fillRect(0, 0, canvasMain.width, canvasMain.height);

    if (cropX + cropWidth/zoom > img.width || cropY + cropHeight/zoom > img.height || cropX < 0 || cropY < 0) {
        showErrorMessage();
    } else {
        hideErrorMessage();
    }

    ctx.drawImage(img, cropX, cropY, cropWidth/zoom, cropHeight/zoom, 0, 0, cropWidth, cropHeight);
    ctxMain.drawImage(img, cropX, cropY, cropWidth/zoom, cropHeight/zoom, 0, 0, cropWidth/scale, cropHeight/scale);
}

// Function to show error message
function showErrorMessage() {
    errorMessage.style.display = 'block';
}

// Function to hide error message
function hideErrorMessage() {
    errorMessage.style.display = 'none';
}

// Function to crop image and update main image
function cropImage2() {
    cropImage();
    const croppedImage = document.getElementById('mainimageid');
    croppedImage.src = canvas.toDataURL();
}

// Function to download image
function downloadImage() {
    const imageElement = document.getElementById('mainimageid');
    const imageURL = imageElement.src;
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'image.png';
    link.click();
}

// Initial crop
cropImage();

document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        event.preventDefault(); // Prevents page scrolling
        scaledLeftStart = scaledLeft;
        scaledTopStart = scaledTop;
        if (key === 'ArrowUp') {
            moveCenter(0, -1/scale);
        } else if (key === 'ArrowDown') {
            moveCenter(0, 1/scale);
        } else if (key === 'ArrowLeft') {
            moveCenter(-1/scale, 0);
        } else if (key === 'ArrowRight') {
            moveCenter(1/scale, 0);
        }
        cropImage2();
    } else if (key === 'q' || key === 'Q') {
        zoomIn();
    } else if (key === 'a' || key === 'A') {
        zoomOut();
    } else if (key === 'b' || key === 'B') {
        document.getElementById('imageInput').click();
    } else if (key === 'd' || key === 'D') {
        downloadImage();
    }
});

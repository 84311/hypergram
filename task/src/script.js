const canvas_el = document.getElementById("draw_area");
const file_input = document.getElementById("file-input");
const saveButton = document.getElementById("save-button")

const brightness = document.getElementById("brightness");
const contrast = document.getElementById("contrast");
const transparent = document.getElementById("transparent");

const original_data = [];

saveButton.addEventListener("click", () => {
    let image = canvas_el.toDataURL();
    let link = document.createElement("a");
    link.download = "image.png";
    link.href = image;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

function truncate(val) {
    return val < 0 ? 0 : val > 255 ? 255 : val;
}


file_input.addEventListener("change", (e) => {
    if (e.target.files) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            let image = new Image();
            image.src = e.target.result;
            image.onload = function (e) {
                canvas_el.width = image.width;
                canvas_el.height = image.height;
                let ctx = canvas_el.getContext('2d');
                ctx.drawImage(image, 0, 0);
                let imageData = ctx.getImageData(0, 0, canvas_el.width, canvas_el.height);
                for (let i = 0; i < imageData.data.length; i++) {
                    original_data[i] = imageData.data[i];
                }
            }
        }
    }
});

function process_image() {
    let ctx = canvas_el.getContext('2d');
    let imageData = ctx.getImageData(0, 0, canvas_el.width, canvas_el.height);
    let pixels = imageData.data;

    let contrast_value = parseInt(contrast.value);

    let factor = 259 * (255 + contrast_value) / (255 * (259 - contrast_value));
    let alpha_value = parseFloat(transparent.value);
    let brightness_value = parseInt(brightness.value);

    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = truncate(factor * (original_data[i] - 128) + 128 + brightness_value);
        pixels[i + 1] = truncate(factor * (original_data[i + 1] - 128) + 128 + brightness_value);
        pixels[i + 2] = truncate(factor * (original_data[i + 2] - 128) + 128 + brightness_value);
        pixels[i + 3] = original_data[i + 3] * alpha_value;
    }

    ctx.putImageData(imageData, 0, 0);
}

brightness.addEventListener("change", process_image);
contrast.addEventListener("change", process_image);
transparent.addEventListener("change", process_image);


const el = document.querySelector('.board');
if (el) {
  const image = new Image();
  image.src = "/target.png";
  image.classList.add('image');

  image.style.left = '100px';
  image.style.top = '100px';

  image.onload = () => {
    console.log("Image loaded successfully!");
  };
  image.onerror = () => {
    console.error("Failed to load the image.");
  };

  el.appendChild(image);

  debugger;
}



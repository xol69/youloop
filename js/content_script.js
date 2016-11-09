const TITLE_OFF = 'Loop Video';
const TITLE_ON = 'Stop Looping';
const COLOR_OFF = '#fff';
const COLOR_ON = '#f12b24';
const DEGREE_OFF = 0;
const DEGREE_ON = 90;
let rotated = false;

// Function to create svg for button
function getSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', COLOR_OFF);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z');
  svg.appendChild(path);
  return svg;
}

// Add a button for toggling loop to the page
function addToggleControls() {
  const controls = document.querySelector('div.ytp-left-controls');
  if (!controls) return false;
  const newButton = document.createElement('a');
  newButton.className = 'ytp-button youloop-button';
  newButton.title = TITLE_OFF;
  newButton.addEventListener('click', () => toggleLoopState());
  newButton.appendChild(getSVG());
  controls.appendChild(newButton);
  return true;
}

// Change loop state and start video again if ended
function toggleLoopState() {
  const video = document.querySelector('video');

  if (video.ended && !video.loop)
    video.play();
  video.loop = !video.loop;
  rotated = !rotated;

  const color = video.loop ? COLOR_ON : COLOR_OFF;
  const title = video.loop ? TITLE_ON : TITLE_OFF;
  const degree = video.loop ? DEGREE_ON : DEGREE_OFF;
  updateToggleControls(color, title, degree);
}

// Update title and color of loop controls
function updateToggleControls(newColor, newTitle, newDegree) {
  const svg = document.querySelector('.youloop-button svg');
  svg.style.fill = newColor;
  svg.style.transform = `rotate(${newDegree}deg)`;
  document.querySelector('.youloop-button').setAttribute('title', newTitle);
  const checkbox = document.querySelector('[role=menuitemcheckbox]');
  if (checkbox !== null)
    checkbox.setAttribute('aria-checked', rotated);
}

// Add observer to video element to check if source was changed
// This happens when changing to another video in a playlist
function addObserver() {
  const video = document.querySelector('video');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'src' ||
        (mutation.attributeName === 'loop' && video.getAttribute('loop') === null && rotated === true)) {
        rotated = false;
        updateToggleControls(COLOR_OFF, TITLE_OFF, DEGREE_OFF);
        document.querySelector('[role=menuitemcheckbox]').setAttribute('aria-checked', rotated);
      } else if (mutation.attributeName === 'loop' && video.getAttribute('loop') !== null && rotated === false) {
        rotated = true;
        updateToggleControls(COLOR_ON, TITLE_ON, DEGREE_ON);
        document.querySelector('[role=menuitemcheckbox]').setAttribute('aria-checked', rotated);
      }
    });
  });
  observer.observe(video, { attributes: true });
}

function addContextMenuListener() {
  const video = document.querySelector('video');
  video.addEventListener('contextmenu', () => {
    let checkbox = null;
    const interval = setInterval(() => {
      checkbox = document.querySelector('[role=menuitemcheckbox]');
      if (checkbox !== null) {
        const oldElement = checkbox;
        const newElement = oldElement.cloneNode(true);
        newElement.setAttribute('aria-checked', rotated);
        newElement.addEventListener('click', () => {
          toggleLoopState();
          setTimeout(() => {
            document.querySelector('.ytp-contextmenu').style.display = 'none';
          }, 100);
        });
        oldElement.parentNode.replaceChild(newElement, oldElement);
        clearInterval(interval);
      }
    }, 50);
  });
}

// Init this whole thing!
function init() {
  const checkForVideo = setInterval(() => {
    if (addToggleControls()) {
      addObserver();
      addContextMenuListener();
      clearInterval(checkForVideo);
    }
  }, 500);
}

init();
console.log('Enjoy the awesome music!');

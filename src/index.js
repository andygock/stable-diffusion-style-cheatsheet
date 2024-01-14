// manage mouseover and mouseout events for multiple elements
// add one at a time, remove all at once with clear()
class MouseHoverManager {
  constructor() {
    this.elements = [];
  }

  add(element, mouseover, mouseout) {
    this.elements.push({ element, mouseover, mouseout });
    element.addEventListener("mouseover", mouseover);
    element.addEventListener("mouseout", mouseout);
  }

  clear() {
    this.elements.forEach(({ element, mouseover, mouseout }) => {
      element.removeEventListener("mouseover", mouseover);
      element.removeEventListener("mouseout", mouseout);
    });
    this.elements = [];
  }
}

// manage click events for multiple elements
// add one at a time, remove all at once with clear()
class MouseClickManager {
  constructor() {
    this.elements = [];
  }

  add(element, click) {
    this.elements.push({ element, click });
    element.addEventListener("click", click);
  }

  clear() {
    this.elements.forEach(({ element, click }) => {
      element.removeEventListener("click", click);
    });
    this.elements = [];
  }
}

function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.style.display = "none";
    if (history.state && history.state.modalOpen) {
      // console.log("model is open, do history.back()");
      // history.back();
    }
  }
}

function openModal() {
  const modal = document.querySelector(".modal");
  if (modal) {
    modal.style.display = "block";
    history.pushState({ modalOpen: true }, null);
    // console.log("openModal, pushState", history.state);
  }
}

function isModalOpen() {
  const modal = document.querySelector(".modal");
  if (modal) {
    return modal.style.display === "block";
  }
  return false;
}

// iife
(function () {
  // global vars
  let styleFile = "female.json";
  let imageDir = "./images";

  // get basename of style file
  let styleFileName = styleFile.split(".")[0];

  function handleRouteChange(e) {
    // the hash could be e.g #/female, #/male
    // load a different json e.g female.json, male.json
    const hash = window.location.hash;

    if (hash) {
      const styleFileFromHash = hash.replace("#/", "") + ".json";
      const styleFileNameFromHash = styleFileFromHash.split(".")[0];
      loadStyle(styleFileNameFromHash);
    }
  }

  // hash router handlers
  window.addEventListener("load", handleRouteChange);
  window.addEventListener("hashchange", handleRouteChange);

  // create these hover and click managers, we need these to clean up event listeners
  // when loading a new style
  const hoverManager = new MouseHoverManager();
  const clickManager = new MouseClickManager();

  async function loadStyle(name) {
    try {
      // load the styles into variable
      const response = await fetch(`./data/${name}.json`);
      const styles = await response.json();

      // get style container #grid
      const grid = document.querySelector("#grid");

      // clear current grid contents
      hoverManager.clear();
      clickManager.clear();
      grid.innerHTML = "";

      // create element for each style phrase
      styles.forEach((style) => {
        const baseImageSrc = `${imageDir}/${name}/${style}.1.webp`;

        // create grid item element, one for each style
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");

        //
        // create main image
        //
        const img = document.createElement("img");
        img.src = baseImageSrc;
        img.alt = style;
        img.width = 256;
        img.height = 256;
        img.loading = "lazy";
        gridItem.appendChild(img);

        //
        // create overlay with dot markers for viewing other images
        //
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        for (let i = 2; i <= 4; i++) {
          const dot = document.createElement("span");
          dot.classList.add("dot");
          dot.dataset.image = `${imageDir}/${name}/${style}.${i}.webp`;

          // put the number inside the dot
          const number = document.createElement("span");
          number.classList.add("number");
          number.innerHTML = "<span>" + i + "</span>";
          dot.appendChild(number);

          // change image src when mouseover dot to display alternative image
          hoverManager.add(
            dot,
            function () {
              img.src = this.dataset.image;
            },
            function () {
              img.src = baseImageSrc;
            }
          );

          // append to overlay
          overlay.appendChild(dot);
        }

        // when mouseover this, show overlay dots inside this div, otherwise hide the dots
        hoverManager.add(
          gridItem,
          function () {
            this.querySelector(".overlay").classList.add("show");
          },
          function () {
            this.querySelector(".overlay").classList.remove("show");
          }
        );

        gridItem.appendChild(overlay);

        //
        // add clickable caption
        //
        const caption = document.createElement("div");
        caption.classList.add("caption");
        caption.textContent = style;

        // show tooltip to user that they can click to copy the prompt to clipboard
        caption.classList.add("copyable");
        caption.dataset.title = "Click to copy prompt to clipboard";

        // add event listener to copy caption text to clipboard when clicked
        clickManager.add(caption, function () {
          navigator.clipboard.writeText(this.textContent).then(
            function () {
              console.log("Copying to clipboard was successful!");
            },
            function (err) {
              console.error("Could not copy text: ", err);
            }
          );
        });

        gridItem.appendChild(caption);

        //
        // modal click handler
        //
        clickManager.add(gridItem, function (e) {
          // don't open modal if user clicked on a dot, or clicked on the caption
          if (e.target.classList.contains("dot")) return;
          if (e.target.classList.contains("caption")) return;

          const modalContent = document.querySelector(".modal-content");
          modalContent.innerHTML = "";
          for (let i = 1; i <= 4; i++) {
            const img = document.createElement("img");
            img.src = `${imageDir}/${name}/${style}.${i}.webp`;
            modalContent.appendChild(img);
          }

          openModal();
        });

        grid.appendChild(gridItem);
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // wait for DOM load
  document.addEventListener("DOMContentLoaded", async function () {
    loadStyle(styleFileName);

    //
    // Modal handling
    //

    // modal element covers the entire viewport with modal-content on top of it
    // when user clicks outside content, they are always clicking on .modal
    const modal = document.querySelector(".modal");
    modal.addEventListener("click", function (e) {
      closeModal();
    });

    // Close the modal when the Escape key is pressed
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeModal();
      }
    });

    // TODO: check again, seems not 100% reliable
    window.addEventListener("popstate", function (event) {
      // console.log("popstate", event.state);
      modal.style.display = "none";

      if (event.state && event.state.modalOpen) {
        closeModal();
      }
    });
  });
})();
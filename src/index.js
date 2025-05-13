// wait for DOM to load, then run script as IIFE
document.addEventListener("DOMContentLoaded", async function () {
  (async function () {
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

    //
    // script starts here
    ///

    // global vars
    let imageDir = "./images";
    let defaultStyleName = "female";
    let imageIndex = 1; // can be 1 to 4
    const idsAvailable = ["#about", "#grid", "#missing"];

    // create these hover and click managers, we need these to clean up event listeners
    // when loading a new style
    const hoverManager = new MouseHoverManager();
    const clickManager = new MouseClickManager();

    // initialise lazy loader
    const lazyLoadInstance = new LazyLoad({});

    initModal();

    await useCustom();

    // route on first page load
    handleRouteChange();

    // route on hash change
    window.addEventListener("hashchange", handleRouteChange);

    initSearchBar();

    initIndexButtons();

    //
    // scripts ends, everything below here are function definitions
    //

    function initIndexButtons() {
      // clicking on either button changes imageIndex
      // get the number from .innerText

      // get the buttons #index > button
      const buttons = document.querySelectorAll("#index > button");

      // add click handler to each
      buttons.forEach((button) => {
        button.addEventListener("click", function (e) {
          // get the number from .innerText
          const number = parseInt(this.innerText);

          // set imageIndex
          imageIndex = number;

          // update the buttons
          buttons.forEach((button) => {
            button.classList.remove("active");
          });

          // set current button to active, since we clicked on it
          this.classList.add("active");

          // reload the current style
          const hash = window.location.hash;
          if (hash) {
            const styleFileNameFromHash = hash.replace("#/", "");
            loadStyle(styleFileNameFromHash);
          }
        });
      });

      // make current active button, that of the current imageIndex
      const currentButton = document.querySelector(
        `#index > button:nth-child(${imageIndex})`
      );
      currentButton.classList.add("active");
    }

    function hostedOnGithub() {
      // detect if we are hosted on github.io, normally username.github.io/repo/*
      // return true if we are

      // get the hostname, e.g username.github.io
      const hostname = window.location.hostname;

      // split the hostname by ., e.g ["username", "github", "io"]
      const hostnameParts = hostname.split(".");

      // if the hostname has 3 parts, and the last 2 parts are github and io, then we are hosted on github
      if (
        hostnameParts.length === 3 &&
        hostnameParts[1] === "github" &&
        hostnameParts[2] === "io"
      ) {
        return true;
      }

      // not hosted on github
      return false;
    }

    // use custom images, not publicly hosted
    async function useCustom() {
      // fetch /custom.json and look for property "useCustom"
      try {
        const response = await fetch("/custom.json");

        // check if response is 404
        if (!response.ok) {
          throw new Error("404");
        }

        const custom = await response.json();

        if (custom.useCustom) {
          // we have some custom images

          // array of custom names
          const items = custom.items;

          // add the names to the menu
          const menu = document.querySelector("#menu");

          items.forEach((item) => {
            const link = document.createElement("a");
            link.href = `#/custom-${item}`;
            link.textContent =
              item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
            menu.appendChild(link);
          });

          // find any menu items a.special and move them to the end of the menu, keep same order for these
          const special = document.querySelector(".special");
          if (special) {
            menu.appendChild(special);
          }
        } else {
          // we have custom.json, but we don't want to render custom images
        }
      } catch (error) {
        // if no custom.json, it will come here, do nothing
      }
    }

    async function copyToClipboard(element) {
      try {
        await navigator.clipboard.writeText(element.textContent);
        element.dataset.title = "Copied to clipboard!";

        // revert back to original title after 1 second
        setTimeout(() => {
          element.dataset.title = "Click to copy style to clipboard";
        }, 1000);
      } catch (err) {
        console.error("Could not copy text: ", err);
      }
    }

    function closeModal() {
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.style.display = "none";
      }
    }

    function openModal() {
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.style.display = "block";
        history.pushState({ modalOpen: true }, null);
      }
    }

    function hide(selector) {
      const element = document.querySelector(selector);
      element.classList.add("hidden");
    }

    function showOnly(selector) {
      const element = document.querySelector(selector);
      element.classList.remove("hidden");

      // hide all the other ids
      idsAvailable.forEach((id) => {
        if (id !== selector) {
          hide(id);
        }
      });
    }

    function updateMenuActive() {
      // update menu anchor links, so current routed hash entry is active
      // add/remove .active class as needed
      const menu = document.querySelector("#menu");
      const links = menu.querySelectorAll("a");

      // check whether the current hash is same as menu item's text
      links.forEach((link) => {
        if (link.hash === window.location.hash) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }

    function handleRouteChange(e) {
      // the hash could be e.g #/female, #/male
      // load a different json e.g female.json, male.json
      const hash = window.location.hash;

      if (hash) {
        const styleFileFromHash = hash.replace("#/", "") + ".json";
        const styleFileNameFromHash = styleFileFromHash.split(".")[0];
        console.log(hash, `Loading style: ${styleFileNameFromHash}`);

        // some special cases do not load grid, e.g #/about
        if (styleFileNameFromHash === "about") {
          showOnly("#about");
          updateMenuActive();
          return;
        } else {
          showOnly("#grid");

          // load the style
          loadStyle(styleFileNameFromHash);
          updateMenuActive();
        }
      } else {
        // no hash, load default style - redirect to hash, e.g history.push
        window.location.hash = `/${defaultStyleName}`;

        updateMenuActive();
      }
    }

    function filterGrid(text) {
      // filter grid images based on text, case-insensitive
      const query = text.toLowerCase();
      const gridItems = document.querySelectorAll(".grid-item");

      gridItems.forEach((gridItem) => {
        const caption = gridItem.querySelector(".caption");
        const captionText = caption.textContent.toLowerCase();
        if (captionText.includes(query)) {
          gridItem.classList.remove("hidden");
        } else {
          gridItem.classList.add("hidden");
        }
      });
    }

    function initSearchBar() {
      // handle search input input#search-input
      const searchInput = document.querySelector("#search-input");

      // when typing in input, filter the grid via the caption text
      searchInput.addEventListener("input", function (e) {
        // hide the clear button when input is empty, add and remove .hidden class
        const searchClear = document.querySelector("#search-clear");
        if (e.target.value.length === 0) {
          searchClear.classList.add("hidden");
        } else {
          searchClear.classList.remove("hidden");
        }

        // filter the grid, show only grid items that contain the search query, case-insensitive
        filterGrid(e.target.value);
      });

      // clicking button#search-clear will clear the search input
      const searchClear = document.querySelector("#search-clear");
      searchClear.addEventListener("click", function (e) {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
      });
    }

    function modalSingleGrid() {
      // when modal is open, show only 1x1 grid - used to display single large image
      const modalContentGrid = document.querySelector(".modal-content-grid");
      modalContentGrid.classList.add("single");
    }

    function modalMultiGrid() {
      // when modal is open, show only 2x2 grid of smaller images
      const modalContentGrid = document.querySelector(".modal-content-grid");
      modalContentGrid.classList.remove("single");
    }

    function getLargeImageSrc_OLD(src) {
      // get the base name of src, and append "768/" to it
      // e.g "images/female/name.2.webp" => "images/female/768/name.2.webp"
      const parts = src.split("/");
      const baseName = parts[parts.length - 1];

      // append "768/" to baseName
      const largeImageSrc = parts
        .slice(0, parts.length - 1)
        .concat(["768", baseName])
        .join("/");

      return largeImageSrc;
    }

    function getLargeImageSrc(src) {
      // e.g "images/female/256/name.2.webp" => "images/female/768/name.2.webp"
      const parts = src.split("/");

      // replace the 2nd last part with "768", but check it original part is "256", otherwise there could be an error
      const secondLastPart = parts[parts.length - 2];

      if (secondLastPart === "256") {
        parts[parts.length - 2] = "768";
        return parts.join("/");
      } else {
        throw new Error("Original source image is incorrect (not 256px)");
      }
    }

    function initModal() {
      //
      // Modal handling, add click and key handlers to handle opening and closing modal
      //

      // modal element covers the entire viewport with modal-content-grid on top of it
      // when user clicks outside content, they are always clicking on .modal
      const modal = document.querySelector(".modal");
      modal.addEventListener("click", function (e) {
        // don't continue if user clicked on modal-content or its inside elements
        if (
          e.target.classList.contains("modal-content-grid") ||
          e.target.classList.contains("prompt") ||
          e.target.tagName === "IMG"
        ) {
          return;
        }

        closeModal();
      });

      // Close the modal when the Escape key is pressed
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeModal();
        }
      });

      window.addEventListener("popstate", function (event) {
        modal.style.display = "none";
        if (event.state && event.state.modalOpen) {
          closeModal();
        }
      });
    }

    //
    // script starts here
    //

    async function loadStyle(name) {
      try {
        // load the styles into variable
        const response = await fetch(`./data/${name}.json`);

        // check if response is 404
        if (!response.ok) {
          throw new Error("404");
        }

        const styles = await response.json();

        // get style container #grid
        const grid = document.querySelector("#grid");

        // clear current grid contents
        hoverManager.clear();
        clickManager.clear();
        grid.innerHTML = "";

        // create element for each style phrase
        styles.forEach((style) => {
          const baseImageSrc = `${imageDir}/${name}/256/${style}.${imageIndex}.webp`;

          // create grid item element, one for each style
          const gridItem = document.createElement("div");
          gridItem.classList.add("grid-item");

          //
          // create main image
          //
          const img = document.createElement("img");
          // img.src = baseImageSrc;
          img.src = "./images/spinner.svg";
          img.dataset.src = baseImageSrc;
          img.alt = style;
          img.width = 256;
          img.height = 256;
          img.loading = "lazy";
          img.classList.add("lazy");
          gridItem.appendChild(img);

          //
          // create overlay with dot markers for viewing other images
          //
          const overlay = document.createElement("div");
          overlay.classList.add("overlay");

          for (let i = 1; i <= 4; i++) {
            const dot = document.createElement("span");
            dot.classList.add("dot");
            dot.dataset.image = `${imageDir}/${name}/256/${style}.${i}.webp`;

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

              // select the adjacent caption and add class .highlight
              this.querySelector(".caption").classList.add("highlight");

              // get path of img.src, and url decode
              // "http://127.0.0.1:8080/images/female/256/bomber%20jacket%20with%20joggers%20and%20trainers%20for%20a%20sporty%20chic%20look.1.webp"
              // becomes "/images/female/256/bomber jacket with joggers and trainers for a sporty chic look.1.webp"
              const imgSrc =
                "." + decodeURI(img.src).replace(window.location.origin, "");

              // make the correct dot .active
              const dot = this.querySelector(`.dot[data-image="${imgSrc}"]`);

              if (dot) {
                dot.classList.add("active");
              }
            },
            function () {
              this.querySelector(".overlay").classList.remove("show");

              // remove .highlight from caption
              this.querySelector(".caption").classList.remove("highlight");

              // remove .active from all dots
              const dots = this.querySelectorAll(".dot");
              dots.forEach((dot) => {
                dot.classList.remove("active");
              });
            }
          );

          gridItem.appendChild(overlay);

          //
          // add clickable caption
          //
          const caption = document.createElement("div");
          caption.classList.add("caption");
          caption.textContent = style;

          // show tooltip to user that they can click to copy the style to clipboard
          caption.classList.add("copyable");
          caption.dataset.title = "Click to copy style to clipboard";

          // add event listener to copy caption text to clipboard when clicked
          clickManager.add(caption, function () {
            copyToClipboard(this);
          });

          gridItem.appendChild(caption);

          //
          // modal click handler
          //
          const modalContentGrid = document.querySelector(
            ".modal-content-grid"
          );

          // get grid-template-columns, grid-gap and width, and save them so we can restore them later
          // as these are changed when swapping from 2x2 to 1x1 display

          clickManager.add(gridItem, function (e) {
            // don't open modal if user clicked on a dot, or clicked on the caption
            if (e.target.classList.contains("dot")) return;
            if (e.target.classList.contains("caption")) return;

            // set the grid-template-columns to 2x2 grid and grid-gap to original values
            // if user previously pressed escape to close the modal, then it may not have been reset
            modalMultiGrid();

            // create content for the modal

            modalContentGrid.innerHTML = "";

            //
            // add 4 images to modal as 2x2 grid
            //
            for (let i = 1; i <= 4; i++) {
              // form the image path
              const imgSrc = `${imageDir}/${name}/256/${style}.${i}.webp`;

              // create PICTURE element
              const picture = document.createElement("picture");

              // create WEBP source
              const source = document.createElement("source");
              source.srcset = imgSrc;
              source.type = "image/webp";

              // create IMG
              const img = document.createElement("img");
              img.src = "./images/spinner.svg";
              img.dataset.src = imgSrc;
              img.classList.add("size-256");
              img.classList.add("lazy");
              img.width = 256;
              img.height = 256;

              //
              // add listener, when user clicks on image, display SINGLE LARGE IMAGE
              //
              img.addEventListener("click", function () {
                // create large IMG
                const largeImg = document.createElement("img");
                largeImg.src = getLargeImageSrc(imgSrc);
                // largeImg.src = "./images/spinner.svg";
                // largeImg.dataset.src = getLargeImageSrc(imgSrc);
                // largeImg.classList.add("lazy");

                // if user clicks large image, display 2x2 grid again
                largeImg.addEventListener("click", function () {
                  // show smaller grid images again

                  // restore styles back to 2x2 grid
                  modalMultiGrid();

                  modalContentGrid.querySelectorAll("img").forEach((img) => {
                    if (img.width === 256) {
                      img.style.display = "block";
                    }
                  });

                  // remove this larger image
                  this.remove();
                });

                // hide grid images
                modalContentGrid.querySelectorAll("img").forEach((img) => {
                  // smaller grid images
                  if (img.width === 256) {
                    img.style.display = "none";
                  }
                });

                // add the large image at start of modalContentGrid, so caption is always at end
                modalSingleGrid();

                // make image same size as overall grid: 256 + 256 + gap of 10px
                // enalrge it later
                largeImg.width = 522;
                largeImg.width = 522;
                modalContentGrid.prepend(largeImg);

                // delay 0.3s, as that is the css ease transition time
                setTimeout(() => {
                  largeImg.classList.add("size-768");
                  largeImg.width = 768;
                  largeImg.height = 768;
                }, 300);
              });

              picture.appendChild(source);
              picture.appendChild(img);
              modalContentGrid.appendChild(picture);
            }

            // add div to show prompt
            const prompt = document.createElement("div");
            prompt.classList.add("prompt");
            prompt.textContent = style;

            // make the prompt copyable
            prompt.classList.add("copyable");
            prompt.dataset.title = "Click to copy style to clipboard";
            clickManager.add(prompt, function () {
              copyToClipboard(this);
            });

            modalContentGrid.appendChild(prompt);

            // make modal visible
            openModal();

            // lazy load the images (probably not needed)
            lazyLoadInstance.update();
          });

          grid.appendChild(gridItem);
        });

        lazyLoadInstance.update();

        // filter the grid based on search input
        const searchInput = document.querySelector("#search-input");
        if (searchInput.value.length > 0) {
          filterGrid(searchInput.value);
        }
      } catch (error) {
        console.error("Error:", error);

        // check if 404 error
        if (error.message === "404") {
          // show 404 page
          showOnly("#missing");
        }
      }
    } // end loadStyle
  })();
});

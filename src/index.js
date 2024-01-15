(function () {
  // global vars
  let imageDir = "./images";
  let defaultStyleName = "female";
  const idsAvailable = ["#about", "#grid", "#missing"];

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
        element.dataset.title = "Click to copy prompt to clipboard";
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

  function initSearchBar() {
    // handle search input input#search-input
    const searchInput = document.querySelector("#search-input");

    // when typing in inputm filter the grid via the caption text
    searchInput.addEventListener("input", function (e) {
      // hide the clear button when input is empty, add and remove .hidden class
      const searchClear = document.querySelector("#search-clear");
      if (e.target.value.length === 0) {
        searchClear.classList.add("hidden");
      } else {
        searchClear.classList.remove("hidden");
      }

      // filter the grid, show only grid items that contain the search query
      // case insensitive
      const query = e.target.value.toLowerCase();
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
    });

    // clicking button#search-clear will clear the search input
    const searchClear = document.querySelector("#search-clear");
    searchClear.addEventListener("click", function (e) {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
    });
  }

  //
  // script starts here
  //

  // create these hover and click managers, we need these to clean up event listeners
  // when loading a new style
  const hoverManager = new MouseHoverManager();
  const clickManager = new MouseClickManager();

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

            // select the adjacent caption and add class .highlight
            this.querySelector(".caption").classList.add("highlight");
          },
          function () {
            this.querySelector(".overlay").classList.remove("show");

            // remove .highlight from caption
            this.querySelector(".caption").classList.remove("highlight");
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
          copyToClipboard(this);
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

          // add div to show prompt
          const prompt = document.createElement("div");
          prompt.classList.add("prompt");
          prompt.textContent = style;

          // mamke the prompt copyable
          prompt.classList.add("copyable");
          prompt.dataset.title = "Click to copy prompt to clipboard";
          clickManager.add(prompt, function () {
            copyToClipboard(this);
          });

          modalContent.appendChild(prompt);

          openModal();
        });

        grid.appendChild(gridItem);
      });
    } catch (error) {
      console.error("Error:", error);

      // check if 404 error
      if (error.message === "404") {
        // show 404 page
        showOnly("#missing");
      }
    }
  }

  // wait for DOM load
  document.addEventListener("DOMContentLoaded", async function () {
    //
    // Modal handling
    //

    // modal element covers the entire viewport with modal-content on top of it
    // when user clicks outside content, they are always clicking on .modal
    const modal = document.querySelector(".modal");
    modal.addEventListener("click", function (e) {
      // don't continue if user clicked on modal-content or its inside elements
      if (
        e.target.classList.contains("modal-content") ||
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

    await useCustom();

    // route on first page load
    handleRouteChange();

    // route on hash change
    window.addEventListener("hashchange", handleRouteChange);

    initSearchBar();
  });
})();

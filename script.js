let topicsData = null;
let currentTopic = null;
let currentSlideIndex = 0;
let filteredSlides = [];

const topicSelect = document.getElementById("topicSelect");
const presentationTitle = document.getElementById("presentationTitle");
const slideContainer = document.getElementById("slideContainer");
const notesContainer = document.getElementById("notesContainer");
const slideCounter = document.getElementById("slideCounter");

const prevSlideBtn = document.getElementById("prevSlide");
const nextSlideBtn = document.getElementById("nextSlide");

// NEW: Slide number search controls
const slideNumberInput = document.getElementById("slideNumber");
const goToSlideBtn = document.getElementById("goToSlide");


// Load multiple JSON files
async function loadTopics() {
  try {
    const files = [
      "glossary_use_case_scenarios.json",
      "ai_screenshots.json",
      "topics_master.json",
    ];

    let allTopics = [];

    for (const file of files) {
      const response = await fetch(file);
      const data = await response.json();

      if (data.topics && Array.isArray(data.topics)) {
        allTopics = allTopics.concat(data.topics);
      }
    }

    topicsData = { topics: allTopics };
    populateTopicDropdown();

  } catch (error) {
    alert("Error loading JSON files");
    console.error(error);
  }
}


function populateTopicDropdown() {
  topicsData.topics.forEach(topic => {
    const option = document.createElement("option");
    option.value = topic.id;
    option.textContent = topic.title;
    topicSelect.appendChild(option);
  });
}


topicSelect.addEventListener("change", function () {
  const selectedId = this.value;

  if (!selectedId) {
    slideContainer.innerHTML = "";
    notesContainer.innerHTML = "";
    presentationTitle.textContent = "";
    slideCounter.textContent = "";
    return;
  }

  currentTopic = topicsData.topics.find(t => t.id === selectedId);

  filteredSlides = currentTopic.slides.filter(slide =>
    (slide.content && slide.content.trim() !== "") ||
    (slide.image && slide.image.trim() !== "")
  );

  currentSlideIndex = 0;
  presentationTitle.textContent = currentTopic.title;

  // Clear the slide number box when a new presentation is selected
  slideNumberInput.value = "";

  displaySlide();
});


function displaySlide() {
  const slide = filteredSlides[currentSlideIndex];

  slideContainer.innerHTML = "";
  notesContainer.innerHTML = "";
  notesContainer.style.display = "none";

  slideCounter.textContent =
    `Slide ${currentSlideIndex + 1} of ${filteredSlides.length}`;

  /* IMAGE-ONLY SLIDE */
  if (
    slide.image &&
    slide.image.trim() !== "" &&
    (!slide.content || slide.content.trim() === "")
  ) {
    const wrapper = document.createElement("div");
    wrapper.className = "ppt-slide ppt-image-slide";

    const title = document.createElement("div");
    title.className = "ppt-title";
    title.textContent = slide.heading;

    const img = document.createElement("img");
    img.src = slide.image;
    img.alt = slide.heading;

    wrapper.appendChild(title);
    wrapper.appendChild(img);
    slideContainer.appendChild(wrapper);

    if (slide.notes && slide.notes.trim() !== "") {
      notesContainer.style.display = "block";
      notesContainer.innerHTML =
        `<div class="ppt-notes-title">Presenter Notes</div>${slide.notes}`;
    }

    return;
  }

  /* TEXT SLIDE */
  const wrapper = document.createElement("div");
  wrapper.className = "ppt-slide";

  const title = document.createElement("div");
  title.className = "ppt-title";
  title.textContent = slide.heading;

  const content = document.createElement("div");
  content.className = "ppt-content";
  content.textContent = slide.content;

  wrapper.appendChild(title);
  wrapper.appendChild(content);
  slideContainer.appendChild(wrapper);

  if (slide.notes && slide.notes.trim() !== "") {
    notesContainer.style.display = "block";
    notesContainer.innerHTML =
      `<div class="ppt-notes-title">Presenter Notes</div>${slide.notes}`;
  }
}


/* ===============================
   GO TO SLIDE BY NUMBER
   =============================== */

function goToSlide() {
  if (!currentTopic) {
    alert("Please select a presentation first.");
    return;
  }

  const slideNumber = parseInt(slideNumberInput.value, 10);

  if (isNaN(slideNumber)) {
    alert("Please enter a slide number.");
    return;
  }

  if (slideNumber < 1 || slideNumber > filteredSlides.length) {
    alert(`Please enter a number from 1 to ${filteredSlides.length}.`);
    return;
  }

  // Convert slide number to array index
  currentSlideIndex = slideNumber - 1;

  displaySlide();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// Click the Go button
goToSlideBtn.addEventListener("click", goToSlide);


// Press Enter in the slide-number box
slideNumberInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    goToSlide();
  }
});


/* ===============================
   KEYBOARD NAVIGATION
   =============================== */

document.addEventListener("keydown", function (e) {
  // Don't use arrow-key navigation while typing in the slide-number box
  if (document.activeElement === slideNumberInput) return;

  if (!currentTopic) return;

  if (e.key === "ArrowRight") {
    if (currentSlideIndex < filteredSlides.length - 1) {
      currentSlideIndex++;
      displaySlide();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (e.key === "ArrowLeft") {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      displaySlide();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
});


prevSlideBtn.addEventListener("click", function () {
  if (!currentTopic) return;

  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    displaySlide();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});


nextSlideBtn.addEventListener("click", function () {
  if (!currentTopic) return;

  if (currentSlideIndex < filteredSlides.length - 1) {
    currentSlideIndex++;
    displaySlide();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
// Speak selected text
document.getElementById("speakSelection").addEventListener("click", () => {
  const selectedText = window.getSelection().toString().trim();

  if (!selectedText) {
    alert("Please select some text first.");
    return;
  }

  // Stop any speech already in progress
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(selectedText);
  utterance.lang = "en-US";
  utterance.rate = 0.9;   // slightly slower
  utterance.pitch = 1;

  speechSynthesis.speak(utterance);
});



// Load data on startup
loadTopics();
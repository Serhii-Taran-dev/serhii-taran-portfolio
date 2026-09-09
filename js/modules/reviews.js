import Swiper from "swiper";
import { A11y, Keyboard, Navigation } from "swiper/modules";

import "swiper/css";

const REVIEWS_URL = new URL("reviews.json", document.baseURI);

const REVIEW_LIMITS = {
  text: 350,
  name: 40,
  role: 40,
  company: 30,
  context: 40,
};

function isValidReview(review) {
  if (!review || typeof review !== "object") return false;

  const requiredFields = ["id", "text", "name", "role", "company", "context"];

  return requiredFields.every(
    (field) =>
      typeof review[field] === "string" && review[field].trim().length > 0,
  );
}

function getExceededFields(review) {
  return Object.entries(REVIEW_LIMITS)
    .filter(([field, limit]) => review[field].length > limit)
    .map(([field, limit]) => ({
      field,
      length: review[field].length,
      recommendedMaximum: limit,
    }));
}

function warnAboutLongReviews(reviews) {
  const oversizedReviews = reviews
    .map((review) => ({
      id: review.id,
      exceededFields: getExceededFields(review),
    }))
    .filter((review) => review.exceededFields.length > 0);

  if (oversizedReviews.length > 0) {
    console.warn(
      "Some reviews exceed the recommended text length:",
      oversizedReviews,
    );
  }
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function createReviewCard(review) {
  const item = document.createElement("li");
  item.className = "reviews__item swiper-slide";

  const card = document.createElement("article");
  card.className = "reviews__card";

  const quote = document.createElement("blockquote");
  quote.className = "reviews__quote";

  const text = document.createElement("p");
  text.className = "reviews__text";
  text.textContent = review.text;

  const author = document.createElement("footer");
  author.className = "reviews__author";

  const initials = document.createElement("span");
  initials.className = "reviews__initials";
  initials.setAttribute("aria-hidden", "true");
  initials.textContent = getInitials(review.name);

  const authorDetails = document.createElement("div");
  authorDetails.className = "reviews__author-details";

  const name = document.createElement("cite");
  name.className = "reviews__name";
  name.textContent = review.name;

  const position = document.createElement("p");
  position.className = "reviews__position";
  position.textContent = `${review.role} · ${review.company}`;

  const context = document.createElement("p");
  context.className = "reviews__context";
  context.textContent = review.context;

  quote.append(text);
  authorDetails.append(name, position, context);
  author.append(initials, authorDetails);
  card.append(quote, author);
  item.append(card);

  return item;
}

function renderReviews(reviews, list) {
  const fragment = document.createDocumentFragment();

  reviews.forEach((review) => {
    fragment.append(createReviewCard(review));
  });

  list.replaceChildren(fragment);
}

function updateControlsVisibility(swiper, controls) {
  controls.hidden = swiper.isLocked;
}

function createReviewsSlider({ slider, previousButton, nextButton, controls }) {
  return new Swiper(slider, {
    modules: [A11y, Keyboard, Navigation],

    slidesPerView: 1,
    spaceBetween: 16,
    watchOverflow: true,

    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },

      1280: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },

    navigation: {
      prevEl: previousButton,
      nextEl: nextButton,
    },

    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },

    a11y: {
      enabled: true,
      prevSlideMessage: "Previous review",
      nextSlideMessage: "Next review",
      firstSlideMessage: "This is the first review",
      lastSlideMessage: "This is the last review",
    },

    on: {
      init(swiper) {
        updateControlsVisibility(swiper, controls);
      },

      resize(swiper) {
        updateControlsVisibility(swiper, controls);
      },

      breakpoint(swiper) {
        updateControlsVisibility(swiper, controls);
      },

      lock(swiper) {
        updateControlsVisibility(swiper, controls);
      },

      unlock(swiper) {
        updateControlsVisibility(swiper, controls);
      },
    },
  });
}

export async function initReviews() {
  const section = document.querySelector(".reviews");
  const slider = section?.querySelector(".reviews__slider");
  const list = section?.querySelector(".reviews__list");
  const controls = section?.querySelector(".reviews__controls");
  const previousButton = section?.querySelector(".reviews__button--previous");
  const nextButton = section?.querySelector(".reviews__button--next");

  if (
    !(section instanceof HTMLElement) ||
    !(slider instanceof HTMLElement) ||
    !(list instanceof HTMLUListElement) ||
    !(controls instanceof HTMLElement) ||
    !(previousButton instanceof HTMLButtonElement) ||
    !(nextButton instanceof HTMLButtonElement)
  ) {
    return;
  }

  try {
    const response = await fetch(REVIEWS_URL);

    if (!response.ok) {
      throw new Error(`Failed to load reviews: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new TypeError("Reviews data must be an array");
    }

    const validReviews = data.filter(isValidReview);

    if (validReviews.length !== data.length) {
      console.warn(
        `${data.length - validReviews.length} invalid review(s) were skipped.`,
      );
    }

    if (validReviews.length === 0) {
      section.hidden = true;
      return;
    }

    warnAboutLongReviews(validReviews);
    renderReviews(validReviews, list);

    section.hidden = false;

    createReviewsSlider({
      slider,
      previousButton,
      nextButton,
      controls,
    });
  } catch (error) {
    section.hidden = true;
    console.error("Unable to initialize the reviews section:", error);
  }
}

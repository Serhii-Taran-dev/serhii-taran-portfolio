const PROJECTS_PER_LOAD = 3;

export function initProjects() {
  const projectsSection = document.querySelector(".projects");

  if (!(projectsSection instanceof HTMLElement)) return;

  const loadMoreBtn = projectsSection.querySelector(".projects__load-more-btn");

  if (!(loadMoreBtn instanceof HTMLButtonElement)) return;

  const hiddenCards = Array.from(
    projectsSection.querySelectorAll(".projects__item--hidden"),
  );

  if (hiddenCards.length === 0) {
    loadMoreBtn.hidden = true;
    return;
  }

  loadMoreBtn.hidden = false;

  loadMoreBtn.addEventListener("click", (event) => {
    const cardsToShow = hiddenCards.splice(0, PROJECTS_PER_LOAD);

    cardsToShow.forEach((card) => {
      card.classList.remove("projects__item--hidden");
      card.classList.add("projects__item--visible");
    });

    if (event.detail === 0) {
      const firstRevealedLink = cardsToShow[0]?.querySelector(
        ".project-card__media",
      );

      if (firstRevealedLink instanceof HTMLAnchorElement) {
        firstRevealedLink.focus();
      }
    }

    if (hiddenCards.length === 0) {
      loadMoreBtn.hidden = true;
    }
  });
}

const TABLET_BREAKPOINT = 768;

export function initMenu() {
  const burgerBtn = document.getElementById("burger-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeBtn = document.getElementById("menu-close-btn");
  const navLinks = mobileMenu?.querySelectorAll(".mobile-menu__link");

  if (
    !(burgerBtn instanceof HTMLButtonElement) ||
    !(mobileMenu instanceof HTMLElement) ||
    !(closeBtn instanceof HTMLButtonElement) ||
    !navLinks
  ) {
    return;
  }

  const focusableElements = [
    closeBtn,
    ...mobileMenu.querySelectorAll("a[href], button:not([disabled])"),
  ].filter((element, index, elements) => elements.indexOf(element) === index);

  function openMenu() {
    mobileMenu.classList.add("active");
    document.body.classList.add("no-scroll");

    burgerBtn.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");

    closeBtn.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    mobileMenu.classList.remove("active");
    document.body.classList.remove("no-scroll");

    burgerBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");

    if (restoreFocus) {
      burgerBtn.focus();
    }
  }

  function handleMenuKeydown(event) {
    if (!mobileMenu.classList.contains("active")) return;

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key !== "Tab" || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  burgerBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", () => closeMenu());

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu({ restoreFocus: false });
    });
  });

  document.addEventListener("keydown", handleMenuKeydown);

  window.addEventListener("resize", () => {
    if (
      window.innerWidth >= TABLET_BREAKPOINT &&
      mobileMenu.classList.contains("active")
    ) {
      closeMenu({ restoreFocus: false });
    }
  });

  burgerBtn.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
}

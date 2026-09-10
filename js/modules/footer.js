export function initFooterYear() {
  const yearElement = document.querySelector("#footer-year");

  if (!(yearElement instanceof HTMLElement)) return;

  yearElement.textContent = String(new Date().getFullYear());
}

import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-700.css";

import { initContactForm } from "./modules/contact.js";
import { initFooterYear } from "./modules/footer.js";
import { initMenu } from "./modules/menu.js";
import { initProjects } from "./modules/projects.js";
import { initReviews } from "./modules/reviews.js";
import { initTheme } from "./modules/theme.js";

initTheme();
initMenu();
initProjects();
void initReviews();
initContactForm();
initFooterYear();

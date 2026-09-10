const MIN_NAME_LENGTH = 2;
const MIN_MESSAGE_LENGTH = 20;

function getFieldError(field) {
  const value = field.value.trim();

  if (!value) {
    if (field.name === "name") {
      return "Please enter your name.";
    }

    if (field.name === "email") {
      return "Please enter your email address.";
    }

    if (field.name === "message") {
      return "Please describe your project or idea.";
    }
  }

  if (field.name === "name" && value.length < MIN_NAME_LENGTH) {
    return `Name must contain at least ${MIN_NAME_LENGTH} characters.`;
  }

  if (field.name === "email" && field.validity.typeMismatch) {
    return "Please enter a valid email address.";
  }

  if (field.name === "message" && value.length < MIN_MESSAGE_LENGTH) {
    return `Message must contain at least ${MIN_MESSAGE_LENGTH} characters.`;
  }

  if (field.validity.tooLong) {
    return "This value is too long.";
  }

  return "";
}

function getErrorElement(field) {
  const errorId = field
    .getAttribute("aria-describedby")
    ?.split(" ")
    .find((id) => id.endsWith("-error"));

  if (!errorId) return null;

  return document.getElementById(errorId);
}

function validateField(field) {
  const errorMessage = getFieldError(field);
  const errorElement = getErrorElement(field);
  const isValid = errorMessage.length === 0;

  field.classList.toggle("is-invalid", !isValid);
  field.setAttribute("aria-invalid", String(!isValid));

  if (errorElement) {
    errorElement.textContent = errorMessage;
  }

  return isValid;
}

function clearFieldError(field) {
  const errorElement = getErrorElement(field);

  field.classList.remove("is-invalid");
  field.removeAttribute("aria-invalid");

  if (errorElement) {
    errorElement.textContent = "";
  }
}

function setFormStatus(statusElement, type, message) {
  statusElement.hidden = false;
  statusElement.classList.remove("is-success", "is-error");
  statusElement.classList.add(`is-${type}`);
  statusElement.setAttribute("role", type === "error" ? "alert" : "status");
  statusElement.textContent = message;
}

function clearFormStatus(statusElement) {
  statusElement.hidden = true;
  statusElement.classList.remove("is-success", "is-error");
  statusElement.setAttribute("role", "status");
  statusElement.textContent = "";
}

async function submitForm(form) {
  const response = await fetch(form.action, {
    method: form.method,
    body: new FormData(form),
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      // The response may not contain JSON.
    }

    console.error("Formspree submission failed:", responseData);

    throw new Error(`Form submission failed with status ${response.status}`);
  }
}

export function initContactForm() {
  const form = document.querySelector("#contact-form");

  if (!(form instanceof HTMLFormElement)) return;

  const fields = Array.from(
    form.querySelectorAll(".contact__input, .contact__textarea"),
  ).filter(
    (field) =>
      field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement,
  );

  const submitButton = form.querySelector(".contact__submit");
  const submitText = form.querySelector(".contact__submit-text");
  const statusElement = form.querySelector(".contact__status");

  if (
    !(submitButton instanceof HTMLButtonElement) ||
    !(submitText instanceof HTMLElement) ||
    !(statusElement instanceof HTMLParagraphElement)
  ) {
    return;
  }

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      field.value = field.value.trim();
      validateField(field);
    });

    field.addEventListener("input", () => {
      clearFormStatus(statusElement);

      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormStatus(statusElement);

    fields.forEach((field) => {
      field.value = field.value.trim();
    });

    const validationResults = fields.map(validateField);
    const isFormValid = validationResults.every(Boolean);

    if (!isFormValid) {
      const firstInvalidField = fields.find(
        (field) => field.getAttribute("aria-invalid") === "true",
      );

      firstInvalidField?.focus();
      return;
    }

    submitButton.disabled = true;
    submitText.textContent = "Sending…";
    form.setAttribute("aria-busy", "true");

    try {
      await submitForm(form);

      form.reset();
      fields.forEach(clearFieldError);

      setFormStatus(
        statusElement,
        "success",
        "Thank you! Your message has been sent. I’ll get back to you as soon as possible.",
      );
    } catch (error) {
      console.error("Unable to send contact form:", error);

      setFormStatus(
        statusElement,
        "error",
        "The message could not be sent. Please try again or contact me directly by email.",
      );
    } finally {
      submitButton.disabled = false;
      submitText.textContent = "Send message";
      form.removeAttribute("aria-busy");
    }
  });
}

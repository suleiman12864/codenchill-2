document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    navigation.classList.remove("is-open");
  });
}

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const captchaDialog = document.querySelector("#captcha-dialog");
  const captchaForm = document.querySelector("#captcha-form");
  const captchaQuestion = document.querySelector("#captcha-question");
  const captchaGrid = document.querySelector("#captcha-grid");
  const captchaSelectionCount = document.querySelector("#captcha-selection-count");
  const captchaError = document.querySelector("#captcha-error");
  const captchaSubmit = document.querySelector("#captcha-submit");
  const captchaRefresh = document.querySelector("#captcha-refresh");
  const captchaClose = document.querySelector("#captcha-close");
  const confirmationScreen = document.querySelector("#confirmation-screen");
  const confirmationTitle = document.querySelector("#confirmation-title");
  const confirmationName = document.querySelector("#confirmation-name");
  const confirmationNewInquiry = document.querySelector("#confirmation-new-inquiry");
  const contactLayout = contactForm.closest(".contact-layout");
  const websiteType = contactForm.querySelector("#website-type");
  const projectDetails = contactForm.querySelector("#project-details");
  const captchaLabels = {
    leaf: "a leaf",
    flower: "a flower",
    mug: "a mug",
    book: "a book",
    house: "a house",
    camera: "a camera",
  };
  const captchaArtwork = {
    leaf: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M76 20C49 22 26 33 24 55c-1 13 9 22 21 21 22-2 32-29 31-56Z" fill="rgba(198,243,106,.2)" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M23 80c12-20 27-32 47-47M40 62l-2-16m17 3 12-1" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
    flower: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 52v31m0-11c-8-9-17-8-20-5 4 10 12 13 20 8m0-7c8-9 17-8 20-5-4 10-12 13-20 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g fill="rgba(198,243,106,.2)" stroke="currentColor" stroke-width="3"><ellipse cx="50" cy="30" rx="8" ry="13"/><ellipse cx="50" cy="30" rx="8" ry="13" transform="rotate(60 50 38)"/><ellipse cx="50" cy="30" rx="8" ry="13" transform="rotate(120 50 38)"/></g><circle cx="50" cy="38" r="7" fill="#d9efad"/></svg>',
    mug: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M25 34h43v35a9 9 0 0 1-9 9H34a9 9 0 0 1-9-9V34Zm43 8h8a10 10 0 0 1 0 20h-8" fill="rgba(198,243,106,.16)" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M35 23c-4 5 4 7 0 12m15-12c-4 5 4 7 0 12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    book: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 27c13-5 23-3 32 5v48c-9-8-19-10-32-5V27Zm64 0c-13-5-23-3-32 5v48c9-8 19-10 32-5V27Z" fill="rgba(198,243,106,.16)" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M27 39c6-1 11 0 16 3m-16 8c6-1 11 0 16 3m25-14c4-2 8-3 12-2m-12 10c4-2 8-3 12-2" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    house: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="m16 48 34-28 34 28v34H16V48Z" fill="rgba(198,243,106,.16)" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M41 82V58h18v24M27 49h10m26 0h10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    camera: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M20 36h14l7-10h20l7 10h12a6 6 0 0 1 6 6v34a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V42a6 6 0 0 1 6-6Z" fill="rgba(198,243,106,.16)" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="51" cy="57" r="15" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="51" cy="57" r="7" fill="rgba(198,243,106,.3)" stroke="currentColor" stroke-width="3"/><circle cx="75" cy="46" r="3" fill="currentColor"/></svg>',
  };
  const selectedCaptchaTiles = new Set();
  let captchaToken = "";
  let previewCaptchaAnswer = null;
  let previewMode = window.location.protocol === "file:";
  let challengeRequest = 0;
  let submissionInProgress = false;
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const websiteQuestions = {
    business: [
      { name: "industry", label: "What industry is your business in?", type: "text", placeholder: "e.g. Health, construction, hospitality" },
      { name: "businessGoal", label: "What should the website help you achieve?", type: "textarea", placeholder: "Tell me the main result you want from the site." },
      { name: "pageCount", label: "How many pages do you expect?", type: "select", options: ["1–3 pages", "4–6 pages", "7–10 pages", "More than 10", "Not sure yet"] },
    ],
    ecommerce: [
      { name: "productCount", label: "How many products will you sell?", type: "select", options: ["1–10", "11–50", "51–200", "More than 200", "Not sure yet"] },
      { name: "payments", label: "Which payment methods do you need?", type: "text", placeholder: "e.g. Cards, bank transfer, Paystack" },
      { name: "shipping", label: "Where will you ship orders?", type: "text", placeholder: "e.g. Within Nigeria, worldwide" },
      { name: "storePlatform", label: "Do you have a preferred store platform?", type: "text", placeholder: "e.g. Shopify, WooCommerce, open to advice" },
    ],
    portfolio: [
      { name: "profession", label: "What work or profession should the site showcase?", type: "text", placeholder: "e.g. Photography, architecture, consulting" },
      { name: "portfolioItems", label: "How many projects or case studies should it feature?", type: "select", options: ["1–5", "6–10", "11–20", "More than 20", "Not sure yet"] },
      { name: "portfolioGoal", label: "What action should visitors take?", type: "text", placeholder: "e.g. Book a call, request a quote, view my work" },
    ],
    booking: [
      { name: "bookingBusiness", label: "What kind of business needs bookings?", type: "text", placeholder: "e.g. Salon, clinic, consultant" },
      { name: "bookingServices", label: "What services or appointment types will people book?", type: "textarea", placeholder: "List your services and typical appointment lengths." },
      { name: "bookingNeeds", label: "Do you need payments, staff calendars, or reminders?", type: "text", placeholder: "Tell me which booking features matter." },
    ],
    blog: [
      { name: "publicationTopic", label: "What will the publication cover?", type: "text", placeholder: "e.g. Culture, business, food" },
      { name: "contributors", label: "Who will publish content?", type: "select", options: ["Just me", "A small editorial team", "Many contributors", "Not sure yet"] },
      { name: "blogFeatures", label: "Which features do you need?", type: "text", placeholder: "e.g. Newsletter, categories, memberships" },
    ],
    webapp: [
      { name: "appAudience", label: "Who will use the web app?", type: "text", placeholder: "Describe your users or teams." },
      { name: "appProblem", label: "What problem will it solve?", type: "textarea", placeholder: "Describe the main user journey or workflow." },
      { name: "appFeatures", label: "Which essential features or integrations do you need?", type: "textarea", placeholder: "e.g. Accounts, payments, reports, existing APIs" },
    ],
    landing: [
      { name: "offer", label: "What product, service, or campaign is this for?", type: "text", placeholder: "Describe what you're launching." },
      { name: "targetAudience", label: "Who do you want to reach?", type: "text", placeholder: "Describe your ideal audience." },
      { name: "landingAction", label: "What should visitors do?", type: "select", options: ["Buy or subscribe", "Book a call", "Join a waitlist", "Sign up", "Other"] },
    ],
    other: [
      { name: "websiteIdea", label: "What are you hoping to build?", type: "textarea", placeholder: "Share whatever you know so far." },
      { name: "websiteReference", label: "Any websites or examples you like?", type: "text", placeholder: "Paste a link or describe the style." },
    ],
  };

  const renderWebsiteQuestions = () => {
    projectDetails.replaceChildren();
    const questions = websiteQuestions[websiteType.value] ?? [];
    projectDetails.hidden = questions.length === 0;
    if (questions.length === 0) return;

    const heading = document.createElement("span");
    heading.className = "project-details-heading";
    heading.textContent = "A few details about your website";
    projectDetails.append(heading);

    questions.forEach((question) => {
      const label = document.createElement("label");
      const id = `project-${question.name}`;
      label.htmlFor = id;
      label.textContent = question.label;

      let field;
      if (question.type === "select") {
        field = document.createElement("select");
        const prompt = document.createElement("option");
        prompt.value = "";
        prompt.textContent = "Choose an option";
        prompt.disabled = true;
        prompt.selected = true;
        field.append(prompt);
        question.options.forEach((optionText) => {
          const option = document.createElement("option");
          option.value = optionText;
          option.textContent = optionText;
          field.append(option);
        });
      } else {
        field = document.createElement(question.type === "textarea" ? "textarea" : "input");
        if (question.type === "text") field.type = "text";
        if (question.type === "textarea") field.rows = 2;
        field.placeholder = question.placeholder;
      }

      field.id = id;
      field.name = question.name;
      field.required = true;
      projectDetails.append(label, field);
    });
  };

  websiteType.addEventListener("change", renderWebsiteQuestions);

  const renderCaptchaChallenge = ({ target, tiles }) => {
    if (!captchaLabels[target] || !Array.isArray(tiles) || tiles.length !== 9
      || tiles.some((tile) => !captchaArtwork[tile])) {
      throw new Error("The verification service returned an invalid picture challenge.");
    }

    captchaQuestion.textContent = captchaLabels[target];
    captchaGrid.setAttribute("aria-label", `Choose all pictures showing ${captchaLabels[target]}`);
    captchaGrid.replaceChildren();
    selectedCaptchaTiles.clear();
    captchaSelectionCount.textContent = "Select every matching picture.";

    tiles.forEach((image, index) => {
      const tile = document.createElement("button");
      tile.className = "captcha-tile";
      tile.type = "button";
      tile.setAttribute("aria-label", `Picture ${index + 1}`);
      tile.setAttribute("aria-pressed", "false");
      tile.innerHTML = captchaArtwork[image];
      tile.addEventListener("click", () => {
        if (selectedCaptchaTiles.has(index)) {
          selectedCaptchaTiles.delete(index);
        } else {
          selectedCaptchaTiles.add(index);
        }
        const selected = selectedCaptchaTiles.has(index);
        tile.classList.toggle("is-selected", selected);
        tile.setAttribute("aria-pressed", String(selected));
        const count = selectedCaptchaTiles.size;
        captchaSelectionCount.textContent = count
          ? `${count} picture${count === 1 ? "" : "s"} selected.`
          : "Select every matching picture.";
        captchaError.textContent = "";
      });
      captchaGrid.append(tile);
    });
  };

  const createPreviewCaptcha = () => {
    const images = Object.keys(captchaLabels);
    const target = images[Math.floor(Math.random() * images.length)];
    const tiles = Array(2 + Math.floor(Math.random() * 3)).fill(target);
    const distractors = images.filter((image) => image !== target);
    while (tiles.length < 9) {
      tiles.push(distractors[Math.floor(Math.random() * distractors.length)]);
    }
    for (let index = tiles.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [tiles[index], tiles[otherIndex]] = [tiles[otherIndex], tiles[index]];
    }
    return {
      target,
      tiles,
      answer: tiles.map((image, index) => image === target ? index : null)
        .filter((index) => index !== null)
        .join(","),
    };
  };

  const loadCaptchaChallenge = async ({ clearError = true } = {}) => {
    const requestNumber = ++challengeRequest;
    if (clearError) captchaError.textContent = "";
    captchaGrid.replaceChildren();
    selectedCaptchaTiles.clear();
    captchaSelectionCount.textContent = "Loading pictures…";
    captchaQuestion.textContent = "Preparing verification…";
    captchaToken = "";
    previewCaptchaAnswer = null;
    captchaSubmit.disabled = true;
    captchaRefresh.disabled = true;

    if (previewMode) {
      const challenge = createPreviewCaptcha();
      previewCaptchaAnswer = challenge.answer;
      captchaToken = "local-preview";
      renderCaptchaChallenge(challenge);
      captchaError.textContent = "Local preview only: passing this check opens an email draft; it won’t send the enquiry automatically.";
      captchaSubmit.disabled = false;
      captchaRefresh.disabled = false;
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/submit-enquiry?challenge=1", {
        headers: { Accept: "application/json" },
      });
      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : {};
      if (requestNumber !== challengeRequest) return;
      if (!response.ok) {
        throw new Error(result.error ?? `The verification service returned ${response.status}.`);
      }
      if (typeof result.token !== "string") {
        throw new Error("The verification service returned an invalid challenge.");
      }
      renderCaptchaChallenge(result);
      captchaToken = result.token;
      previewCaptchaAnswer = null;
      previewMode = false;
      captchaSubmit.disabled = false;
      captchaRefresh.disabled = false;
    } catch (error) {
      if (requestNumber !== challengeRequest) return;
      captchaToken = "";
      if (isLocalHost) {
        const challenge = createPreviewCaptcha();
        previewCaptchaAnswer = challenge.answer;
        previewMode = true;
        captchaToken = "local-preview";
        renderCaptchaChallenge(challenge);
        captchaError.textContent = "Local preview only: passing this check opens an email draft; it won’t send the enquiry automatically.";
        captchaSubmit.disabled = false;
        captchaRefresh.disabled = false;
      } else {
        captchaQuestion.textContent = "Verification unavailable";
        captchaSelectionCount.textContent = "";
        captchaError.textContent = error.message.includes("Verification is not configured")
          ? `${error.message} Add CAPTCHA_SECRET (at least 32 characters) to your Netlify environment variables, then redeploy.`
          : "The verification service could not be reached. Check that the Netlify function is deployed and CAPTCHA_SECRET (at least 32 characters) is configured.";
        captchaRefresh.disabled = false;
      }
    }
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    if (submissionInProgress) return;
    if (!captchaDialog.open) captchaDialog.showModal();
    await loadCaptchaChallenge();
    (captchaGrid.querySelector("button") ?? captchaRefresh).focus();
  });

  captchaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submissionInProgress) return;
    if (selectedCaptchaTiles.size === 0) {
      captchaError.textContent = "Select every picture that matches the object before continuing.";
      return;
    }
    const captchaAnswer = [...selectedCaptchaTiles].sort((left, right) => left - right).join(",");
    if (previewCaptchaAnswer !== null && captchaAnswer !== previewCaptchaAnswer) {
      captchaError.textContent = "Those pictures don’t match the prompt. Change your selection or get a new challenge.";
      return;
    }

    const data = new FormData(contactForm);
    const selectedWebsiteType = websiteType.selectedOptions[0]?.textContent ?? "Not specified";
    const note = contactForm.querySelector("#form-note");
    const projectDetailsData = [...projectDetails.querySelectorAll("input, select, textarea")].map((field) => ({
      question: field.labels[0]?.textContent ?? field.name,
      answer: field.value,
    }));
    const enquiry = {
      name: data.get("name"),
      email: data.get("email"),
      whatsapp: data.get("whatsapp"),
      service: data.get("project"),
      websiteType: selectedWebsiteType,
      details: projectDetailsData,
      message: data.get("message"),
      contactConsent: data.get("contactConsent") === "on",
    };

    if (previewMode) {
      const answers = [
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email}`,
        `WhatsApp: ${enquiry.whatsapp}`,
        "Contact permission: Yes",
        `Service: ${enquiry.service}`,
        `Website type: ${enquiry.websiteType}`,
        ...enquiry.details.map(({ question, answer }) => `${question}: ${answer}`),
        `Additional message: ${enquiry.message}`,
      ].join("\n");
      const subject = encodeURIComponent(`New ${enquiry.websiteType} enquiry — ${enquiry.name}`);
      const body = encodeURIComponent(`${answers}\n\nReply directly to ${enquiry.email} to follow up.`);
      captchaDialog.close();
      note.textContent = "Local preview only: your email app will open a draft to the studio. Deploy to Netlify and configure the email and WhatsApp services to send confirmations automatically.";
      window.location.href = `mailto:maestra7586@gmail.com?subject=${subject}&body=${body}`;
      return;
    }

    if (!captchaToken) {
      captchaError.textContent = "Please load a new verification question and try again.";
      return;
    }

    submissionInProgress = true;
    captchaSubmit.disabled = true;
    captchaRefresh.disabled = true;
    captchaError.textContent = "Sending your enquiry…";

    try {
      const response = await fetch("/.netlify/functions/submit-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...enquiry,
          captcha: {
            token: captchaToken,
            answer: captchaAnswer,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        captchaError.textContent = result.error ?? "We couldn't send your enquiry. Please try again.";
        if (response.status === 403) {
          captchaToken = "";
          await loadCaptchaChallenge({ clearError: false });
          if (captchaToken) {
            captchaError.textContent = result.error ?? "That verification answer was incorrect or expired. Please try again.";
          }
        }
        return;
      }

      contactForm.reset();
      projectDetails.replaceChildren();
      projectDetails.hidden = true;
      captchaDialog.close();
      captchaToken = "";
      previewCaptchaAnswer = null;
      confirmationName.textContent = `, ${String(enquiry.name).trim().split(/\s+/)[0]}`;
      contactLayout.hidden = true;
      confirmationScreen.hidden = false;
      confirmationTitle.focus();
      confirmationScreen.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      captchaError.textContent = "We couldn't reach the enquiry service. Please try again or email maestra7586@gmail.com.";
    } finally {
      submissionInProgress = false;
      captchaSubmit.disabled = !captchaToken;
      captchaRefresh.disabled = false;
    }
  });

  captchaRefresh.addEventListener("click", loadCaptchaChallenge);
  captchaClose.addEventListener("click", () => captchaDialog.close());
  confirmationNewInquiry.addEventListener("click", () => {
    confirmationScreen.hidden = true;
    contactLayout.hidden = false;
    contactForm.querySelector("#form-note").textContent = "After you submit, a quick verification will appear before your enquiry is sent.";
    contactForm.querySelector("#name").focus();
    contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  captchaDialog.addEventListener("click", (event) => {
    if (event.target === captchaDialog) captchaDialog.close();
  });
}

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
  const confirmationScreen = document.querySelector("#confirmation-screen");
  const confirmationTitle = document.querySelector("#confirmation-title");
  const confirmationName = document.querySelector("#confirmation-name");
  const confirmationNewInquiry = document.querySelector("#confirmation-new-inquiry");
  const contactLayout = contactForm.closest(".contact-layout");
  const websiteType = contactForm.querySelector("#website-type");
  const projectDetails = contactForm.querySelector("#project-details");
  let submissionInProgress = false;
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

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity() || submissionInProgress) return;

    const data = new FormData(contactForm);
    const selectedWebsiteType = websiteType.selectedOptions[0]?.textContent ?? "Not specified";
    const note = contactForm.querySelector("#form-note");
    const submitButton = contactForm.querySelector('button[type="submit"]');
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

    if (window.location.protocol === "file:") {
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
      note.textContent = "Local preview only: your email app will open a draft to the studio. Deploy to Netlify and configure the email and WhatsApp services to send confirmations automatically.";
      window.location.href = `mailto:maestra7586@gmail.com?subject=${subject}&body=${body}`;
      return;
    }

    submissionInProgress = true;
    submitButton.disabled = true;
    note.textContent = "Sending your enquiry…";

    try {
      const response = await fetch("/.netlify/functions/submit-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiry),
      });
      const result = await response.json();
      if (!response.ok) {
        note.textContent = result.error ?? "We couldn't send your enquiry. Please try again.";
        return;
      }

      contactForm.reset();
      projectDetails.replaceChildren();
      projectDetails.hidden = true;
      confirmationName.textContent = `, ${String(enquiry.name).trim().split(/\s+/)[0]}`;
      contactLayout.hidden = true;
      confirmationScreen.hidden = false;
      confirmationTitle.focus();
      confirmationScreen.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      note.textContent = "We couldn't reach the enquiry service. Please try again or email maestra7586@gmail.com.";
    } finally {
      submissionInProgress = false;
      submitButton.disabled = false;
    }
  });

  confirmationNewInquiry.addEventListener("click", () => {
    confirmationScreen.hidden = true;
    contactLayout.hidden = false;
    contactForm.querySelector("#form-note").textContent = "Your enquiry details will be sent securely.";
    contactForm.querySelector("#name").focus();
    contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* Apex Forge interactions: all functionality uses plain, accessible JavaScript. */
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelector(".nav-links");
  const menuButton = document.querySelector(".menu-toggle");
  const progressBar = document.querySelector(".scroll-progress span");
  const backToTop = document.querySelector(".back-to-top");
  const toast = document.querySelector(".toast");
  const toastText = toast.querySelector("p");
  let toastTimer;

  // Loading screen
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      document.querySelector(".loader").classList.add("done");
      body.classList.remove("is-loading");
    }, 500);
  });
  body.classList.add("is-loading");

  const showToast = (message, isError = false) => {
    clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.querySelector(".toast-icon").textContent = isError ? "!" : "✓";
    toast.querySelector(".toast-icon").style.background = isError ? "#ff7771" : "var(--acid)";
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4600);
  };
  toast.querySelector("button").addEventListener("click", () => toast.classList.remove("show"));

  // Mobile navigation
  const closeMenu = () => {
    navLinks.classList.remove("open");
    body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
  };
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

  // Theme preference and toggle
  const themeButton = document.querySelector(".theme-toggle");
  const savedTheme = localStorage.getItem("apex-theme");
  if (savedTheme === "light") body.classList.add("light-theme");
  const refreshThemeLabel = () => themeButton.setAttribute("aria-label", body.classList.contains("light-theme") ? "Switch to dark mode" : "Switch to light mode");
  refreshThemeLabel();
  themeButton.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    localStorage.setItem("apex-theme", body.classList.contains("light-theme") ? "light" : "dark");
    refreshThemeLabel();
  });

  // Header state, scroll progress, back-to-top, active navigation
  const sectionLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = sectionLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const handleScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${scrollable ? (window.scrollY / scrollable) * 100 : 0}%`;
    header.classList.toggle("is-sticky", window.scrollY > 32);
    backToTop.classList.toggle("show", window.scrollY > 650);
    let current = "home";
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 140) current = section.id;
    });
    sectionLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Gentle parallax for large visual fields
  const parallaxItems = document.querySelectorAll("[data-speed]");
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    parallaxItems.forEach(item => {
      item.style.transform = `translate3d(0, ${scrollY * Number(item.dataset.speed)}px, 0)`;
    });
  }, { passive: true });

  // Scroll reveal
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));

  // Counter animation runs only when its section enters view.
  const countNumber = element => {
    if (element.dataset.counted) return;
    element.dataset.counted = "true";
    const goal = Number(element.dataset.counter);
    const suffix = element.dataset.suffix || "";
    const start = performance.now();
    const duration = Math.min(2200, 750 + goal * 1.2);
    const update = time => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.floor(goal * eased).toLocaleString("en-IN") + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else element.textContent = goal.toLocaleString("en-IN") + suffix;
    };
    requestAnimationFrame(update);
  };
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.querySelectorAll("[data-counter]").forEach(countNumber);
  }), { threshold: 0.35 });
  document.querySelectorAll(".hero, .impact").forEach(section => counterObserver.observe(section));

  // BMI Calculator
  const bmiForm = document.querySelector("#bmi-form");
  const bmiMessage = document.querySelector("#bmi-message");
  const bmiResult = document.querySelector("#bmi-result");
  bmiForm.addEventListener("submit", event => {
    event.preventDefault();
    const height = Number(bmiForm.elements.height.value);
    const weight = Number(bmiForm.elements.weight.value);
    if (!height || !weight || height < 80 || height > 250 || weight < 20 || weight > 400) {
      bmiMessage.textContent = "Please enter a valid height (80–250 cm) and weight (20–400 kg).";
      bmiMessage.classList.add("error");
      return;
    }
    const value = weight / Math.pow(height / 100, 2);
    let category = "Healthy range";
    let color = "var(--acid)";
    if (value < 18.5) { category = "Underweight"; color = "#68a9ff"; }
    else if (value < 25) { category = "Healthy range"; color = "var(--acid)"; }
    else if (value < 30) { category = "Overweight"; color = "#ffbc3b"; }
    else { category = "Obese"; color = "#ff7771"; }
    bmiResult.querySelector("strong").textContent = value.toFixed(1);
    const categoryElement = bmiResult.querySelector("b");
    categoryElement.textContent = category;
    bmiResult.querySelector("strong").style.color = color;
    categoryElement.style.color = color;
    bmiMessage.textContent = "A useful baseline—your coach can help you make it meaningful.";
    bmiMessage.classList.remove("error");
  });

  // Gallery lightbox
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("p");
  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("lightbox-open");
  };
  document.querySelectorAll(".gallery-item").forEach(item => item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.image;
    lightboxImage.alt = item.querySelector("img").alt;
    lightboxCaption.textContent = item.dataset.caption;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("lightbox-open");
    lightbox.querySelector("button").focus();
  }));
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") { closeLightbox(); closeMenu(); } });

  // Testimonial slider
  const track = document.querySelector(".testimonial-track");
  const cards = [...document.querySelectorAll(".testimonial-card")];
  const dotsContainer = document.querySelector(".slide-dots");
  let activeSlide = 0;
  const slidesPerView = () => window.innerWidth <= 760 ? 1 : 3;
  const maxSlide = () => Math.max(0, cards.length - slidesPerView());
  const updateSlider = () => {
    activeSlide = Math.min(activeSlide, maxSlide());
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 14;
    track.style.transform = `translateX(-${activeSlide * (cardWidth + gap)}px)`;
    [...dotsContainer.children].forEach((dot, index) => dot.classList.toggle("active", index === activeSlide));
  };
  const createDots = () => {
    dotsContainer.innerHTML = "";
    for (let i = 0; i <= maxSlide(); i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
      dot.addEventListener("click", () => { activeSlide = i; updateSlider(); });
      dotsContainer.appendChild(dot);
    }
    updateSlider();
  };
  document.querySelector(".slider-next").addEventListener("click", () => { activeSlide = activeSlide >= maxSlide() ? 0 : activeSlide + 1; updateSlider(); });
  document.querySelector(".slider-prev").addEventListener("click", () => { activeSlide = activeSlide <= 0 ? maxSlide() : activeSlide - 1; updateSlider(); });
  window.addEventListener("resize", createDots);
  createDots();

  // Contact and newsletter validation. Forms stay local: no personal data is transmitted.
  const contactForm = document.querySelector("#contact-form");
  const contactMessage = document.querySelector("#contact-message");
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      contactMessage.textContent = "Please complete the required details before sending your request.";
      contactMessage.classList.add("error");
      const firstInvalid = contactForm.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    const firstName = contactForm.elements.firstName.value.trim();
    contactForm.reset();
    contactMessage.textContent = "Tour request received. We'll be in touch shortly.";
    contactMessage.classList.remove("error");
    showToast(`Thanks${firstName ? `, ${firstName}` : ""}! Your tour request is on its way.`);
  });
  const newsletter = document.querySelector("#newsletter-form");
  const newsletterMessage = document.querySelector("#newsletter-message");
  newsletter.addEventListener("submit", event => {
    event.preventDefault();
    const email = newsletter.elements.newsletterEmail;
    if (!email.validity.valid) {
      newsletterMessage.textContent = "Enter a valid email address.";
      newsletterMessage.classList.add("error");
      email.focus();
      return;
    }
    newsletter.reset();
    newsletterMessage.textContent = "You’re on the list. See you in your inbox.";
    newsletterMessage.classList.remove("error");
    showToast("Welcome to the Forge weekly.");
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
});

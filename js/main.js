document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  function handleScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  menuToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !navLinks?.classList.contains("open")) return;

    navLinks.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    menuToggle?.focus();
  });

  const heroImages = [
    "assets/hero/hero-1.webp",
    "assets/hero/hero-2.webp",
  ];
  const heroLayers = [...document.querySelectorAll(".hero-background-image")];

  if (heroLayers.length === 2 && heroImages.length > 0) {
    const loadImage = (src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = () => resolve(null);
      image.src = src;
    });

    Promise.all(heroImages.map(loadImage)).then((results) => {
      const availableImages = results.filter(Boolean);
      if (availableImages.length === 0) return;

      let currentImage = 0;
      let activeLayer = 0;
      heroLayers[0].src = availableImages[0];

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || availableImages.length === 1) return;

      window.setInterval(() => {
        currentImage = (currentImage + 1) % availableImages.length;
        const nextLayer = activeLayer === 0 ? 1 : 0;

        heroLayers[nextLayer].src = availableImages[currentImage];
        heroLayers[nextLayer].classList.add("is-active");
        heroLayers[activeLayer].classList.remove("is-active");
        activeLayer = nextLayer;
      }, 10000);
    });
  }
});

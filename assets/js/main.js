/* =====================================================================
   Сайт автора — макет. Небольшие сценарии без библиотек:
   1) места для изображений: заглушка, пока файла нет в папке;
   2) мобильное меню;
   3) линия под шапкой после начала прокрутки;
   4) подсказка при нажатии на ссылку-заглушку;
   5) подсветка текущего раздела в меню;
   6) текущий год в подвале.
   ===================================================================== */
(function () {
  "use strict";

  /* 1. Изображения. Ошибки, случившиеся до загрузки этого файла,
        ловит короткий скрипт в <head>; здесь — проверка на всякий случай. */
  document.querySelectorAll("[data-slot] img").forEach(function (img) {
    var slot = img.closest("[data-slot]");
    function update() {
      if (!img.complete) return;
      slot.classList.toggle("is-empty", img.naturalWidth === 0);
    }
    img.addEventListener("load", update);
    img.addEventListener("error", update);
    update();
  });

  /* 2. Мобильное меню */
  var header = document.querySelector("[data-header]");
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var toggleLabel = document.querySelector("[data-nav-toggle-label]");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggleLabel.textContent = open ? "Закрыть меню" : "Открыть меню";
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
  }

  if (header && nav && toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) {
        setMenu(false);
      }
    });
    var desktop = window.matchMedia("(min-width: 960px)");
    var closeOnDesktop = function (event) { if (event.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", closeOnDesktop);
  }

  /* 3. Линия под шапкой */
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 4. Ссылки-заглушки (атрибут data-placeholder): вместо перехода — подсказка.
        Когда появится настоящая ссылка, удалите у неё атрибут data-placeholder. */
  var toast = document.querySelector("[data-toast]");
  var toastTimer;
  document.addEventListener("click", function (event) {
    var link = event.target.closest("[data-placeholder]");
    if (!link || !toast) return;
    event.preventDefault();
    toast.textContent = link.getAttribute("data-placeholder");
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  });

  /* 5. Подсветка текущего раздела */
  if (nav && "IntersectionObserver" in window) {
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var setCurrent = function (id) {
      Object.keys(links).forEach(function (key) {
        if (key === id) links[key].setAttribute("aria-current", "true");
        else links[key].removeAttribute("aria-current");
      });
    };
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id || null);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    var hero = document.querySelector("[data-hero]");
    if (hero) observer.observe(hero);
    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* 6. Год в подвале */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

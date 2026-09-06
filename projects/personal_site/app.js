(function () {
  var routes = {
    "": "about",
    "about": "about",
    "projects": "projects",
    "drawings": "drawings"
  };

  function selectView(view) {
    var about = document.getElementById("view-about");
    var projects = document.getElementById("view-projects");
    var drawings = document.getElementById("view-drawings");
    if (!about || !projects || !drawings) return;

    about.style.display = view === "about" ? "block" : "none";
    projects.style.display = view === "projects" ? "block" : "none";
    drawings.style.display = view === "drawings" ? "block" : "none";

    var links = document.querySelectorAll('.nav-links .nav-button');
    links.forEach(function (a) {
      a.classList.remove('active');
      var hash = (a.getAttribute('href') || '').replace('#', '');
      if (routes[hash] === view) {
        a.classList.add('active');
      }
    });

    var toggle = document.getElementById('nav-toggle');
    if (toggle) {
      toggle.checked = false;
    }
  }

  function handleRoute() {
    var hash = location.hash.replace('#', '');
    var view = routes.hasOwnProperty(hash) ? routes[hash] : 'about';
    selectView(view);
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', handleRoute);
})();



(function () {
  "use strict";

  var baseurl = window.GameClub ? window.GameClub.baseurl : "";
  var map;
  var search;
  var debounceTimer;

  function init() {
    map = window.GameClubMap.init();

    fetch(baseurl + "/api/clubs.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (clubs) {
        search = window.GameClubSearch.init(clubs);
        restoreFromUrl();
        update();
        bindEvents();
      })
      .catch(function (err) {
        console.error("Failed to load clubs:", err);
      });
  }

  function restoreFromUrl() {
    var params = readUrlParams();
    var searchInput = document.getElementById("search-input");
    var searchInputMobile = document.getElementById("search-input-mobile");
    var dayFilter = document.getElementById("day-filter");
    var distanceFilter = document.getElementById("distance-filter");

    if (params.q) {
      search.setQuery(params.q);
      if (searchInput) searchInput.value = params.q;
      if (searchInputMobile) searchInputMobile.value = params.q;
    }
    if (params.day) {
      search.setDayFilter(params.day);
      if (dayFilter) dayFilter.value = params.day;
    }
    if (params.distance) {
      search.setMaxDistance(params.distance);
      if (distanceFilter) distanceFilter.value = params.distance;
    }
  }

  function readUrlParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get("q") || "",
      day: params.get("day") || "",
      distance: params.get("distance") || ""
    };
  }

  function writeUrlParams() {
    var searchInput = document.getElementById("search-input");
    var dayFilter = document.getElementById("day-filter");
    var distanceFilter = document.getElementById("distance-filter");

    var params = new URLSearchParams();
    var q = searchInput ? searchInput.value.trim() : "";
    var day = dayFilter ? dayFilter.value : "";
    var distance = distanceFilter ? distanceFilter.value : "";

    if (q) params.set("q", q);
    if (day) params.set("day", day);
    if (distance) params.set("distance", distance);

    var newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    history.replaceState(null, "", newUrl);
  }

  function update() {
    var filtered = search.getFiltered();
    map.addClubs(filtered);
    map.fitToMarkers();
    renderCards(filtered);
    updateResultCount(filtered.length, search.allClubs.length);
    writeUrlParams();
  }

  function renderCards(clubs) {
    var container = document.getElementById("club-list");
    if (!container) return;

    if (clubs.length === 0) {
      container.innerHTML =
        '<p style="color:#555;text-align:center;padding:2rem 0;">No clubs match your search. Try a different filter or search term.</p>';
      return;
    }

    var html = clubs
      .map(function (club) {
        var tags = '<span class="tag tag-day">' + escapeHtml(club.day) + "</span>";

        if (club.secondary_days) {
          club.secondary_days.forEach(function (d) {
            tags += '<span class="tag tag-day">' + escapeHtml(d) + "</span>";
          });
        }

        if (club.frequency && club.frequency !== "Weekly") {
          tags += '<span class="tag">' + escapeHtml(club.frequency) + "</span>";
        }

        if (club.cost) {
          tags += '<span class="tag tag-cost">' + escapeHtml(club.cost) + "</span>";
        }

        var distanceBadge = "";
        if (club._distance !== undefined) {
          distanceBadge =
            '<span class="club-distance">' +
            club._distance.toFixed(1) +
            " mi</span>";
        }

        var icon = "";
        if (club.image) {
          var imgSrc = club.image.indexOf("://") !== -1
            ? escapeHtml(club.image)
            : baseurl + "/assets/images/clubs/" + encodeURIComponent(club.image);
          icon = '<div class="club-icon-wrap"><img src="' + imgSrc + '" alt="" loading="lazy" onload="window.GameClub.applyImgBg(this)"></div>';
        }

        return (
          '<a class="club-card" href="' +
          escapeHtml(club.url) +
          '">' +
          '<div class="club-card-body">' +
          icon +
          '<div class="club-card-content">' +
          '<div class="club-card-header">' +
          '<div class="club-name">' +
          escapeHtml(club.name) +
          "</div>" +
          distanceBadge +
          "</div>" +
          '<div class="club-tags">' +
          tags +
          "</div>" +
          "</div>" +
          "</div>" +
          "</a>"
        );
      })
      .join("");

    container.innerHTML = html;
  }

  function updateResultCount(shown, total) {
    var el = document.getElementById("result-count");
    if (!el) return;

    var text;
    if (shown === total) {
      text = total + " clubs";
    } else {
      text = "Showing " + shown + " of " + total + " clubs";
    }

    var locationLabel = window.GameClubLocation && window.GameClubLocation.getActiveLabel
      ? window.GameClubLocation.getActiveLabel()
      : null;

    if (locationLabel) {
      text += " \u00b7 sorted by nearest to " + locationLabel;
    }

    el.textContent = text;
  }

  function bindEvents() {
    var searchInput = document.getElementById("search-input");
    var searchInputMobile = document.getElementById("search-input-mobile");
    var dayFilter = document.getElementById("day-filter");
    var distanceFilter = document.getElementById("distance-filter");

    // Sync both search inputs
    function onSearchInput(source, other) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (other) other.value = source.value;
        search.setQuery(source.value);
        update();
      }, 200);
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        onSearchInput(searchInput, searchInputMobile);
      });
    }
    if (searchInputMobile) {
      searchInputMobile.addEventListener("input", function () {
        onSearchInput(searchInputMobile, searchInput);
      });
    }

    // Day filter
    if (dayFilter) {
      dayFilter.addEventListener("change", function () {
        search.setDayFilter(dayFilter.value);
        update();
      });
    }

    // Distance filter
    if (distanceFilter) {
      distanceFilter.addEventListener("change", function () {
        search.setMaxDistance(distanceFilter.value);
        update();
      });
    }

    // Location autocomplete + geolocation
    window.GameClubLocation.init(
      function (lat, lng, label) {
        // Clear text search when a location is selected via postcode
        search.setQuery("");
        if (searchInput) searchInput.value = "";
        if (searchInputMobile) searchInputMobile.value = "";
        search.setUserLocation(lat, lng);
        map.showUserLocation(lat, lng);
        // Enable distance filter
        if (distanceFilter) distanceFilter.disabled = false;
        update();
      },
      function () {
        search.clearUserLocation();
        search.setMaxDistance(0);
        map.removeUserLocation();
        // Reset and disable distance filter
        if (distanceFilter) {
          distanceFilter.value = "";
          distanceFilter.disabled = true;
        }
        update();
      }
    );
  }

  function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // Toggle shadow on filter bar when sidebar is scrolled
  function initSidebarScroll() {
    var sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    sidebar.addEventListener("scroll", function () {
      sidebar.classList.toggle("sidebar--scrolled", sidebar.scrollTop > 0);
    });
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
      initSidebarScroll();
    });
  } else {
    init();
    initSidebarScroll();
  }
})();

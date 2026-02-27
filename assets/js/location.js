(function () {
  "use strict";

  // Matches partial UK postcodes: "SW1", "LS6 3", "EC2A 1NT", etc.
  var POSTCODE_RE = /^[A-Z]{1,2}\d/i;

  var GameClubLocation = {
    input: null,
    suggestions: null,
    pill: null,
    pillLabel: null,
    clearBtn: null,
    locateBtn: null,
    debounceTimer: null,
    onLocationSet: null,
    onLocationClear: null,
    activeLabel: null,

    init: function (onLocationSet, onLocationClear) {
      this.onLocationSet = onLocationSet;
      this.onLocationClear = onLocationClear;
      this.input = document.getElementById("search-input");
      this.suggestions = document.getElementById("location-suggestions");
      this.pill = document.getElementById("location-pill");
      this.pillLabel = document.getElementById("location-pill-label");
      this.clearBtn = document.getElementById("location-clear");
      this.locateBtn = document.getElementById("locate-btn");

      if (!this.input) return this;

      this.bindEvents();
      return this;
    },

    bindEvents: function () {
      var self = this;

      // Watch the search input for postcode patterns
      this.input.addEventListener("input", function () {
        clearTimeout(self.debounceTimer);
        var query = self.input.value.trim();

        if (query.length >= 2 && POSTCODE_RE.test(query)) {
          self.debounceTimer = setTimeout(function () {
            self.fetchSuggestions(query);
          }, 300);
        } else {
          self.hideSuggestions();
        }
      });

      this.input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          self.hideSuggestions();
        }
      });

      document.addEventListener("click", function (e) {
        if (
          self.suggestions &&
          !self.input.contains(e.target) &&
          !self.suggestions.contains(e.target)
        ) {
          self.hideSuggestions();
        }
      });

      if (this.clearBtn) {
        this.clearBtn.addEventListener("click", function () {
          self.clearLocation();
        });
      }

      if (this.locateBtn) {
        this.locateBtn.addEventListener("click", function () {
          self.geolocate();
        });
      }
    },

    fetchSuggestions: function (query) {
      var self = this;

      fetch("https://api.postcodes.io/postcodes/" + encodeURIComponent(query) + "/autocomplete")
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.result && data.result.length > 0) {
            self.showSuggestions(data.result);
          } else {
            self.hideSuggestions();
          }
        })
        .catch(function () {
          self.hideSuggestions();
        });
    },

    showSuggestions: function (postcodes) {
      var self = this;
      this.suggestions.innerHTML = postcodes
        .map(function (pc) {
          return '<button class="location-suggestion" type="button" data-postcode="' + pc + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
            pc + '</button>';
        })
        .join("");

      this.suggestions.classList.add("is-visible");

      var buttons = this.suggestions.querySelectorAll(".location-suggestion");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
          self.selectPostcode(this.getAttribute("data-postcode"));
        });
      }
    },

    hideSuggestions: function () {
      if (!this.suggestions) return;
      this.suggestions.innerHTML = "";
      this.suggestions.classList.remove("is-visible");
    },

    selectPostcode: function (postcode) {
      var self = this;
      this.input.value = "";
      this.hideSuggestions();

      fetch("https://api.postcodes.io/postcodes/" + encodeURIComponent(postcode))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.result) {
            self.setActive(postcode);
            if (self.onLocationSet) {
              self.onLocationSet(data.result.latitude, data.result.longitude, postcode);
            }
          }
        })
        .catch(function (err) {
          console.error("Failed to look up postcode:", err);
        });
    },

    geolocate: function () {
      var self = this;

      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      this.locateBtn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          self.setActive("My location");
          self.locateBtn.disabled = false;

          if (self.onLocationSet) {
            self.onLocationSet(lat, lng, "My location");
          }
        },
        function () {
          self.locateBtn.disabled = false;
          alert("Unable to retrieve your location.");
        }
      );
    },

    setActive: function (label) {
      this.activeLabel = label;
      if (this.pill) {
        this.pillLabel.textContent = label;
        this.pill.style.display = "";
      }
    },

    clearLocation: function () {
      this.activeLabel = null;
      if (this.pill) {
        this.pill.style.display = "none";
      }
      this.input.focus();
      if (this.onLocationClear) {
        this.onLocationClear();
      }
    },

    getActiveLabel: function () {
      return this.activeLabel;
    },
  };

  window.GameClubLocation = GameClubLocation;
})();

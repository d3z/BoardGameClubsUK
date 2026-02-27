(function () {
  "use strict";

  var GameClubSearch = {
    allClubs: [],
    searchQuery: "",
    dayFilter: "",
    maxDistance: 0,
    userLat: null,
    userLng: null,

    init: function (clubs) {
      this.allClubs = clubs;
      return this;
    },

    setQuery: function (query) {
      this.searchQuery = query.toLowerCase().trim();
    },

    setDayFilter: function (day) {
      this.dayFilter = day;
    },

    setMaxDistance: function (miles) {
      this.maxDistance = miles ? parseFloat(miles) : 0;
    },

    setUserLocation: function (lat, lng) {
      this.userLat = lat;
      this.userLng = lng;
    },

    clearUserLocation: function () {
      this.userLat = null;
      this.userLng = null;
      this.allClubs.forEach(function (club) {
        delete club._distance;
      });
    },

    getFiltered: function () {
      var self = this;

      // Compute distances first if location is set (needed for distance filter)
      if (self.userLat !== null && self.userLng !== null) {
        self.allClubs.forEach(function (club) {
          club._distance = self.haversine(
            self.userLat,
            self.userLng,
            club.location.lat,
            club.location.lng
          );
        });
      }

      var results = this.allClubs.filter(function (club) {
        // Text search
        if (self.searchQuery) {
          var haystack = [
            club.name,
            club.location.name,
            club.location.address,
            club.description,
            club.day,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (haystack.indexOf(self.searchQuery) === -1) return false;
        }

        // Day filter
        if (self.dayFilter) {
          var matchesDay = club.day === self.dayFilter;
          if (!matchesDay && club.secondary_days) {
            matchesDay = club.secondary_days.indexOf(self.dayFilter) !== -1;
          }
          if (!matchesDay) return false;
        }

        // Distance filter (only when location is set)
        if (self.maxDistance > 0 && club._distance !== undefined) {
          if (club._distance > self.maxDistance) return false;
        }

        return true;
      });

      // Sort by distance if user location is known
      if (self.userLat !== null && self.userLng !== null) {
        results.sort(function (a, b) {
          return a._distance - b._distance;
        });
      }

      return results;
    },

    haversine: function (lat1, lng1, lat2, lng2) {
      var R = 3959; // miles
      var dLat = this.toRad(lat2 - lat1);
      var dLng = this.toRad(lng2 - lng1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) *
          Math.cos(this.toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },

    toRad: function (deg) {
      return (deg * Math.PI) / 180;
    },
  };

  window.GameClubSearch = GameClubSearch;
})();

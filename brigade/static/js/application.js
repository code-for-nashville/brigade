window.Brigade = window.Brigade || {};

window.Brigade.initializeMap = function(geoJSON) {
  // Provide your access token
  L.mapbox.accessToken = 'pk.eyJ1IjoiY29kZWZvcmFtZXJpY2EiLCJhIjoiSTZlTTZTcyJ9.3aSlHLNzvsTwK-CYfZsG_Q';

  // Create a map in the div #map
  var map = L.mapbox.map('map', 'codeforamerica.map-hhckoiuj');

  var geocoderControl = L.mapbox.geocoderControl('mapbox.places', { 
    keepOpen: true, 
    autocomplete : true,
    queryOptions: {
      country: "us"
    }
  });
  geocoderControl.setPosition('topright');
  geocoderControl.addTo(map);

  map.addEventListener('ready', function() {

    $('.leaflet-control-mapbox-geocoder-form input').attr("placeholder","Search map");

    // After selecting a geocoder result, replace the search text with the place name and hide the geocoder results
    geocoderControl.on('select', function(result){
      $('#map input').val(result.feature.place_name);
      $('#map .leaflet-control-mapbox-geocoder-results').hide();
    });
    
    // Make sure the geocoder results are showing when input is entered into geocoder search
    $('#map input').keyup(function(){
      $('#map .leaflet-control-mapbox-geocoder-results').show();
    });

    // Prevent the page from jumping to the top when clicking on the geocoder 'searchglass' icon
    $('a.leaflet-control-mapbox-geocoder-toggle').on('click', function(event){
      event.preventDefault();
    });

  });

  map.zoomControl.setPosition('topright');

  var latlon = [44, -98], zoom = 3;

  map.setView(latlon, zoom);
  map.featureLayer.setGeoJSON(geoJSON);

  map.featureLayer.on('click', function(e) {
    var brigadeName = e.layer.feature.properties.name;

    ga('send', 'event', {
      eventCategory: 'Map Click',
      eventAction: 'click',
      eventLabel: brigadeName,

      // see: https://developers.google.com/analytics/devguides/collection/analyticsjs/events
      // Supported in modern non-Safari browsers.
      transport: 'beacon'
    });

    var brigadeId = brigadeName.replace(/\s+/g, '-');
    window.open(brigadeId, "_self");
  });

  // Add hover tooltips with Brigade name to map markers
  map.featureLayer.eachLayer(function(layer) {
    layer.bindPopup(layer.feature.properties.name);
  });
  map.featureLayer.on('mouseover', function(e) {
    e.layer.openPopup();
  });
  map.featureLayer.on('mouseout', function(e) {
    e.layer.closePopup();
  });

};

window.Brigade.initializeProjects = function(id, query, status) {
  $(id).masonry({
    itemSelector: '.project',
    "gutter" : 20
  });

  if (query) {
    ga('send', 'event', 'Project Search', 'search', query, 1);
  }

  if (status) {
    ga('send', 'event', 'Project Search', 'search', status, 1);
  }
};

window.Brigade.init = function() {
  // Generate list of brigades
  if ($(window).width() > 480){
    $('body#home #overview').css("height", ($(window).height() - $(".global-header").height()));
  }

  // Track all link clicks as explicit events.
  //
  // The event's label will be given by either the <a title> attribute or the
  // link URL.
  //
  // Override the event's category with `data-target-category`, e.g.:
  //   <a data-target-category="Some Other Event Category">
  $(document).on('click', 'a', function(el) {
    const targetHref = el.target.href;
    const targetTitle = el.target.title;
    const targetCategory = el.target.dataset.analyticsCategory;
    const isExternal = !targetHref.startsWith(window.location.origin);

    ga('send', 'event', {
      eventCategory: targetCategory || (isExternal ? 'External Link Click' : 'Link Click'),
      eventAction: 'click',
      eventLabel: targetTitle || targetHref,

      // see: https://developers.google.com/analytics/devguides/collection/analyticsjs/events
      // Supported in modern non-Safari browsers.
      transport: 'beacon'
    })
  });
};

document.addEventListener('DOMContentLoaded', window.Brigade.init);


(function ($) {

  var dialog;
  var google_map_field_map;

  googleMapFieldSetter = function(delta) {

    btns = {};

    btns[Drupal.t('Insert map')] = function () {
      var latlng = google_map_field_map.getCenter();
      var zoom = google_map_field_map.getZoom();
      $('input[data-lat-delta="'+delta+'"]').attr('value', latlng.lat());
      $('input[data-lng-delta="'+delta+'"]').attr('value', latlng.lng());
      $('input[data-zoom-delta="'+delta+'"]').attr('value', zoom);
      $('.google-map-field-preview[data-delta="'+delta+'"]').attr('data-lat', latlng.lat());
      $('.google-map-field-preview[data-delta="'+delta+'"]').attr('data-lng', latlng.lng());
      $('.google-map-field-preview[data-delta="'+delta+'"]').attr('data-zoom', zoom);
      googleMapFieldPreviews();
      $(this).dialog("close");
    };

    btns[Drupal.t('Cancel')] = function () {
      $(this).dialog("close");
    };

    dialogHTML = '';
    dialogHTML += '<div id="google_map_field_dialog">';
    dialogHTML += '  <p>' + Drupal.t('Use the map below to drop a marker at the required location.') + '</p>';
    dialogHTML += '  <div id="gmf_container"></div>';
    dialogHTML += '  <div id="centre_on">';
    dialogHTML += '    <label>Enter an address/town/postcode etc to centre the map on:<input type="text" name="centre_map_on" id="centre_map_on" value=""/></label>';
    dialogHTML += '    <button onclick="return doCentre();" type="button" role="button">find</button>';
    dialogHTML += '    <div id="map_error"></div>';
    dialogHTML += '  </div>';
    dialogHTML += '</div>';

    $('body').append(dialogHTML);

    dialog = $('#google_map_field_dialog').dialog({
      modal: true,
      autoOpen: false,
      width: 750,
      height: 550,
      closeOnEscape: true,
      resizable: false,
      draggable: false,
      title: Drupal.t('Set Map Marker'),
      dialogClass: 'jquery_ui_dialog-dialog',
      buttons: btns,
      close: function(event, ui) {
        $(this).dialog('destroy').remove();
      }
    });

    dialog.dialog('open');

    // Create the map setter map.
    // get the lat/lon from form elements
    var lat = $('input[data-lat-delta="'+delta+'"]').attr('value');
    var lng = $('input[data-lng-delta="'+delta+'"]').attr('value');
    var zoom = $('input[data-zoom-delta="'+delta+'"]').attr('value');

    lat = googleMapFieldValidateLat(lat);
    lng = googleMapFieldValidateLng(lng);

    if (zoom == null || zoom == '') {
      var zoom = '9';
    }

    var latlng = new google.maps.LatLng(lat, lng);
    var mapOptions = {
      zoom: parseInt(zoom),
      center: latlng,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    google_map_field_map = new google.maps.Map(document.getElementById("gmf_container"), mapOptions);

    // drop a marker at the specified lat/lng coords
    marker = new google.maps.Marker({
      position: latlng,
      optimized: false,
      draggable: true,
      map: google_map_field_map
    });

    // add a click listener for marker placement
    google.maps.event.addListener(google_map_field_map, "click", function(event) {
      latlng = event.latLng;
      marker.setMap(null);
      google_map_field_map.panTo(latlng);
      marker = new google.maps.Marker({
        position: latlng,
        optimized: false,
        draggable: true,
        map: google_map_field_map
      });
    });
    google.maps.event.addListener(marker, 'dragend', function(event) {
      google_map_field_map.panTo(event.latLng);
    });
    return false;
  }

  googleMapFieldPreviews = function() {

    $('.google-map-field-preview').each(function() {
      var data_delta = $(this).attr('data-delta');
      var data_name  = $('input[data-name-delta="'+data_delta+'"]').val();
      var data_lat   = $('input[data-lat-delta="'+data_delta+'"]').val();
      var data_lng   = $('input[data-lng-delta="'+data_delta+'"]').val();
      var data_zoom  = $('input[data-zoom-delta="'+data_delta+'"]').val();

      data_lat = googleMapFieldValidateLat(data_lat);
      data_lng = googleMapFieldValidateLng(data_lng);

      if (data_zoom == null || data_zoom == '') {
        var data_zoom = '9';
      }

      var latlng = new google.maps.LatLng(data_lat, data_lng);

      // Create the map preview.
      var mapOptions = {
        zoom: parseInt(data_zoom),
        center: latlng,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      google_map_field_map = new google.maps.Map(this, mapOptions);

      // drop a marker at the specified lat/lng coords
      marker = new google.maps.Marker({
        position: latlng,
        optimized: false,
        map: google_map_field_map
      });

      $('#map_setter_' + data_delta).unbind();
      $('#map_setter_' + data_delta).bind('click', function(event) {
        event.preventDefault();
        googleMapFieldSetter($(this).attr('data-delta'));
      });

    });  // end .each

  }

  googleMapFieldValidateLat = function(lat) {
    lat = parseFloat(lat);
    if (lat >= -180 && lat <= 180) {
      return lat;
    }
    else {
      return '51.524295';
    }
  }

  googleMapFieldValidateLng = function(lng) {
    lng = parseFloat(lng);
    if (lng >= -90 && lng <= 90) {
      return lng;
    }
    else {
      return '-0.127990';
    }
  }

  doCentre = function() {
    var centreOnVal = $('#centre_map_on').val();

    if (centreOnVal == '' || centreOnVal == null) {
      $('#centre_map_on').css("border", "1px solid red");
      $('#map_error').html(Drupal.t('Enter a value in the field provided.'));
      return false;
    }
    else {
      $('#centre_map_on').css("border", "1px solid lightgrey");
      $('#map_error').html('');
    }

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': centreOnVal}, function (result, status) {
      if (status == 'OK') {
        var latlng = new google.maps.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
        google_map_field_map.panTo(latlng);
        marker.setMap(null);
        marker = new google.maps.Marker({
          position: latlng,
          draggable: true,
          map: google_map_field_map
        });
        google.maps.event.addListener(marker, 'dragend', function(event) {
          google_map_field_map.panTo(event.latLng);
        });
        $('#centre_map_on').val('');
      } else {
        $('#map_error').html(Drupal.t('Could not find location.'));
      }
    });

    return false;

  }

})(jQuery);


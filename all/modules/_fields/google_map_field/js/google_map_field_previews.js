
/**
 * @file
 * This file contains the javascript functions used by the google map field
 * widget.
 */

/**
 * Add code to generate the maps on page load.
 */
(function ($) {

  Drupal.behaviors.google_map_field = {
    attach: function (context) {

      googleMapFieldPreviews();

    }
  };

})(jQuery);

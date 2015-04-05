<?php

/**
 * @file
 * Default theme implementation for google map fields.
 *
 * Available variables:
 * - $name: the display name of the map
 * - $map_id: a unique ID for the map.
 *   to identify the map container.
 */

?>
<div class="google-map-field">
  <div class="google-map-field-label">
    <?php print $name; ?>
  </div>
  <div class="google_map_field_display" data-lat="<?php print $lat; ?>" data-lng="<?php print $lng; ?>" data-zoom="<?php print $zoom; ?>"></div>
</div>

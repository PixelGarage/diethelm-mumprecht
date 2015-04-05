<?php
/**
 * @file
 * Default view template to display sort button for each sort criteria in a magical Isotope layout.
 */
?>
<div class="ui-group">
  <?php if ($title): ?>
    <h3 class="group-title"><?php print $title; ?></h3>
  <?php endif; ?>
  <div id="<?php print $button_group_id; ?>" class="sorting button-group clearfix">
    <?php if ($reset_label): ?>
      <span class="button reset selected" data-sort-by="original-order"><?php print $reset_label; ?></span>
    <?php endif; ?>
    <?php foreach ($rows as $id => $row): ?>
      <span class="button <?php print $classes_array[$id]; ?>" data-sort-by="<?php print $sort_criteria[$id]; ?>"><?php print $row; ?></span>
    <?php endforeach; ?>
  </div>
</div>


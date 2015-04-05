<?php
/**
 * @file
 * Default view template to display content in a magical Isotope layout.
 */
?>
<!-- add a grid-sizer and gutter-sizer element to the isotope container to allow responsive grid layouts -->
<div class="isotope">
  <div class="grid-sizer"></div>
  <div class="gutter-sizer"></div>
  <div class="stamp stamp1"></div>
  <?php foreach ($rows as $id => $row): ?>
    <div class="isotope-item <?php if ($classes_array[$id]) print $classes_array[$id]; ?> <?php if ($filter_classes[$id]) print $filter_classes[$id]; ?>" <?php if ($sort_attributes[$id]) print $sort_attributes[$id]; ?>>
      <?php print $row; ?>
    </div>
  <?php endforeach; ?>
</div>

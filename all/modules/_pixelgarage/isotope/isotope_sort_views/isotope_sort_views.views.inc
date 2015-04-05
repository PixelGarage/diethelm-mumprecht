<?php
/**
 * @file
 * Defines a views style plugin to add a sort button group for an Isotope view.
 */

/**
 * Implements hook_views_plugins().
 */
function isotope_sort_views_views_plugins() {
  return array(
    'style' => array(
      'isotope_sort_views' => array(
        'title' => t('Isotope sorting'),
        'handler' => 'views_plugin_style_isotope_sort_views',
        'uses options' => TRUE,
        'help' => t("Display a sort button group for an Isotope layout."),
        'theme' => 'views_view_isotope_sort', // theme hook
        'type' => 'normal',
        'uses row plugin' => TRUE,
        'uses row class' => TRUE,
        'uses grouping' => FALSE,
      ),
    ),
  );
}


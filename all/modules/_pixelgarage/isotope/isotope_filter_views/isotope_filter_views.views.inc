<?php
/**
 * @file
 * Defines a views style plugin to add a filter button group for an Isotope view.
 */

/**
 * Implements hook_views_plugins().
 */
function isotope_filter_views_views_plugins() {
  return array(
    'style' => array(
      'isotope_filter_views' => array(
        'title' => t('Isotope filters'),
        'handler' => 'views_plugin_style_isotope_filter_views',
        'uses options' => TRUE,
        'help' => t("Display a filter button group for an Isotope layout."),
        'theme' => 'isotope_filter_tree', // theme hook
        'type' => 'normal',
        'uses row plugin' => TRUE,
        'uses row class' => TRUE,
        'uses grouping' => FALSE,
      ),
    ),
  );
}


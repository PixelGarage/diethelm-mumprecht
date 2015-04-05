<?php
/**
 * @file
 * Defines a views style plugin to add Isotope magical layouts to views.
 */

/**
 * Implements hook_views_plugins().
 */
function isotope_views_views_plugins() {
  return array(
    'style' => array(
      'isotope_views' => array(
        'title' => t('Isotope layouts'),
        'handler' => 'views_plugin_style_isotope_views',
        'uses options' => TRUE,
        'help' => t("Display content in magical Isotope layouts."),
        'theme' => 'views_view_isotope', // theme hook
        'type' => 'normal',
        'uses row plugin' => TRUE,
        'uses row class' => TRUE,
        'uses grouping' => FALSE,
      ),
    ),
  );
}


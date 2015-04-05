<?php
/**
 * @file
 * Defines a views pager plugin to provide infinite page scrolling for an isotope container.
 */

/**
 * Implements hook_views_plugin().
 */
function isotope_iscroll_views_views_plugins() {
  return array(
    'module' => 'isotope_iscroll_views',
    'pager' => array(
      'isotope_iscroll_views' => array(
        'title' => t('Isotope Infinite Scroll'),
        'help' => t('Provides infinite scrolling for an isotope container'),
        'handler' => 'views_plugin_pager_isotope_iscroll_views',
        'uses options' => TRUE,
        'theme' => 'isotope_iscroll_pager', // theme hook
        'type' => 'normal',
      ),
    ),
  );
}

<?php

/**
 * The plugin to handle isotope's infinite scroll pager.
 *
 * @ingroup views_pager_plugins
 */
class views_plugin_pager_isotope_iscroll_views extends views_plugin_pager_full {
  function init(&$view, &$display, $options = array()) {
    parent::init($view, $display, $options);
  }

  function summary_title() {
    return format_plural($this->options['items_per_page'], '@count item per page. Isotope container infinite scrolling.', 'Paged, @count items each. Isotope container infinite scrolling.', array('@count' => $this->options['items_per_page']));
  }

  /**
   * Overrides views_plugin_pager_full::option_definition().
   *
   * Overrides the full pager options form by deleting unused settings.
   */
  function option_definition() {
    $options = parent::option_definition();

    // Get default options
    $default_options = isotope_iscroll_default_options();

    // Set default values for Isotope
    foreach ($default_options as $option => $default_value) {
      $options[$option] = array(
        'default' => $default_value,
      );
      if (is_int($default_value)) {
        $options[$option]['bool'] = TRUE;
      }
      if (is_string($default_value)) {
        $options[$option]['translatable'] = TRUE;
      }
    }

    return $options;
  }

  /**
   * Overrides views_plugin_pager_full::options_form().
   *
   * Overrides the full pager options form by deleting unused settings.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);
    unset($form['offset']);
    unset($form['id']);
    unset($form['total_pages']);
    unset($form['quantity']);
    unset($form['tags']['first']);
    unset($form['tags']['last']);
    unset($form['tags']['previous']);

    // hide because of mandatory expose fields
    hide($form['expose']);

    // add Isotope filter options to views style form in a dedicated field set
    $form['isotope_iscroll'] = array(
      '#type' => 'fieldset',
      '#title' => t('Isotope infinite scrolling'),
    );

    // add filter options to form filled with saved values
    isotope_add_iscroll_options_to_form($form, $this->options);

    // Display each option field within the "Isotope infinite scrolling" fieldset
    foreach (isotope_iscroll_default_options() as $option => $default_value) {
      $form[$option]['#fieldset'] = 'isotope_iscroll';
    }

  }


  function render($input) {
    // render the infinite scrolling pager
    $tags = array(
      3 => $this->options['tags']['next'],
    );
    $pager_theme = views_theme_functions('isotope_iscroll_pager', $this->view, $this->display);
    return theme($pager_theme,
      array(
        'tags' => $tags,
        'items_per_page' => $this->options['items_per_page'],
        'element' => $this->options['id'],
        'view_class' => 'view-' . str_replace('_', '-', $this->view->name),
        'current_display' => $this->view->current_display,
        'options' => $this->options,
        'parameters' => $input,
      )
    );
  }
}

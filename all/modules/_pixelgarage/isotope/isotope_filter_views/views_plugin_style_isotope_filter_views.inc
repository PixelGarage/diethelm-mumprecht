<?php
/**
 * @file
 * Implements the Isotope filter views style plugin.
 */

class views_plugin_style_isotope_filter_views extends views_plugin_style {

  /**
   * Set default filter options.
   */
  function option_definition() {
    $options = parent::option_definition();

    // Get default options
    $default_options = isotope_filter_default_options();

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
   * Includes the Isotope filter option form into the views style form.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // add Isotope filter options to views style form in a dedicated field set
    $form['isotope_filter'] = array(
      '#type' => 'fieldset',
      '#title' => t('Isotope filters'),
    );
    if (isotope_installed()) {
      // add filter options to form filled with saved values
      isotope_add_filter_options_to_form($form, $this->options);

      // Display each option field within the "Isotope filters" fieldset
      foreach (isotope_filter_default_options() as $option => $default_value) {
        $form[$option]['#fieldset'] = 'isotope_filter';
      }

      // display help text for filter creation
      $form['isotope_filter_help'] = array(
        '#markup' => t('<h2>How to create isotope filter buttons</h2>' .
          '<p>With this style you can create a flat or hierarchical filter button group (block view) out of a taxonomy vocabulary. Isotope item filtering supports only taxonomies as filter criteria. ' .
          'The resulting button group is automatically connected to any Isotope container on the same page, if that container is enabled for filtering (contains filter classes for each item).</p>' .
          '<h4>How to create filter buttons for a taxonomy vocabulary?</h4> <ol>' .
          '<li>Create a new view (block) with a taxonomy vocabulary and a display style "Isotope filters".</li> ' .
          '<li>Choose Field row style (mandatory). In its settings dialog, disable the flag "Provide default field wrapper elements". This assures that the plain term value is listed without any wrapper.</li>' .
          '<li>Add the name of the taxonomy term as field and make sure that the flag "Link this field to its taxonomy term page" is disabled, as well as its label flag.</li>' .
          '<li>Choose some sort criteria if you want control over the order of the buttons.</li>' .
          '<li>That is it. See the help text in the "Isotope layout" format for a guide, how to enable filtering for the Isotope items.</li>' .
          '</ol><br>'),
        '#fieldset' => 'isotope_filter',
      );

      // display help text for hierarchical filter creation
      $form['isotope_filter_tree_help'] = array(
        '#markup' => t('<h4>How to create hierarchical filter buttons out of a hierarchical taxonomy vocabulary?</h4> <ol>' .
          '<li>Create a new view (block) with a hierarchical taxonomy vocabulary and select the display style "Isotope filters" and the row style "Fields" (mandatory).</li> ' .
          '<li>Disable the flag "Provide default field wrapper elements" in the Field Settings. This assures that the plain term value is listed without any wrapper.</li>' .
          '<li>Next we have to create the hierarchy of the terms, which is achieved by adding a relationship to the parent term id in the view.</li>' .
          '<ul><li>Add the "Relationship for taxonomy term: parent term" in the relationship section of the view. </li>' .
          '<li>In the fields section of the view: Add a field "taxonomy term id" (do not use relationship) and exclude it from display</li>' .
          '<li>Add a field "taxonomy term id" (with parent relationship), exclude it from display</li>' .
          '<li>Add a field "taxonomy term name", which is displayed and make sure that the flag "Link this field to its taxonomy term page" is disabled, as well as the label flag.</li></ul>' .
          '<li>Choose some sort criteria if you want to control the order of the buttons.</li>' .
          '<li>Further see help text in the "Isotope layout" format for a guide, how to enable filtering for the Isotope items.</li>' .
          '</ol><br>' .
          '<em>Remark:</em> If multiple Isotope containers are present in one page, only one container should be enabled for filtering.'),
        '#fieldset' => 'isotope_filter',
      );

    }
    else {
      // Disable Isotope as plugin is not installed
      $form['isotope_filter_disabled'] = array(
        '#markup' => t('These options have been disabled as the Isotope magical layouts plugin is not installed.'),
        '#fieldset' => 'isotope_filter',
      );
    }

  }

}


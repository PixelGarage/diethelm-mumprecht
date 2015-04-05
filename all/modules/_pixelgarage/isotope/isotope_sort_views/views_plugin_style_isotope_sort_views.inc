<?php
/**
 * @file
 * Implements the Isotope sort views style plugin.
 */

class views_plugin_style_isotope_sort_views extends views_plugin_style {

  /**
   * Set default sort options.
   */
  function option_definition() {
    $options = parent::option_definition();

    // Get default options
    $default_options = isotope_sort_default_options();

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
   * Includes the Isotope sort option form into the views style form.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // create a dedicated field set for sorting option fields
    $form['isotope_sort'] = array(
      '#type' => 'fieldset',
      '#title' => t('Isotope sorting'),
    );
    if (isotope_installed()) {
      // add sort options to form filled with saved values
      isotope_add_sort_options_to_form($form, $this->options);

      // Display each option field within the "Isotope sorting" fieldset
      foreach (isotope_sort_default_options() as $option => $default_value) {
        $form[$option]['#fieldset'] = 'isotope_sort';
      }

      // display help text for sorting support
      $form['isotope_sort_help'] = array(
        '#markup' => t('<h2>How to create isotope sort buttons</h2>' .
          '<p>With this style you can create a sort button group, which then is automatically connected to the Isotope container on the same page, ' .
          'if that container is enabled for sorting (meaning contains sort attributes for each item).</p><br>' .
          '<h4>"Best practice" to create a sort button group containing all sort criteria of the isotope items.</h4> <ol>' .
          '<li>Create a taxonomy vocabulary containing the sort criteria names as terms.</li> ' .
          '<li>The first vocabulary term defines the name for the first sort criteria in the rows sorting div-element (see Isotope layout for detailed explanation) and so on.</li>' .
          '<li>Create a new view (block) with the taxonomy vocabulary as view filter criteria.</li> ' .
          '<li>Select the format "Isotope sorting" in the view format section (you have it obviously already selected ;-). </li>' .
          '<li>Choose Field row style. In its settings dialog, disable the flag "Provide default field wrapper elements". This assures that the plain term value is listed without any wrapper.</li>' .
          '<li>Add the name of the taxonomy term as field and make sure that the flag "Link this field to its taxonomy term page" is disabled, as well as the label flag.</li>' .
          '<li>See help text in the "Isotope layout" format for a guide, how to enable sorting for the Isotope items.</li>' .
          '</ol><br>' .
          '<em>Remark:</em> Only one sort button group is supported per isotope container. If multiple Isotope containers are present in one page, only one container should be enabled for sorting.'),
        '#fieldset' => 'isotope_sort',
      );

    }
    else {
      // Disable Isotope as plugin is not installed
      $form['isotope_sort_disabled'] = array(
        '#markup' => t('These options have been disabled as the Isotope magical layouts plugin is not installed.'),
        '#fieldset' => 'isotope_sort',
      );
    }

  }

}


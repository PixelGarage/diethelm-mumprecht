<?php
/**
 * @file
 * Implements the Isotope views style plugin.
 */

class views_plugin_style_isotope_views extends views_plugin_style {

  /**
   * Set default options.
   */
  function option_definition() {
    $options = parent::option_definition();

    // Get default options
    $default_options = isotope_layout_default_options();

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
   * Includes the Isotope option form into the views style form.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Add Isotope layout options to views style form in a dedicated field set
    $form['isotope'] = array(
      '#type' => 'fieldset',
      '#title' => t('Isotope settings'),
    );

    if (isotope_installed()) {
      // add options to form filled with saved values
      isotope_add_layout_options_to_form($form, $this->options);

      // Display each option field within the Isotope fieldset
      foreach (isotope_layout_default_options() as $option => $default_value) {
        $form[$option]['#fieldset'] = 'isotope';
      }

      // display help text for filter and sort usage
      $form['isotope_help'] = array(
        '#markup' => t('<br><h2>How to enable isotope item filtering and sorting</h2>' .
          '<h3>Enable Filters</h3>' .
          '<p>Isotope item filtering is implemented with taxonomy vocabularies (single or multi-value), whereas each vocabulary corresponds to one filter criteria. A content type representing an isotope item contains these taxonomies. ' .
          'The filtering process behind the scene is based on CSS classes, therefore the item taxonomy terms have to be exposed as classes in the markup.' .
          'This can be achieved with a helper div-element added to each item (row) in the following format: <br>' .
          '<em>&lt;div class="isotope-filters"&gt;term1,term2,...&lt;/div&gt;</em>. </p><br>.' .
          'Important for the implementation of this div-elements are two points: The terms have to be in Plain-Text (see below) and must be comma-separated.<br>' .
          '<h4>Best practice:</h4> <ol>' .
          '<li>Define one taxonomy vocabulary for each distinct filter criteria you need (single or multi-value), e.g. "Color", "Type" etc. and add the corresponding filter terms.</li>' .
          '<li>Add a taxonomy reference field for each filter criteria to the content type representing the isotope item.</li>' .
          '<li>Create a view of this content type and set the display format to "Isotope layout" and the row style to "Fields" (important).</li>' .
          '<li>In the views fields section below, add those reference fields to the list and set each field to Plain-text and exclude it from the display.</li>' .
          '<li>Override the last field in the field section (mainly the rendered item field) and add the "isotope-filters" div-element (see above) to it containing the taxonomy terms as tokens.</li>' .
          '<li>Adding the isotope-filters div-element to the items (rows) of an Isotope view enables this view automatically for filtering.</li>' .
          '<li>Remark: To create a filter button group for each taxonomy vocabulary, create a new view with the format "Isotope filters". See help there for further instructions.</li> ' .
          '</ol>' .
          '<h3>Enable Sorting</h3>' .
          '<p>Isotope sorting is implemented with a special div-element too (see below), that fully defines the item sorting. Any item field, e.g. a taxonomy term, ' .
          'the item title, the item counter or any other content type field can be used as sort criteria. The order of the sort field values in the div-element has to correspond with ' .
          'the order of the sort buttons (See the "Isotope sorting" view style). The first button defines the first sort criteria and the first value in the div-element defines the items value for the first sort criteria and so on.' .
          'See the "Isotope sorting" view style for further explanations about sort criteria and multi-level sorting. <br>' .
          'To enable Isotope item sorting, add the sorting div-element to each item containing its sortable field values as comma-separated list, as the following example shows:<br>' .
          '<em>&lt;div class="isotope-sorting"&gt;value-sort-criteria-0, value-sort-criteria-1,...&lt;/div&gt;</em>. </p>' .
          '<h4>Best practice:</h4> <ol>' .
          '<li>Assume the view is already created (see above).</li>' .
          '<li>Add the sortable item fields to the views fields section below.' .
          '<li>Set each of these sortable fields to Plain-text and exclude it from the display.</li>' .
          '<li>Override the last field output in the field section (mainly the rendered item field) and add the "isotope-sorting" div-element (see above) to it containing the sortable field values as tokens.</li>' .
          '<li>Adding the isotope-sorting div-element to the items (rows) of an Isotope view enables this view automatically for sorting.</li>' .
          '<li>To create a sorting button group presenting all sort criteria, create a new view with the format "Isotope sorting". See help there for further instructions.</li> ' .
          '</ol>' .
          '<h3>Sparse Sorting</h3>' .
          '<p>Isotope sparse sorting is a special kind of sorting, whereat each distinct value of one field defines a sort criteria. For example if an item has a field "color" with the field values = (orange, red, blue, green), ' .
          'then the item gets the sort criteria "orange", "red, "blue" and "green". This allows to sort by a distinct value of one field. All items containing the value are listed at the top, ' .
          'all other items are added to the list, but unsorted.<br>' .
          'To enable Isotope sparse sorting, add the sparse sorting div-element to each item containing the sortable field values as comma-separated list, like the following example shows:<br>' .
          '<em>&lt;div class="isotope-sparse-sorting"&gt;sort-value-0, sort-value-1,...&lt;/div&gt;</em>. </p>' .
          '<em>Remark:</em> If multiple Isotope containers are present in one page, only one container should be enabled for filtering and/or sorting.'),
        '#fieldset' => 'isotope',
      );

    }
    else {
      // Disable Isotope as plugin is not installed
      $form['isotope_disabled'] = array(
        '#markup' => t('These options have been disabled as the Isotope magical layouts plugin is not installed.'),
        '#fieldset' => 'isotope',
      );
    }
  }

}


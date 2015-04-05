<?php

/**
 * @file
 * Process theme data.
 *
 * Use this file to run your theme specific implimentations of theme functions,
 * such preprocess, process, alters, and theme function overrides.
 *
 * Preprocess and process functions are used to modify or create variables for
 * templates and theme functions. They are a common theming tool in Drupal, often
 * used as an alternative to directly editing or adding code to templates. Its
 * worth spending some time to learn more about these functions - they are a
 * powerful way to easily modify the output of any template variable.
 * 
 * Preprocess and Process Functions SEE: http://drupal.org/node/254940#variables-processor
 * 1. Rename each function and instance of "adaptivetheme_subtheme" to match
 *    your subthemes name, e.g. if your theme name is "footheme" then the function
 *    name will be "footheme_preprocess_hook". Tip - you can search/replace
 *    on "xy_theme".
 * 2. Uncomment the required function to use.
 */


/**
 * Preprocess variables for the html template.
 */
function standard_theme_preprocess_html(&$vars) {
  global $theme_key;

  // add font awesome bootstrap
  drupal_add_html_head_link(array('href' => '//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css', 'rel' => 'stylesheet'));

  // make sure jQuery UI and effects is loaded for anonymous users
  drupal_add_library('system', 'ui');
  drupal_add_library('system', 'effects');

  // Browser/platform sniff - adds body classes such as ipad, webkit, chrome etc.
  $vars['classes_array'][] = css_browser_selector();

  // IE9 and greater gradient support
  $vars['polyfills']['gte IE 9'] = array(
    '#type' => 'markup',
    '#markup' => "<style type='text/css'> .gradient {filter: none;} </style>",
    '#prefix' => "<!--[if gte IE 9]>\n",
    '#suffix' => "\n<![endif]-->\n"
  );

}
// */

/* =============================================================================
 *
 *      Node navigation: prev/next node links
 *
 * ========================================================================== */
/**
 * Override or insert variables for the page templates.
 */
function standard_theme_preprocess_page(&$vars) {
  // hide title for user registration / login
  switch (current_path()) {
    case 'user':
    case 'user/login':
    case 'user/register':
    case 'user/password':
      $vars['title'] = '';
  }

  // add node page template suggestions
  if (isset($vars['node'])) {
    $type = $vars['node']->type;
    $suggest = "page__node__{$type}";
    $vars['theme_hook_suggestions'][] = $suggest;

    if ($type == 'werk') {
      $node = $vars['node'];
      $vars['prev_node'] = _node_sibling($node, 'prev', '<', NULL, NULL);
      $vars['next_node'] = _node_sibling($node, 'next', NULL, '>', NULL);
    }
  }
}

/**
 * Internal function to retrieve the previous or next node (werk) of a given node (werk) in the ordered sequence of all nodes.
 */
function _node_sibling($node, $dir = 'next', $prepend_text = '', $append_text = '', $next_prev_text = NULL) {
  $dir_op = $dir == 'prev' ? '<' : '>';
  $sort = $dir == 'prev' ? 'DESC' : 'ASC';
  $query = 'SELECT n.nid, s.field_shortcut_value FROM {node} n '
    . 'LEFT JOIN {field_data_field_shortcut} s ON n.nid = s.entity_id '
    . 'LEFT JOIN {field_data_field_weight} w ON n.nid = w.entity_id '
    . 'WHERE w.field_weight_value ' . $dir_op . ' :weight '
    . 'AND n.type = :type AND n.status = 1 '
    . "AND n.language IN (:lang, 'und') "
    . 'ORDER BY w.field_weight_value ' . $sort . ' LIMIT 1';
  //use fetchObject to fetch a single row
  $row = db_query($query, array(':weight' => $node->field_weight['und'][0]['value'], ':type' => $node->type, ':lang' => $node->language))->fetchObject();

  if ($row) {
    // add links to head for relation of node to other nodes (navigation framework)
    drupal_add_html_head_link(
      array(
        'rel' => $dir,
        'type' => 'text/html',
        'title' => $row->field_shortcut_value,
        // Force the URL to be absolute, for consistency with other <link> tags
        'href' => url('node/' . $row->nid, array('absolute' => TRUE)),
      )
    );
    $text = $next_prev_text ? t($next_prev_text) : $row->field_shortcut_value;
    $prepend_text = $prepend_text ? l($prepend_text, 'node/' . $row->nid, array('attributes' => array('rel' => array($dir), 'class' => array('prepend-node-title')))) : "";
    $append_text = $append_text ? l($append_text, 'node/' . $row->nid, array('attributes' => array('rel' => array($dir), 'class' => array('append-node-title')))) : "";
    return $prepend_text . l($text, 'node/' . $row->nid, array('attributes' => array('rel' => array($dir), 'class' => array('node-title')))) . $append_text;
  } else {
    return FALSE;
  }
}

/* =============================================================================
 *
 *      Isotope view: display only defined number of images
 *
 * ========================================================================== */
/**
 * Preprocess isotope view to limit number of displayed images in grid.
 *
 * Parse the counter tag: <div class="werk-[nid]">[field_front_image_count]</div>
 */
function standard_theme_preprocess_views_view_isotope(&$vars) {
  //
  // limit number of images per werk (multiple images)
  $actual_nid = 0;
  $image_counter = 0;
  foreach ($vars['rows'] as $id => $row) {
    // find image count per werk
    if (strstr($row, '<div class="werk-')) {
      $rowparts = explode('<div class="werk-', $row);
      $len = strpos($rowparts[1], '</div>');

      // strip the werk div-element from the row
      $row = $rowparts[0] . substr($rowparts[1], $len+6);

      // get counters
      $counter_part = substr($rowparts[1], 0, $len);
      $counters = explode('">', $counter_part);
      $werk_nid = $counters[0];
      if ($actual_nid != $werk_nid) {
        // set new image and werk counter
        $image_counter = is_numeric($counters[1]) ? ($counters[1]-1) : 3;
        $actual_nid = $werk_nid;

      } else if ($image_counter == 0) {
        // set content of row to null
        $row = null;

      } else {
        // decrement image counter
        $image_counter--;
      }

      // update row
      $vars['rows'][$id] = $row;
    }

  }
}


/* =============================================================================
 *
 *      User login / register / password form alter
 *
 * ========================================================================== */
/**
 * Alters the menu entries.
 * @param $items
 */
function standard_theme_menu_alter(&$items) {
  // remove the tabs on the login / register form page
  $items['user/login']['type'] = MENU_CALLBACK;
  $items['user/register']['type'] = MENU_CALLBACK;
  $items['user/password']['type'] = MENU_CALLBACK;
}

/**
 * Alter the user login form.
 * @param $form
 * @param $form_state
 * @param $form_id
 */
function standard_theme_form_user_login_alter(&$form, &$form_state, $form_id) {
  $form['name']['#prefix']  = '<div id="' . $form_id . '_form">';
  $form['name']['#prefix'] .= '<h1>' . t('Login') . '</h1>';
  $form['pass']['#suffix']  = '<div class="form-actions-wrapper">';
  $form['pass']['#suffix'] .= l(t('Forgot your password?'), 'user/password', array('attributes' => array('class' => array('login-password'), 'title' => t('Get a new password'))));
  $form['actions']['#suffix']  = '</div></div>';
  if (variable_get('user_register', USER_REGISTER_VISITORS_ADMINISTRATIVE_APPROVAL) != USER_REGISTER_ADMINISTRATORS_ONLY) {
    $form['actions']['#suffix'] .= '<div class="create-account clearfix">';
    $form['actions']['#suffix'] .= "\r<h2>" . t('I don\'t have an account') . "</h2>";
    $form['actions']['#suffix'] .= "\r<div class='create-account-description'><p>" . t("To use this website you need to register.\r Press the button below to apply for an account.") . "</p>";
    $form['actions']['#suffix'] .= "\r<p>" . t("After the processing of your application you will receive an email with detailed information about the login.") . "</p></div>";
    $form['actions']['#suffix'] .= "\r" . l(t('Create an account'), 'user/register', array('attributes' => array('class' => array('login-register'), 'title' => t('Create a new account'))));
    $form['actions']['#suffix'] .= '</div>';
  }
}


/**
 * Alter the user registration form.
 * @param $form
 * @param $form_state
 * @param $form_id
 */
function standard_theme_form_user_register_form_alter (&$form, &$form_state, $form_id) {
  $form['account']['name']['#prefix'] = '<div id="' . $form_id . '">';
  $form['account']['name']['#prefix'] .= '<h1>' . t('Register') . '</h1>';
  $form['actions']['submit']['#suffix'] = '<div class="back-to-login clearfix">' . l(t('Back to login'), 'user/login', array('attributes' => array('class' => array('login-account'), 'title' => t('Sign in')))) . '</div>';
  $form['actions']['submit']['#suffix'] .= '</div>';
}

/**
 * Alter the user password form.
 * @param $form
 * @param $form_state
 * @param $form_id
 */
function standard_theme_form_user_pass_alter (&$form, &$form_state, $form_id) {
  $form['name']['#prefix'] = '<div id="' . $form_id . '_form">';
  $form['name']['#prefix'] .= '<h1>' . t('Request a new password') . '</h1>';
  $form['actions']['#suffix'] = '<div class="back-to-login clearfix">' . l(t('Back to login'), 'user/login', array('attributes' => array('class' => array('login-account'), 'title' => t('Sign in')))) . '</div>';
  $form['actions']['#suffix'] .= '</div>';
}



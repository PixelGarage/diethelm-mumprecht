/**
 * ---
 * @author Ralph Moser (http://ramosoft.ch)
 * @version 0.1
 * @updated 10-Apr-2014
 * ---
 */

(function($) {

  /**
   * This behavior adds isotope magical layouts to defined containers and its items. It supports filtering of the items.
   * The behavior is supported in IE 10+ (uses transitions), Chrome, Firefox, Safari and Opera.
   *
   * @type {{attach: Function}}
   */
  Drupal.behaviors.isotopeLayouts =  {
    attach: function() {

      // Iterate through all Isotope instances
      $.each(Drupal.settings.isotope, function (container, settings) {
        // Set container with class 'isotope'
        var $container = $(container);

        //
        // Attach filter button events: only available, if items are filterable and filter buttons exist on page
        //
        try {
          // check if filterable items and filter button containers have been defined
          var $filterButtons = Drupal.settings.isotope_filter;
          var hasFilterButtons = (typeof $filterButtons != 'undefined') && Object.keys($filterButtons).length > 0;

          if (settings.filters_enabled && hasFilterButtons) {
            // contains combined filters of each button group
            var groupFilterColl = {};

            // Iterate through all available filter button containers and add button click events
            $.each($filterButtons, function (buttonContainerId, filterSettings) {
                //
                // get button group with given id
                var $button_container = $('#' + buttonContainerId);
                var groupFilter = [],
                    resetButtonSelection = function (container) {
                        container.find('.button.selected').each(function() {
                            var dataFilter = $(this).attr('data-filter'),
                                index = groupFilter.indexOf(dataFilter);
                            if (index >= 0) groupFilter.splice(index,  1); // remove element at index
                            $(this).removeClass('selected');
                        });
                    },
                    updateResetButton = function() {
                        // update reset button selection
                        if ($button_container.find('.button.selected').length > 0) {
                            $button_container.find('.button.reset').removeClass('selected');
                        } else {
                            $button_container.find('.button.reset').addClass('selected');
                        }
                    };

                //
                // attach button events
                $button_container.on('click', '.button', function(ev) {
                    // disable uncover animation for all items (prevent conflicts with filter animation)
                    _uncoverAllItems();

                    // create filter value
                    var dataFilter = '',
                        $clickedButton = $(this);

                    // check first, if a parent button on the same level is active, close its child group if open
                    // reset selection on siblings (and their children)
                    var $activeSibling = $clickedButton.siblings('.active-trail');

                    if ($activeSibling.length > 0) {
                        resetButtonSelection($activeSibling);
                        updateResetButton();
                        $activeSibling.removeClass('active-trail');
                        if ($activeSibling.hasClass('visible-children')) {
                            var $siblingGroup = $activeSibling.find('>div.button-group'),
                                containerHeight = $button_container.height(),
                                sgHeight = $siblingGroup.outerHeight(true);
                            $siblingGroup.slideUp(300);
                            $button_container.height(containerHeight - sgHeight);
                            $activeSibling.removeClass('visible-children');
                        }
                    }

                    //
                    // perform button action of clicked button (or one of its parent buttons (bubbling))
                    if ($clickedButton.hasClass('reset')) {
                        //
                        // reset filter and clicked buttons
                        $button_container.find('.button.active-trail').removeClass('active-trail');
                        $button_container.find('.button.selected').removeClass('selected');
                        groupFilter = [];
                        $clickedButton.addClass('selected');

                    } else if ($clickedButton.hasClass('parent')) {
                        //
                        // slide down/up child button group on direct event (not bubbling up) and set active-trail
                        var $childButtonGroup = $clickedButton.find('>div.button-group');

                        if (ev.target == this) {
                            // direct event: toggle child button group and reset button selection
                            var topGroupHeight = $button_container.outerHeight(true),
                                groupHeight = $childButtonGroup.outerHeight(true);

                            if ($childButtonGroup.is(':hidden')) {
                                // slide down and set group visible
                                $childButtonGroup.css({"top": topGroupHeight + "px"}).slideDown(300);
                                $clickedButton.addClass('visible-children');

                                // adapt full container height
                                $button_container.height(topGroupHeight + groupHeight);

                            } else {
                                $childButtonGroup.slideUp(300, function(){
                                    $button_container.removeAttr('style');
                                    $clickedButton.removeClass('visible-children');
                                });
                            }

                            // deselect reset button, because filter of this button is active
                            // (usability: selection only on lowest level, no side-branches)
                            $button_container.find('.button.reset').removeClass('selected');

                        }
                        // set also on parent buttons (during event bubbling)
                        $clickedButton.addClass('active-trail');

                    } else {
                        //
                        // set filter for single or multiple selection inside button group
                        dataFilter = $clickedButton.attr('data-filter');

                        // toggle clicked button and its filter
                        if ($clickedButton.hasClass('selected')) {
                            // remove selection and filter
                            var index = groupFilter.indexOf(dataFilter);
                            if (index >= 0) groupFilter.splice(index,  1); // remove element at index
                            $clickedButton.removeClass('selected');

                        } else {
                            // add the filter to the filterGroup array
                            if (filterSettings.filter_multi_select) {
                                groupFilter.push(dataFilter);
                            } else {
                                $button_container.find('.button.selected').removeClass('selected');
                                groupFilter = [dataFilter];
                            }
                            // add selection
                            $clickedButton.addClass('selected');
                        }

                        // add/remove 'selected' from reset-button depending on other selected buttons
                        updateResetButton();

                    }

                    //
                    // create resulting filter for all filter container
                    groupFilterColl[buttonContainerId] = groupFilter;

                    // combine button container filters
                    // (cartesian product: [.color1, .color2] X [.type1, .type2] = ".color1.type1, .color1.type2, .color2.type1, .color2.type2")
                    var result = [];
                    for (var group in groupFilterColl) {
                        // set first array of cartesian product
                        if (result.length == 0) {
                            result = groupFilterColl[group];
                        } else {
                            // cartesian product of result array with next group filter array
                            var first = result,
                                second = groupFilterColl[group];
                            if (second.length > 0) {
                                // combine filters of both containers
                                result = [];
                                for (var i = 0; i < first.length; i++) {
                                    for (var j = 0; j < second.length; j++) {
                                        result.push(first[i]+second[j]);
                                    }
                                }
                            }
                        }

                    }

                    // filter the isotope container accordingly
                    var filterValue = result.join(", ");
                    $container.isotope({ filter: filterValue });
                });

                // close open button groups during resize
                $(window).on('resize', function() {
                    // close open button group during resizing, if any
                    var $open_parent = $button_container.find('.visible-children');
                    $open_parent.find('>div.button-group').slideUp(100, function() {
                        // delete top container height during resizing
                        $button_container.removeAttr('style');
                        $open_parent.removeClass('visible-children');
                    });
                });
            });

          }
        } catch(err) {
            // just make sure nothing went wrong
            console.log(err.message);
        }


        //
        // Attach sort button events: only available, if items are sortable and sort buttons exist on page
        //
        try {

            // check if sortable items and sort button groups have been defined
            var $sortButtonGroups = Drupal.settings.isotope_sort;
            var hasSortButtons = (typeof $sortButtonGroups != 'undefined') && Object.keys($sortButtonGroups).length > 0;

            if (settings.sort_enabled && hasSortButtons) {

                // Iterate through  sort button containers (usually one) and add button click events
                $.each($sortButtonGroups, function (buttonContainerId, sortSettings) {
                    //
                    // get button group with given id
                    var $sortButtonGroup = $('#' + buttonContainerId),
                        groupSortBy = [],
                        resetButtonSelection = function () {
                            $sortButtonGroup.find('.button.selected').removeClass('selected');
                        },
                        updateItemSortClasses = function (attributes) {
                            var $items = $container.find('div.isotope-item');
                            $items.removeClass('non-sortable').removeClass('sorted');
                            if (attributes != '') {
                                // items are sorted by at least one attribute
                                $items.addClass('sorted');
                                $container.find(attributes).addClass('non-sortable');
                            }
                        };

                    //
                    // attach button events
                    $sortButtonGroup.on('click', '.button', function() {
                        // disable uncover animation for all items
                        _uncoverAllItems();

                        // get sort value and update button selection
                        var dataSortBy,
                            $clickedButton = $(this);

                        if ($clickedButton.hasClass('reset')) {
                            // reset sort and clicked buttons
                            groupSortBy = [];
                            updateItemSortClasses('');
                            resetButtonSelection();
                            $clickedButton.addClass('selected');

                        } else {
                            // single or multiple selection inside button group
                            dataSortBy = $clickedButton.attr('data-sort-by');

                            // toggle clicked button and its filter
                            if ($clickedButton.hasClass('selected')) {
                                // remove selection and sort criteria
                                $clickedButton.removeClass('selected');
                                var index = groupSortBy.indexOf(dataSortBy);
                                groupSortBy.splice(index,  1); // remove element at index

                            } else {
                                // add selection and sort criteria
                                if (sortSettings.sort_multi_level) {
                                    groupSortBy.push(dataSortBy);
                                } else {
                                    groupSortBy = [dataSortBy];
                                    resetButtonSelection();
                                }
                                $clickedButton.addClass('selected');
                            }

                            // add/remove 'selected' from 'None' button depending on selected filter(s)
                            if (groupSortBy.length > 0) {
                                $sortButtonGroup.find('.button.reset').removeClass('selected');
                            } else {
                                $sortButtonGroup.find('.button.reset').addClass('selected');
                            }

                            // add .non-sortable class to all not sortable items (attribute is undefined)
                            var attributes = '';
                            for (var i = 0; i < groupSortBy.length; i++) {
                                if (groupSortBy[i] in settings.sort_data) {
                                    // sort criteria defined, look for all non-sortable items( no value for this criteria)
                                    var attr = settings.sort_data[groupSortBy[i]];
                                    attr = attr.replace(']', '*="{undef}"]');
                                    attributes += (i == 0) ? attr : ', ' + attr;

                                } else {
                                    // sort criteria not defined on items (possible for sparse sorting)
                                    // => set all items non-sortable
                                    attributes = '*';
                                    break;
                                }

                            }
                            updateItemSortClasses(attributes);
                        }

                        // sort the isotope container accordingly
                        $container.isotope({ sortBy: groupSortBy.concat(settings.sort_by) });
                    });

                });

            }

        } catch(err) {
            // just make sure nothing went wrong
            console.log(err.message);
        }


        //
        //
        // Initialize Isotope container, infinite scrolling and item uncovering effect (animated uncovering of items during scrolling and resizing)
        //
        //
        // Initialize infinite scrolling
        //
        var $items = $container.find('div.isotope-item'),
            iscroll = Drupal.settings.isotope_iscroll,
            infiniteScrollEnabled =  (typeof iscroll != 'undefined') && Object.keys(iscroll).length > 0,
            hasNextPage = true;

        if (infiniteScrollEnabled) {
            var iScrollSettings = iscroll.all,
                $nextPage = $container.parent().parent().find(iScrollSettings.nextSelector).first(),
                _viewClass = ' .' + iScrollSettings.viewClass,
                _nextHref = $.trim($nextPage.find('a').attr('href') + _viewClass),
                _loading = false,
                _nextPageExists = function () {
                    if (!_nextHref) {
                        // cleanup, if no more pages are available
                        $(window).off('.iscroll');
                        $nextPage.off('.iscroll');
                        hasNextPage = false;
                    } else {
                        _startWatching();
                        hasNextPage = true;
                    }
                    return hasNextPage;
                },
                _load = function () {
                    // start loading next page: clears next-container and adds loading html
                    _loading = true;
                    $nextPage.html('<div class="iscroll-loader"></div><div class="iscroll-page-loading" style="display:none"></div>');

                    // load the next page
                    setTimeout(function() {

                        $nextPage.find('.iscroll-page-loading').load(_nextHref, function(r, status, xhr) {
                            // load next page to hidden container
                            if (status === 'error') {
                                return $(window).off('.iscroll');
                            } else {
                                $(this).prev('.iscroll-loader').append(iScrollSettings.loadingHtml);
                            }

                            // extract isotope items and add them to isotope container
                            var $this = $(this),    // iscroll-page-loading
                                $loadedItems = $this.find('div.isotope-item');
                            Drupal.attachBehaviors($this);
                            $container.isotope( 'insert', $loadedItems );
                            $container.imagesLoaded(function () {
                                // layout items and show them (animated or direct)
                                $container.isotope();
                                if (uncoverEffectEnabled) {
                                    _onScroll();
                                } else {
                                    _uncoverAllItems();
                                }
                                // remove loader gif
                                $this.prev('.iscroll-loader').remove();
                                _loading = false;
                            });

                            // add new link to nextPage container and check next href (page request)
                            var $nextLink = $this.find(iScrollSettings.nextSelector + '>a');
                            _nextHref = $nextLink.attr('href') ? $.trim($nextLink.attr('href') + _viewClass) : false;
                            if (_nextPageExists()) {
                                $this.before($nextLink);
                            }

                        });
                    }, 20);
                },
                _startWatching = function () {
                    // bind scroll event or next page click
                    if (iScrollSettings.autoTrigger && (iScrollSettings.autoTriggerUntil === false || iScrollSettings.autoTriggerUntil > 0)) {
                        // auto trigger enabled, bind scroll event
                        $(window).off('.iscroll').on('scroll.iscroll', function() {
                            var _containerBottomLine = $container.offset().top + $container.height() - iScrollSettings.padding,
                                _documentBottomLine = $(window).height() + window.pageYOffset;
                            // trigger page loading
                            if (!_loading && (_containerBottomLine < _documentBottomLine)) {
                                _load();
                            }
                        });

                        if (iScrollSettings.autoTriggerUntil > 0) {
                            iScrollSettings.autoTriggerUntil--;
                        }

                    } else {
                        // manual trigger, bind click event
                        $(window).off('.iscroll');
                        $nextPage.off('.iscroll').on('click.iscroll', function() {
                            _load();
                            return false; // no propagation
                        });
                    }
                };

            // start watching infinite scrolling
            _startWatching();
        }


        //
        // Initialize item uncovering occurring during scrolling and resizing
        //
        var uncoverEffectEnabled = settings.uncover_effect_enabled,
            uncoveredItems = 0,
            isScrolling = false,
            resizeTimeout = null,
            // 0.0 = item is considered in the viewport as soon as it enters,
            // 1.0 = item is considered in the viewport only when it's fully inside
            threshold = 0.0,
            _updateUncoveredStatus = function () {
                var hasUncoveredPages = infiniteScrollEnabled && hasNextPage;
                // checks if all items are uncovered and detach events, when true
                uncoveredItems++;
                if (!hasUncoveredPages && uncoveredItems >= $items.length) {
                    $(window).off('.uncover');
                }
            },
            _inViewport = function (elem) {
                var elemH = elem.height(),
                    elemTop = elem.offset().top,
                    elemBottom = elemTop + elemH,
                    viewedH = $(window).height() + window.pageYOffset,
                    inViewport = ( (elemTop + elemH * threshold) <= viewedH ) && ( (elemBottom - elemH * threshold) >= window.pageYOffset );
                return inViewport;
            },
            _uncoverItemsAnimated = function () {
                // check each item to be uncovered with animation
                if (infiniteScrollEnabled) {
                    // update items in case of infinite scrolling (items are added)
                    $items = $container.find('div.isotope-item');
                }
                $items.each(function () {
                    var $this = $(this);
                    if (!$this.hasClass('shown') && !$this.hasClass('animate') && _inViewport($this)) {
                        var perspY = $(window).height() / 2 + window.pageYOffset;
                        $this.css({
                            perspectiveOrigin: '20% ' + perspY + 'px'
                            /*animationDuration: '0.6s'   */
                        });
                        $this.addClass('animate');
                        $this.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                            // disable animation when finished
                            $this.addClass('shown').removeClass('animate');
                            _updateUncoveredStatus();
                        });
                    }
                });
                isScrolling = false;
            },
            _uncoverAllItems = function () {
                // disables uncover animation and shows all items
                if (infiniteScrollEnabled) {
                    // update items in case of infinite scrolling (items could be added)
                    $items = $container.find('div.isotope-item');
                }
                $items.each(function () {
                    $(this).addClass('shown').removeClass('animate');
                    _updateUncoveredStatus();
                });
            },
            _onScroll = function () {
                // uncover items on scrolling
                if (!isScrolling) {
                    isScrolling = true;
                    setTimeout(function () { _uncoverItemsAnimated(); }, 60);
                }
            },
            _onResize = function () {
                // uncover items when resizing window
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout); // clear timeout as long as resizing events occur
                }
                resizeTimeout = setTimeout(function () {
                    _uncoverItemsAnimated();
                    resizeTimeout = null; // resize done
                }, 1000);
            };


        //
        // Set isotope options
        //
        var $options = new Object();
        $options.containerStyle = {
            position: "relative"
        };
        $options.itemSelector  = settings.item_selector;
        $options.isInitLayout  = true;       // set to false, if layout should be triggered manually
        $options.isResizeBound = settings.resizable;
        $options.isOriginLeft  = true;
        $options.isOriginTop   = true;
        $options.transitionDuration = settings.trans_duration+'ms';
        $options.visibleStyle  = {
            opacity: 1
        };
        $options.hiddenStyle   = {
            opacity: 0.1
        };

        // set layout mode specific options
        switch (settings.layout_mode) {
            case 'masonry':
                $options.layoutMode = 'masonry';
                $options.masonry = {
                    columnWidth: settings.grid_sizer,
                    gutter: settings.gutter_sizer
                };
                break;

            case 'packery':
                $options.layoutMode = 'packery';
                $options.packery = {
                    columnWidth: settings.grid_sizer,
                    gutter: settings.gutter_sizer,
                    rowHeight: settings.grid_sizer,
                    isHorizontal: false
                };
                break;

            case 'masonryHorizontal':
                $options.layoutMode = 'masonryHorizontal';
                $options.masonryHorizontal = {
                    rowHeight: settings.grid_sizer,
                    gutter: settings.gutter_sizer
                };
                break;
            case 'fitRows':
                $options.layoutMode = 'fitRows';
                break;

            case 'fitColumns':
                $options.layoutMode = 'fitColumns';
                break;

            case 'cellsByRow':
                $options.layoutMode = 'cellsByRow';
                $options.cellsByRow = {
                    columnWidth: settings.grid_sizer,
                    rowHeight: settings.grid_sizer
                };
                break;
            case 'cellsByColumn':
                $options.layoutMode = 'cellsByColumn';
                $options.cellsByColumn = {
                    columnWidth: settings.grid_sizer,
                    rowHeight: settings.grid_sizer
                };
                break;

            case 'horizontal':
                $options.layoutMode = 'horizontal';
                $options.horizontal = {
                    verticalAlignment: settings.alignment
                };
                break;

            case 'vertical':
                $options.layoutMode = 'vertical';
                $options.vertical = {
                    horizontalAlignment: settings.alignment
                };
                break;
        }

        // add a stamp element to the container
        $options.stamp = settings.stamp_elements;

        // sorting
        $options.sortBy        = settings.sort_by;
        $options.sortAscending = true;
        if (settings.sort_enabled) {
            $options.getSortData = settings.sort_data;
        }


        //
        // Apply Isotope to container, when document and images are loaded
        //
        $container.imagesLoaded(function () {

          // apply isotope options
          $container.isotope($options);

          // initialize items
          if (uncoverEffectEnabled) {
              $items.each(function () {
                  var $this = $(this);
                  if (_inViewport($this)) {
                      $this.addClass('shown');
                      _updateUncoveredStatus();
                  }
              });

              // start watching for uncovering items
              $(window).on('scroll.uncover', _onScroll);
              $(window).on('resize.uncover', _onResize);

          } else {
              // make all item visible at once
              _uncoverAllItems();
          }

        });

      });  // each isotope settings

    }
  };

})(jQuery);


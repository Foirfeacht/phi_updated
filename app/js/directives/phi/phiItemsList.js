/*
 * Assume to have in parent scope:
 * 
 *  items - list of displaying items;
 *  onItemSelect(selectedItem) - function executing when item becomes selected
 *  addNewItem() - function does adding new item, should return promise holding newly added item
 *  onItemRemoved(deactivatedItem) - function executing when item removed
 */

document.addEventListener('keydown', function(evt) {
  var e = window.event || evt;
  var key = e.which || e.keyCode;
  if (17 === key) {
    window.ctrlDown = true;
  }
}, false);

document.addEventListener('keyup', function(evt) {
  var e = window.event || evt;
  var key = e.which || e.keyCode;
  if (17 === key) {
    window.ctrlDown = false;
  }
}, false);

app.directive('phiItemsList', [ '$timeout', '$parse', '$http', '$q', '$filter', 'ngTableParams', 'dataStateHelper',
    function($timeout, $parse, $http, $q, $filter, ngTableParams, dataStateHelper) {
      return {
        restrict : 'AE',
        replace : true,
        scope : false,
        link : function(scope, element, attrs, controller) {
          scope.$watchCollection("items", function(items) {
            if (items) {
              // Execute filter and adjust selection
              scope.tableParams.reload();
              scope.fireSelectionEvent();
            }
          });
          // Used by "discard all changes" and any other external logic changing
          // items
          scope.$watch("items.timestamp", function(timestamp) {
            if (scope.items && timestamp) {
              scope.tableParams.reload();
              scope.fireSelectionEvent();
            }
          });

          scope.tableParams = new ngTableParams({ 
            sorting : {
              'date' : 'desc' // initial sorting,
              //'startDate' : 'desc',
              //'relationCode' : 'desc'
            },
            filter: {
                problemStatus: 'M'       // initial filter
            }
          }, {
            $scope : scope,
            // Disable Pagination
            counts : [],
            getData : function($defer, params) {
              if (scope.items) {
                var activeData = scope.items.filter(function(el) {
                  return el.active;
                });
                var filteredData = scope.filterQuery ? $filter('filter')(activeData, scope.filterQuery) : activeData;
                var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                $defer.resolve(orderedData);
              } else {
                $defer.resolve([]);
              }
            }
          });

          scope.onSelect = function(target) {
            // Toggle flag for targes
            if (target) {
              if (dataStateHelper.isSelected(target)) {
                dataStateHelper.markNotSelected(target);
              } else {
                dataStateHelper.markSelected(target);
              }
            }

            if (!window.ctrlDown) {
              // Reset flag for the rest
              for (var i = 0; i < scope.items.length; i++) {
                var el = scope.items[i];
                if (el !== target) {
                  dataStateHelper.markNotSelected(el);
                }
              }
            }

            // Fire event to display selected item in right panel
            scope.tableParams.reload();
            scope.fireSelectionEvent();
          };

          scope.fireSelectionEvent = function() {
            for (var i = 0; i < scope.items.length; i++) {
              var el = scope.items[i];
              if (dataStateHelper.isSelected(el)) {
                // Set selection in the scope
                scope.singleSelectedItem = el;
                // And call callback if it is
                if (scope.onItemSelect) {
                  scope.onItemSelect(el);
                }
                return;
              }
            }
            scope.singleSelectedItem = null;
            if (scope.onItemSelect) {
              scope.onItemSelect(null);
            }
            return;
          };

          scope.isSelected = function(object) {
            return dataStateHelper.isSelected(object);
          };

          scope.isAnySelected = function() {
            return dataStateHelper.isAnySelectedInArray(scope.items);
          };

          scope.getAllSelected = function() {
            return dataStateHelper.getAllSelectedFromArray(scope.items);
          };

          scope.isDirty = function(object) {
            return dataStateHelper.isDirty(object);
          };

          scope.isValid = function(object) {
            return dataStateHelper.isValid(object);
          };

          scope.addNew = function() {
            scope.addNewItem().then(function(newItem) {
              if (newItem) {
                scope.addItemToItemsModel(newItem);
              }
            });
          };

          scope.addItemToItemsModel = function(newItem) {
            // Add to list
            scope.items.unshift(newItem);

            // Mark dirty
            dataStateHelper.markDirty(newItem);
            // Select it
            scope.onSelect(newItem);
          };

          scope.removeSelected = function() {
            var selected = dataStateHelper.getSelectedFromArray(scope.items);
            if (selected) {
              // Tell filter to exclude from screen
              selected.active = false;
              if (scope.onItemRemoved) {
                scope.onItemRemoved(selected);
              }
              // Mark dirty
              dataStateHelper.markDirty(selected);
              // Reset selection
              scope.onSelect(null);
            }
          };
        },
        controller : [ '$scope', function($scope) {

        } ]
      };
    } ]);

'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Show/hide a tooltip and update it's position.
 * @exports CollaborativeMap.tooltip
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .service('Tooltip', [
    function() {

      return {
        tooltip: $('.tooltip-leafletstyle')[0],
        eventFunction: undefined,

        showTooltip: function(text) {
          this.updatePosition(this.tooltip);
          this.tooltip.innerHTML = text;
          this.tooltip.style.display = 'block';
          this.addMouseHandler();
        },

        hideTooltip: function() {
          this.removeMouseHandler();
          this.tooltip.style.display = 'none';
        },

        addMouseHandler: function() {
          window.addEventListener('mousemove', this.eventFunction);
        },

        removeMouseHandler: function() {
          window.removeEventListener('mousemove', this.eventFunction);
        },

        updatePosition: function(element) {
          this.eventFunction = function(e) {
            element.style.left = e.clientX + 'px';
            element.style.top = e.clientY + 'px';
          };
        }

      };
    }
  ]);

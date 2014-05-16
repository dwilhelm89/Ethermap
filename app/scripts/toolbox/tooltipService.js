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
        //html element of the tooltip
        tooltip: undefined,
        //mousemove function
        eventFunction: undefined,

        createTooltip: function() {
          if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tooltip-leafletstyle';
            var parentDiv = document.getElementsByTagName('body')[0];
            parentDiv.appendChild(this.tooltip);
          }
        },

        removeTooltip: function(){
          if(this.tooltip){
            var parentDiv = document.getElementsByTagName('body')[0];
            parentDiv.removeChild(this.tooltip);
          }
        },

        showTooltip: function(text) {
          if (!this.tooltip) {
            this.createTooltip();
          }
          this.updatePosition(this.tooltip);
          this.tooltip.innerHTML = text;
          this.tooltip.style.display = 'block';
          this.addMouseHandler();
        },

        hideTooltip: function() {
          if (this.tooltip) {
            this.removeMouseHandler();
            this.tooltip.style.display = 'none';
          }
        },

        addMouseHandler: function() {
          window.addEventListener('mousemove', this.eventFunction);
        },

        removeMouseHandler: function() {
          window.removeEventListener('mousemove', this.eventFunction);
        },

        updatePosition: function(element) {
          //Save the tooltip function as it is required to remove the event handler from the document.
          this.eventFunction = function(e) {
            element.style.left = e.clientX + 'px';
            element.style.top = e.clientY + 'px';
          };
        }

      };
    }
  ]);

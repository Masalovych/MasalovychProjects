define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'metro',

    'text!templates/manager/monitoring/exception/exceptionHeader.html'
], function ($, _, Backbone, Marionette, METRO,  Template) { //TransferView,

    'use strict';

    return Marionette.ItemView.extend({

        tagName: 'div',

        template: Template,

        events: {
            'click .filterAll, .filterWillCall, .filterExpress, .filterTruck': 'filterOrders',
            'click .process' : 'buttonPress'
        },

        onRender:  function(){
            this.hideButton();
        },

        resources: function (e) {
        },

        filterOrders: function(e){
            this.options.context.filterOrders({type: $(e.currentTarget).attr('data-keyword')});
        },

        buttonPress: function(e){
            this.options.context.process();
        },

        showButton: function(){
            this.$('.process').removeClass('hideBlock');
        },

        hideButton: function(){
            this.$('.process').addClass('hideBlock');
        }

    });
});

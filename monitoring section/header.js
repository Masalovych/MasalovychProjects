define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'metro',
    'text!templates/manager/monitoring/header.html'
], function ($, _, Backbone, Marionette, METRO,

             Template) {

    'use strict';

    return Marionette.ItemView.extend({

        template: Template,

        className: "row",

        initialize:function() {},

        events: {
            'click .transfer'   : 'transfer',
            'click .process' : 'process',
            'click .filterAll, .filterWillCall, .filterExpress, .filterTruck': 'filterOrders',
            'change [name="radioButton"]'   : 'sortByOverallRank'
        },

        onRender: function(){
            this.selectTemplate();
        },

        selectTemplate: function(){
            if(this.options.context.options.orderType == 5){
                this.$('.transfer').addClass('unDisplay');
                this.$('.process').removeClass('unDisplay');
                this.$('.monFilter').removeClass('unDisplay');
            }
        },

        filterOrders: function(e){
            this.checkRadio();
            this.markFilteredButton(e);
            this.hideButton();
            var filterType = + $(e.currentTarget).attr('data-keyword'),
            collection = this.options.context.collection;
            if(filterType == 0){
                this.options.context.sortFilterCollection(collection, null, 'overallRank');
            }else if(filterType == 2){
                this.options.context.renderExceptionsTabs();
            }else{
                this.options.context.sortFilterCollection(collection, {orderType: filterType}, 'overallRank');
            }
        },

        markFilteredButton: function(e){
            this.$(e.currentTarget).css({'background-color': 'rgb(226, 226, 226)'}).siblings().css({'background-color': 'inherit'});
        },

        showButton: function(){
            this.$('.transfer,.resource,.process ').removeClass('hideBlock');
        },

        hideButton: function(){
            this.$('.transfer,.resource,.process ').addClass('hideBlock');
        },

        checkRadio: function(){
            this.$('[name="radioButton"]').prop('checked', true);
        },

        unCheckRadio: function(){
            this.$('[name="radioButton"]').removeAttr('checked');
        },

        sortByOverallRank: function(e){
            if(!$(e.currentTarget).is(':checked')) return false;
            else this.options.context.sortFilterCollection(null, null, 'overallRank');
        },
//
        transfer: function () {
            this.options.context.dialog();
        },

        process: function(){
            this.options.context.dialog();
        }
    });
});
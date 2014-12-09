define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'metro',
    './tabView',
    'collections/admin/orderTypesCollection',
    'text!templates/manager/monitoring/main.html'
], function ($, _, Backbone, Marionette, METRO,

             TabView,
             Collection,
             layoutTemplate) {

    'use strict';

    return Marionette.Layout.extend({

        template: layoutTemplate,
        currentTab : 1,
        className: 'monitoring',

        regions:{
            tabView:'.tabView'
        },

        events: {
            'click .button-set button:not(.disabled)' : 'changeView'
        },

        initialize: function () {
            var that = this;
            this.collection = new Collection();
            this.collection.fetch({data:{'locationId':this.options.locationId},
                success:function(){console.log("success get orders");},
                error: function(){alert("error get")}
            });
        },

        onRender : function () {
            this.getOrderTypes();
        },

        changeView:function(e){
            this.$('.button-set button').removeClass('active');
            $(e.currentTarget).addClass('active');
            this.currentTab = parseInt($(e.currentTarget).attr('tab')) + 1;
            this.getOrderTypes();
        },

        getOrderTypes:function(){
            this.tabView.show(new TabView({orderTypesCollection: this.collection, orderType: this.currentTab}));
        }
    });
});
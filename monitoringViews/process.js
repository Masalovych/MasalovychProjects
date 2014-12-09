define([
    'jquery',
    'jquery_ui',
    'underscore',
    'backbone',
    'marionette',
    'metro',
    'collections/manager/exceptionWorkersCollection',
    'text!templates/manager/monitoring/exception/process.html'
], function ($, jqueryUi,_, Backbone, Marionette, METRO,

             WorkersCollection,
             template) {

    'use strict';

    return Marionette.Layout.extend({

        template: template,

        events: {
            'click button.save':'process',
            'click button.delete':'cancel',
            'click input[name="nextWorker"]':'changeMethod'
        },

        serializeData:function(){
            return {
                model:(this.model)?this.model.toJSON() : {}
            };
        },

        initialize: function () {
            var that = this;
            this.model = this.options.context.model;
            this.collection = new WorkersCollection();
            this.collection.fetch({
                data:{
                    orderNumber: this.model.get('orderNumber'),
                    deliveryNumber: this.model.get('deliveryNum')
                },
                success: function(){console.log('exception workers get success');},
                error: function(){alert("can't get exception workers");}
            });
        },

        onRender : function () {
            this.showTable();
        },

        showTable: function(collection){
            collection = collection || this.collection;
            this.tableView = new TableView({
                name: 'transferTable',
                id: 'id',
                columns: {
                    'Employee': 'firstName',
                    'Order Type': 'orderType',
                    'Sub Type': 'orderSubType',
                    'Batch Number': 'masterBatchId',
                    'Est End': 'operationEndHour'
                },
                radio: true,
                sort: true,
                callback: _.bind(this.userSelected, this),

                collection: collection
            });
            this.table.show(this.tableView);
        }
    });
});
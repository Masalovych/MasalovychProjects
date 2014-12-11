define([
    'jquery',
    'jquery_ui',
    'underscore',
    'backbone',
    'marionette',
    'metro',
    'widgets/tables/main',
    'collections/manager/transferCollection',
    'collections/manager/exceptionWorkersCollection',
    'text!templates/manager/monitoring/dialog.html'
], function ($, jqueryUi,_, Backbone, Marionette, METRO,

             TableView,
             TransferCollection,
             ProcessCollection,
             template) {

    'use strict';

    return Marionette.Layout.extend({

        template: template,

        selectMethod: "1",

        events: {
            'click button.save':'process',
            'click button.delete':'cancel',
            'click input[name="nextWorker"]':'changeMethod'
        },

        regions:{
            table: ".table-box"
        },

        serializeData:function(){
            return {
                model:(this.model)?this.model.toJSON() : {},
                type: this.type
            };
        },

        initialize: function () {

            this.type = (this.options.context.options.orderType != 5) ? 1 : 2;
            var that = this;
            if(this.type == 1){
                this.collection = new TransferCollection();
                this.collection.fetch({
                    data:{'locationId':app.me.get('locationId')},
                    success: function(collection){
                        if(that.model.get('user')){
                            var model = that.collection.get(that.model.get('user').id);
                            if(model){that.collection.remove(model)}
                        }
                        that.tableView.collectionLoaded();
                    },
                    error: function(){alert("can't get workers")}
                });
            }else{
                this.collection = new ProcessCollection();
                this.collection.fetch({
                    data:{
                        orderNumber: this.model.get('orderNumber'),
                        deliveryNumber: this.model.get('deliveryNum')
                    },
                    success: function(){
                        that.tableView.collectionLoaded();
                        that.collection.trigger('change');
                        console.log('exception workers get success');
                    },
                    error: function(){
                        alert("can't get exception workers");
                    }
                });
            }
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
                multipleSelect: true,

                collection: collection
            });
            this.table.show(this.tableView);
        },

        userSelected: function(model){
            this.userModel = model;
        },

        cancel: function(){
            $('.window-overlay').click();
        },

        changeMethod: function(e){
            this.tableView.unSelectAll();
            var select = $(e.target).attr('value');
            if(this.selectMethod != select && select == "1"){
                this.selectMethod = select;
                this.$('.tableWidget').append('<div class="fence"></div>');

            }else if(this.selectMethod != select && select == "2"){
                this.selectMethod = select;
                this.$('.fence').remove();
            }
        },

        process: function() {
            var that = this,
                url,
                userId = (this.userModel) ? this.userModel.get('id') : null;
            if (this.type == 1) {
                var logOff = this.$('[name="logOff"]').is(':checked'),
                    location = this.$('[name="position"]').val(),
                    masterBatchId = this.model.get('batchNumber');

                if (!userId && that.selectMethod == "2") {
                    app.vent.trigger('adminError', {type: "showMessage", message: "Please, select user"});
                    return;
                } else if (userId && that.selectMethod == "2") {
                    url = "/batch/transfer?userId=" + userId + "&masterBatchId=" + masterBatchId + "&logOff=" + logOff + "&location=" + location;
                }
                else if (!userId && that.selectMethod == "1") {
                    url = "/batch/transfer?masterBatchId=" + masterBatchId + "&logOff=" + logOff + "&location=" + location;
                }
                $.ajax({
                    url: url,
                    type: "get",
                    success: function () {
                        if (that.selectMethod == "2") {
                            that.options.context.changeBatchWorker({user: that.userModel.toJSON(), batchNumber: masterBatchId});
                        } else {
                            that.options.context.changeBatchWorker({user: false, batchNumber: masterBatchId});
                        }
                        $('.transfer').addClass('hideBlock');
                        $('.window-overlay').click()
                    },
                    error: function () {
                        app.vent.trigger('adminError', {type: "showMessage", message: "can't save"});
                    }
                });
            }else if(this.type == 2){

                var orderNumber = this.model.get('orderNumber'),
                    deliveryNumber = this.model.get('deliveryNum');
                if(!userId && that.selectMethod == "2"){
                    app.vent.trigger('adminError',{type: "showMessage", message: "Please, select user"});
                    return;
                }else if(userId && that.selectMethod == "2"){
                    url = "/monitoring/exception/create?userId=" + userId + "&orderNumber=" + orderNumber + "&deliveryNumber=" + deliveryNumber;
                }
                else if(!userId && that.selectMethod == "1"){
                    url = "/monitoring/exception/create?orderNumber=" + orderNumber + "&deliveryNumber=" + deliveryNumber;
                }
                $.ajax({
                    url: url,
                    type: "get",
                    success: function(){
                        console.log('exception create batch success');
                        that.options.context.deleteOrder();
                        $('.window-overlay').click();
                    },
                    error: function(){
                        alert("can't create batch");
                    }
                });
            }
        }
    });
});
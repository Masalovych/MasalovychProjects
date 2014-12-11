define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'metro',
    './dialog',
    './transfer',
    './header',
    'widgets/tables/main',
    'collections/manager/monitoring',
    'collections/manager/exceptionCollection',
    'text!templates/manager/monitoring/tabView.html'

], function ($, _, Backbone, Marionette, METRO,

             DialogView,
             TransferView,
             Header,
             TableView,
             Collection,
             ExceptionCollection,
             Template
    ) {

    'use strict';

    return Marionette.Layout.extend({

        template: Template,

        className:'grid',

        subtype: 0,
        filteredCollection: null,
        subTypes:['UPS','Fedex','OnTrac','LoneStar','SpeeDee','BBExpress','MGC','Others'],

        initialize:function() {
            this.fetchCollection();
        },

        regions:{
            header:'.monHeader',
            content:'.table-box'
        },

        ui: {
            "tabs": ".tabs"
        },

        events:{
            'click ul.tabs li' : 'filterSubTypes',
            'click thead th' : 'sortTable'
        },

        onRender:function(){
            this.showContent();
            this.showHeader();
            this.showTabs();
        },

        showHeader: function(){
            this.headerView = new Header({context: this});
            this.header.show(this.headerView);
        },

        showContent: function(){
            if(this.options.orderType != 5)  this.showTable(this.collection);
            else this.showTable(this.collection);
        },

        showTable: function(collection){
            collection = collection || this.collection;
            this.filteredCollection = collection;
            if(this.options.orderType != 5) {
                this.tableView = new TableView({
                    name: 'monitoringTable',
                    id: 'id',
                    columns: {
                        'Order': 'orderNumber',
                        'Customer Name': 'customerName',
                        'City': 'shipToCity',
                        'State': 'shipToState',
                        'Order Date': 'orderDate',
                        'Release Date': 'releasedDate',
                        'Sub Type': 'orderSubType',
                        'Stage': 'batchStage',
                        'Employee': 'user'
                    },
                    radio: true,
                    sort: true,
                    callback: _.bind(this.orderSelected, this),
                    collection: collection
                });
                this.content.show(this.tableView);
            }else{
                this.tableView = new TableView({
                    name: 'exceptionTable',
                    id: 'orderNumber',
                    columns: {
                        'Order': 'orderNumber',
                        'Customer Name': 'customerName',
                        'City': 'shipToCity',
                        'State': 'shipToState',
                        'Order Date': 'orderDate',
                        'Order Type': 'orderType',
                        'Sub Type': 'orderSubType'
                    },
                    radio: true,
                    sort: true,
                    callback: _.bind(this.orderSelected, this),
                    collection: collection
                });
                this.content.show(this.tableView);
            }
        },

        orderSelected:function(model) {
            this.model = model;
            if(this.options.orderType == 5)this.headerView.showButton();
            else{
                if(model.has('batchNumber'))this.headerView.showButton();
                else this.headerView.hideButton();
            }
        },

        showTabs: function(){
            var types = ["Will Call", "Express", "Stock Order", "Incoming Shipment", "Exception Windows"];
            if(this.options.orderType == 2){
                var modelArr = this.options.orderTypesCollection.where({'orderType': 2}),
                tabsArr = [], that = this;
                _.each(modelArr, function(model){tabsArr.push(that.subTypes[model.get('orderSubType')])});
                if(tabsArr.length == 0){tabsArr.push("Express")}
                this.renderTabs(tabsArr);
            }
            else{this.renderTabs([types[this.options.orderType - 1]])}
        },

        renderExceptionsTabs:function(){
            var tabsArr = [];
            for(var i = 1; i <= 8; i++){
                if(this.collection.where({orderSubType: i}).length){tabsArr.push(this.subTypes[i])}
            }
            this.renderTabs(tabsArr);

        },

        //arr = ["express", "willCAll", "UPS"];
        renderTabs: function(arr){
            if(arr.length == 0){
                this.showTable(new Collection);
                return;
            }
            var that = this, $tabs = that.ui.tabs;
            $tabs.html("");
            _.each(arr, function(item){$tabs.append("<li>"+ item +"</li>")});
            this.filterSubTypes({currentTarget: "li:contains('"+ arr[0] +"')"});
        },

        sortTable: function(){
            this.headerView.unCheckRadio();
        },

        sortFilterCollection: function(collection, filter, sort){
            collection = collection || this.filteredCollection;
            if(filter) collection = new Collection(collection.where(filter));
            if(sort) {collection.comparator = function(model){return model.get(sort)};
                collection.sort();
            }
            this.showTable(collection);
        },

        filterSubTypes: function(e){
            this.headerView.hideButton();
            var that = this,
                target = this.$(e.currentTarget),
                subIndex = that.subTypes.indexOf(target.text()) + 1;
            if(!subIndex)return;
            target.addClass('active').siblings().removeClass('active');
            if(this.options.orderType == 5){
                this.sortFilterCollection(this.collection, {orderSubType: subIndex}, "overallRank")
            }else if(this.options.orderType == 2){
                this.fetchCollection(subIndex);
                this.showContent();
            }
        },

        dialog: function (e) {
            var dialog = $.Dialog({
                shadow: true,
                overlay: true,
                flat: true,
                zIndex: 500,
                icon: '',
                width: 800,
                height:600,
                padding: 20,
                content: new DialogView({model: this.model, context: this}).render().el
            });
        },

        changeBatchWorker: function(options){
            var coll = this.filteredCollection.where({'batchNumber': options.batchNumber});
            for(var i =0; i < coll.length; i++){
                if(options.user){coll[i].set('user', options.user);}
                else{coll[i].unset('user')}
            }
            this.filteredCollection.add(coll, {merge: true});
            this.collection.add(coll, {merge: true});

            this.showTable(this.filteredCollection);
        },

        deleteOrder: function(){
            this.fetchCollection();
            this.filteredCollection.remove(this.model);
            this.showTable(this.filteredCollection);
            this.headerView.hideButton();
        },

        fetchCollection: function(subtype){
            var that = this;
            if(this.options.orderType != 5){
                if(this.options.orderType == 2 && !subtype){return false}
                else if(this.options.orderType == 2 && subtype){
                    this.subtype = subtype;
                }else this.subtype = 0;
                this.collection = new Collection();
                this.collection.fetch({
                    data:{
                        type: this.options.orderType,
                        subtype: this.subtype
                    },
                    success: function(){that.tableView.collectionLoaded()},
                    error: function(){alert("error get orders")}
                });
            }
            else if(this.options.orderType == 5){
                this.collection = new ExceptionCollection();
                this.collection.fetch({
                    success: function(){
                        that.tableView.collectionLoaded();
                        console.log('exception orders get success')},
                    error: function(){alert("can't get exception orders")}
                });
            }
        }
    });
});
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'metro',

    './exceptionHeader',
    'widgets/tables/main',
    './process',
    './../content',

    'collections/manager/exceptionCollection',
    'text!templates/manager/monitoring/exception/tabs.html',
    'text!templates/manager/monitoring/exception/exceptionTabView.html'
], function ($, _, Backbone, Marionette, METRO,

        Header,
        TableView,
        ProcessView,
        Content,
        Collection,
        tabsTemplate,
        tabView) {

    'use strict';

    return Marionette.Layout.extend({

        template: tabView,
        className:'tab-control',
        subTypes:['UPS','Fedex','OnTrac','LoneStar','SpeeDee','BBExpress','MGC','Others'],

        filteredCollection: null,

        regions:{
            header:'header',
            content:'.table-box'
        },

        ui: {
            "tabs": ".tabs"
        },

        serializeData:function(){},

        events:{
            'click ul.tabs li' : 'filterSubTypes'
        },

        initialize:function(){
            var that = this;

            that.collection = new Collection();

            $.ajax({
                type: 'GET',
                url: '/monitoring/exception/orders',
                data:{
                    locationId: app.me.get('locationId')
//                    locationId: 1
                },
                success: function(data){
                    that.collection.reset(data.orders);
                    that.usersCollection = new Backbone.Collection(data.users);

                    console.log('exception orders get success');

                },
                error: function(){
                    alert("can't get exception orders");
                }
            });
        },

        onRender:function(){
            this.showHeader();
            this.showTable(this.collection);
            this.showTabs({tabs: false});
        },


        showHeader: function(){
            this.headerView = new Header({context: this});
            this.header.show(this.headerView);
        },

        showTable: function(collection){
            this.filteredCollection = collection;

            this.content.show(new TableView({

                name: 'exeption',
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
                height: 420,
                callback: _.bind(this.orderSelected, this),

                collection: collection
            }));
        },

        showTabs: function(options){
            if(options.tabs){
                var tabsArr = [];
                for(var i = 0; i <= 8; i++){
                    if(options.collection.where({orderSubType: i}).length){tabsArr.push({subType: this.subTypes[i], subTypeIndex: i})}
                }
                this.ui.tabs.html(_.template(tabsTemplate, {arr: tabsArr}));
                this.filterSubTypes(null, tabsArr[0].subTypeIndex);
            }
            else{
                this.ui.tabs.html(_.template(tabsTemplate, {arr: []}));
            }
        },

        filterSubTypes: function(e, subTypeIndex){
            this.headerView.hideButton();
            var subIndex = (subTypeIndex != undefined)? subTypeIndex: + $(e.currentTarget).attr('data-id');
            if(isNaN(subIndex)){return}
            this.$('.tabs li [data-id='+ subIndex +']').addClass('active').siblings().removeClass('active');
            var filteredArr = this.collection.where({orderSubType: subIndex}),
            collection = new Collection(filteredArr);
            this.showTable(collection);
        },


        orderSelected:function(model){
            this.model = model;
            this.headerView.showButton();
            console.log(this.model.toJSON());
        },

        process: function (e) {
            var dialog = $.Dialog({
                shadow: true,
                overlay: true,
                flat: true,
                zIndex: 500,
                icon: '',
//                title: '<span class="capitalize"></span>',
                width: 800,
                height:600,
                padding: 20,
                content: new ProcessView({context: this}).render().el
            });
        },

        filterOrders: function(options){
            this.headerView.hideButton();
            var collection;
            if(options.type == "0"){collection = this.collection;}
            else{

                var filteredArr = this.collection.where({orderType: + options.type});
                collection = new Collection(filteredArr);
                if(options.type == "2"){this.showTabs({tabs: true, collection: collection})}
                else{this.showTabs({tabs: false})}
            }
            this.showTable(collection);
        },

        deleteOrder: function(){
            this.filteredCollection.remove(this.model);
            this.showTable(this.filteredCollection);
            this.headerView.hideButton();
        }
    });
});

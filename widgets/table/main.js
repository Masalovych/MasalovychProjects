define(function (require) {

    'use strict';

    // Libraries
    var $           = require('jquery'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette'),
        nanoscroller  = require('nanoscroller');



    // Views
    var ItemView   = require('./views/item');

    // Templates
    var layout      = require('text!./templates/main.html');

    return Marionette.CompositeView.extend({

        className: 'tableWidget',

        template: layout,

        itemView: ItemView,

        itemViewContainer: 'tbody',

        itemViewOptions: function(){return{context: this}},

        serializeData:function(){
            return this.model.toJSON();
        },

        initialize: function(){
            var that = this;
            this.model = new Backbone.Model(this.options);
            this.collection = this.options.collection;
            this.setSortable();
        },

        onRender: function(){
            this.addTableName();
            this.addNanoscroler();
        },

        addNanoscroler: function(){
            this.$(".nano").nanoScroller();
        },

        addTableName: function(){
            if(this.options.name) this.$el.addClass(this.options.name)
        },

        setSortable: function(){
            if(this.options.sort){this.events = {'click th' : 'sort'}}
        },

        sort:function(e){
            var el = $(e.currentTarget),
                name = this.model.get('columns')[el.text()],
                asc = '';
            if(el.attr('type') == 'asc'){
                asc = el.attr('type');
                el.removeAttr('type');
            }
            else{
                asc = '';
                el.attr('type', 'asc');
            }
            if(name){
                el.parent().find('i').remove();
                el.append('<i class="icon-arrow-down-4"></i>');

                this.collection.comparator = function(model){
                    return model.get(name);
                };
                this.collection.sort();

                if(asc){
                    this.collection.models = this.collection.models.reverse();
                }
                this.collection.trigger('reset');
            }
        },

        unSelectAll: function(){
            this.$('tbody tr').removeClass('selected').find('input[type="radio"]').prop('checked', false);
        }
    });

});

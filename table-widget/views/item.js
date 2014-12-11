define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'metro',
    'text!./../templates/item.html'

], function ($, _, Backbone, Marionette, METRO, rowTemplate) {

    'use strict';

    return Marionette.ItemView.extend({

        tagName: 'tr',

        template: rowTemplate,

        serializeData:function(){
            var model = this.model.toJSON();
            if(this.model.dataToRender){
                model = this.model.dataToRender(model);
            }
            return model;
        },

        initialize: function(){
            this.template = _.template(rowTemplate, this.options.context.model.toJSON());
        },

        events: {
            'click'   : 'onClick'
        },

        onClick: function (e) {
            if(this.options.context.model.has('callback')){
                this.options.context.model.get('callback')(this.model)
            }
            if(this.options.context.model.get('radio')){
                var checkbox = this.$('td input[type="radio"]'),
                    tr = $(e.target).closest('tr');
                checkbox.prop('checked', 'checked');
                tr.addClass('selected').siblings().removeClass('selected');
            }
        }
    });
});
define([
	'text!templates/calendar/dateTimePicker.html',
	'text!templates/tasks/settingsHeader/reminder.html',
	'models/remainder'
],
function (timePickerTemplate, ReminderTemplate, RemainderModel) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({

        template: _.template(timePickerTemplate),

        initialize : function (options) {
            this.parent = options.parent;
            this.classes = ['hours', 'minutes', 'meridiem'];
            this.event = options.event;
            this.awaiting_input = false;
        },

        events: {
            'keydown .hours': 'hours_keypress',
            'keydown .minutes': 'minutes_keypress',
            'keydown .meridiem': 'meridiem_keypress',
            'focus .hours' : 'select',
            'focus .minutes' : 'select',
            'focus .meridiem' : 'select',
            'click .add_date': 'changeEventDate',
            'click .cancel_date': 'cancel'
        },

        render : function (input) {
            this.input = input;
            var datetime;
            if (input.hasClass("start")) {
                datetime = this.event.get("start");
            } else {
                datetime = this.event.get("finish");
            }
            this.$el.html(this.template({datetime: datetime}));
            this.$el.find(".timepicker.pop_up").css({top:(input.offset().top-200)+"px",left:(input.offset().left-320)+"px"});
            this.$el.find(".picker").datepicker({
                showOtherMonths: true
            });
            this.$el.find(".picker").datepicker("setDate", datetime);
            return this;
        },
        hours_keypress: function(e){
            this.handle_keypress(e, 'hours')
        },

        minutes_keypress: function(e){
            this.handle_keypress(e, 'minutes')
        },

        changeEventDate: function(){
            var self = this,
                date = this.$el.find(".picker").datepicker('getDate'),
                hours = parseInt(this.$el.find(".hours").val());
            date = new Date(date);
            if (this.$el.find(".meridiem").val()=="pm"){
                hours+=12;
            }
            date.setHours(hours);
            date.setMinutes(this.$el.find(".minutes").val());
            this.parent.saveEventDate(date, this.input);
            var model = this.parent.model.toJSON();
            var dateObject = this.parent.convertDate(model.start, model.finish, "withHours");
            $('#start').val(dateObject.start);
            $('#finish').val(dateObject.finish);
            this.cancel();

        },
        select: function(e){
            this.$el.find('.time_field').removeClass('selected');
            $(e.target).addClass('selected');
        },

        handle_keypress: function(e, type){
            if( e.metaKey || e.ctrlKey || e.altKey || e.keyCode == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ESC){
                e.preventDefault();
            }
            if (e.keyCode==$.ui.keyCode.UP){
                this["increment_"+type](e,1);
                return;
            }
            if (e.keyCode==$.ui.keyCode.DOWN){
                this["increment_"+type](e,-1);
                return;
            }
            this.handle_movement(e, type)
        },

        increment_hours:function(e,inc){
            var k = parseInt($(e.target).val());
            k+=inc;
            if (k<0){
                k=12;
            }
            if (k>12)k=0;
            $(e.target).val(k);

        },
        increment_minutes:function(e,inc){
            var k = parseInt($(e.target).val());
            k+=inc;
            if (k<0){
                k=59;
            }
            if (k>59)k=0;
            $(e.target).val(k);

        },

        handle_hours: function(key){
            if (this.awaiting_input){
                if (this.timeout)
                    clearTimeout(this.timeout);
                this.awaiting_input = false;
                var tens = this.model.get('hours');
                this.model.set_hours(tens*10+key)
            }
            else{
                if (key == 0){
                    this.model.set('meridiem', 'am');
                    return false
                }
                this.model.set_hours(key);
                if (key < 3){
                    this.awaiting_input = true;
                    if (this.timeout)
                        clearTimeout(this.timeout);
                    this.timeout = setTimeout(this.awaiting_input = false, Opus.constants.time_entry_delay);
                }
            }
            return true;
        },

        handle_minutes: function(key){
            if (this.awaiting_input){
                if (this.timeout){
                    clearTimeout(this.timeout);
                }
                this.awaiting_input = false;
                var tens = this.model.get('minutes');
                this.model.set_minutes(tens*10+key);
            }
            else{
                this.model.set_minutes(key);
                if (key < 6){
                    this.awaiting_input = true;
                    if (this.timeout){
                        clearTimeout(this.timeout)
                    }
                    this.timeout = setTimeout(this.awaiting_input = false,Opus.constants.time_entry_delay);
                }
            }
            return true;
        },

        handle_movement: function(e, type) {
            var handled_keys = [$.ui.keyCode.TAB, $.ui.keyCode.LEFT, $.ui.keyCode.RIGHT];
            if (e.keyCode in handled_keys){
                e.preventDefault()
            }
            switch (e.keyCode){
            case $.ui.keyCode.TAB:
                this.select_next_field(type, e.shiftKey);
                break;
            case $.ui.keyCode.LEFT:
                this.select_next_field(type, true);
                break;
            case $.ui.keyCode.RIGHT:
                this.select_next_field(type);
                break;
            }
        },
        select_next_field: function(current_field, backwards){
            var current_index = _.indexOf(this.classes, current_field);
            var inc = 1;
            if (backwards)
                inc = -1;
            var next_class = this.classes[(current_index + inc + 3) % 3];
            this.$("."+next_class).focus();
        },

        cancel: function(e){
            this.undelegateEvents();
            this.$el.remove();
        },

        meridiem_keypress: function(e){
            var handled_keys = [38, 40, 65, 80];
            if (e.keyCode in handled_keys){
                e.preventDefault()
            }
            switch (e.keyCode){
            case 38:
            case 40:
                if ($(e.target).val()=="am"){
                    $(e.target).val("pm");
                }else{
                    $(e.target).val("am");
                }
                break;
            case 65:
                $(e.target).val("am");
                break;
            case 80:
                $(e.target).val("pm");
                break;
            default:
                this.handle_movement(e, 'meridiem');
            }
        },

        editReminders:function(e){
            var reminderLi = $(e.target).closest('li');
            var input = reminderLi.find('input');
            input.datepicker({
                onSelect: function(){
                    var reminderId = reminderLi.attr('id'),
                    taskId = reminderLi.attr('remindable_id'),
                    date = input.datepicker('getDate'),
                    model = new RemainderModel();
                    model.urlRoot = '/tasks/' + taskId + '/reminders/';
                    model.save({id: reminderId, datetime: new Date(date)}, {
                        success: function(){
                            $('ul#reminders li #' + reminderId ).replaceWith(_.template(ReminderTemplate, {
                                id: reminderId,
                                datetime: date,
                                remindable_id: taskId
                            }));
                        },
                        error: function(){console.log(" error save reminder")}
                    });
                }
            });
            input.focus();
            return false;
        },

        destroyReminder: function(e){
            var currReminderLi = $(e.target).closest('li');
            var taskId = currReminderLi.attr('remindable_id');
            var reminderId = currReminderLi.attr('id');
            var model = new RemainderModel({id: reminderId});
            model.urlRoot = '/tasks/' + taskId + '/reminders/';
            model.destroy({
                success: function(){$('#reminders li#' + reminderId).remove()},
                error: function(){ alert("Not delete reminder");
                }
            });
        }
    });
});

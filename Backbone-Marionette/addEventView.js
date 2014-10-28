define([
	    'text!templates/calendar/addEvent.html',
	    'views/calendar/addContactView',
	    'views/page/calendar/addReminderView',
        'text!templates/calendar/newInvitess.html',
        'text!templates/calendar/newReminder.html',
        'views/calendar/dateTimePicker',
        'text!templates/calendar/attendences.html',
	'selectbox'

],
    function (AddEvent, AddContactView, AddReminderView, NewInvitessTemplate, NewReminderTemplate, DateTimePickerView, attendencesTemplate) {
        'use strict';

        var View = Backbone.Marionette.View.extend({
            template: _.template(AddEvent),
            className:'pop_up',

            attributes: function(){
                return {
                    'style': "position: absolute;"
                };
            },

            initialize : function (options) {
                this.parent = options.parent;
            },

            events: {
                'click #allday': 'checkAllday',
				'click .cancel': 'closeAddDialog',
                'click span.delete': 'destroyEvent',
				'click #start, #finish': 'openDatepicker',
				'keydown input.event_field': 'hideLabel',
				'click .add_invitee': 'openInviteesPopUp',
				'click .add_alarm': 'addNewReminder',
				'click #invitees .avatar': 'showAvatarMenuMount',
				'click .avatar_menu_mount .remove': 'removeAttendence',
				'click .avatar_menu_mount .viewProfile': 'viewProfile',
				'click .event_form' : 'hideAllPopUp',
                'click .accept' : 'acceptOrReject',
                'click .reject' : 'acceptOrReject'
            },
            render : function () {
                
                var model = this.model.toJSON();
                if ( Opus.collections.pendingEvents.get(this.model.id) ){
                    model.isPending = true;
                }

                var dateObject;
                if(model.allday){
                    dateObject = this.convertDate(model.start, model.finish, "withoutHours");
                }else{
                    dateObject = this.convertDate(model.start, model.finish, "withHours");
                }
                model.start = dateObject.start;
                model.finish = dateObject.finish;
                var attendecesArr = [];
                model.attendences
                    .forEach(function(attendence){
                        var invitee = Opus.people.get(attendence.user_id);
                        var options = {
                            user_id: attendence.user_id,
                            accept_status: attendence.accept_status,
                            accept_status_str: attendence.accept_status == 1 ? "accepted" : "pending",
                            acceptKey: attendence.acceptkey,
                            attendence_id: attendence.id,
                            avatar_url: invitee.attributes.avatar_url || "https://secure.gravatar.com/avatar/7e501b840c474ffbd0d1124af2bcabf4.png?r=PG",
                            user_name: Opus.currentUser.id != invitee.attributes.id ? invitee.attributes.name : "Me",
                        };
                        attendecesArr.push(options);
                    });
                //console.log(attendecesArr);
				//console.log(model);
                this.$el.html(this.template({event: model, attendences: attendecesArr}));
				if (this.$('.alarm_period').length>0)
					this.$('.alarm_period').sb({fixedWidth: true});

                
				return this;
            },
		
            convertDate: function(start, finish, dateFormat){
                if (dateFormat == "withHours"){
                    var startReady = moment(start).format("dddd, MMM D [at] h:mm A");
                    var finishMom = moment(finish);
                    finishReady = finishMom.from(start);
                }
                else if(dateFormat == "withoutHours"){
                        if(new Date(start).getDate() != new Date(finish).getDate()){
                            var startReady = moment(start).format('dddd, MMM D');
                            var finishMom = moment(finish);
                            var finishReady = finishMom.from(start);
                        }
                        else{
                            var startReady = moment(start).format('dddd, MMM D');
                            var finishReady = "a few moment later"
                        }


                }
                return {
                    start: startReady,
                    finish: finishReady
                }
            },

            checkAllday: function(e){
                var eventModel = this.model.toJSON();
                var dateObject;
                if ($(e.target).is(':checked')){
                    this.model.set('allday', true);
                    dateObject = this.convertDate(eventModel.start, eventModel.finish, "withoutHours");
                }
                else{
                    this.model.set('allday', false);
                    dateObject = this.convertDate(eventModel.start, eventModel.finish, "withHours");
                }
                $('#start').val(dateObject.start);
                $('#finish').val(dateObject.finish);
            },

            renderInvitation: function(invitationArr){
                var invitationCont = $('ul#invitees');
                invitationCont.html(_.template(NewInvitessTemplate, {invitationArr: invitationArr}));
            },                              

            addNewReminder: function(){
            //adding reminders to the event
				
                $('ul.alarms').append(_.template(NewReminderTemplate));
				this.$('ul.alarms .alarm_period:last').sb({fixedWidth: true});
                return false;
            },

            closeAddDialog: function(){
                $(".pop_up").hide();  // hide addEvent popup and reminders, invitees, ect.
                return false;
            },

            openDatepicker: function(e){
                //open datepicker to set start or finish date-time of event
                var self = this;
                var input = $(e.target);
                var checkbox = this.$el.find("#allday");
                var datetime;
                if (input.hasClass("start")) {
                    datetime = this.model.get("start");
                } else {
                    datetime = this.model.get("finish");
                }
                
                if (checkbox.is(':checked')){
                //open datePicker
                    $('.timepicker').remove();
                    input.datepicker({
                        onSelect: function(){
                            console.log('onSelect');
                            var date = input.datepicker('getDate');
                            self.saveEventDate(date, input);
                            var model = self.model.toJSON();

                            var dateObject = self.convertDate(model.start, model.finish, "withoutHours");
                            $('#start').val(dateObject.start);
                            $('#finish').val(dateObject.finish);
                            input.datepicker("destroy");
                            $("#ui-datepicker-div").remove();
                        }
                    });
                    input.datepicker("setDate", datetime);
                    input.focus();
                }
                else{
                    input.datepicker( "destroy" );
                    input.datepicker( "hide" );

                    //$(".timepicker").remove();
                    $("body").append(new DateTimePickerView({parent: this, event: this.model}).render(input).el);
                    $("#ui-datepicker-div").remove();
                    input.focus();
                }
                return false;
            },

            saveEventDate: function(date, input){
                if(input.attr('id') == "start"){
                    this.model.set("start", date);
                }else if(input.attr('id') == "finish"){
                    this.model.set("finish", date);
                }
                this.displayNewDate();
            },

            displayNewDate: function(){
                var model = this.model.toJSON();
                console.log(model);
            },

            hideLabel:function(e){

                var textFunc = function(){

                   var inputLabel = $('label.placeholder');
                   var inputText =  $('input.event_field').val();

                    if (inputText == "") {
                        inputLabel.show();
                    }
                    else {
                        inputLabel.hide();
                    }
                }

                var code = (e.keyCode ? e.keyCode : e.which);

                if(code == 13){
                    $('input.add').click();
                }
                if(code != 8) {
                    setTimeout(textFunc, 0);
                }else {
                    setTimeout(textFunc, 0);
                }
            },

            openInviteesPopUp: function(e){
                //open invitaton dialog to add new people to the event
                var elH = 514;
                var elW = 280;
                var winH = $(window).height();
                var winW = $(window).width();
                var pX = e.pageX;
                var pY = e.pageY;
                var left = pX - elW - 40;
                var top = pY - 50;

                var self = this;
                var addContactView = new AddContactView({event: this.model, parentView: self});
                addContactView.on('addUsersToEvent', this.renderInvitation, this);
                $('.add_contacts').html(addContactView.render().el);
                $('.add_contacts').attr({
                    'class':'add_contacts pop_up multi',
                    'style': 'position: absolute; display: block;'
                });
                $('.add_contacts').offset({top: 150, left: left});
                return false;
            },

            renderNewUsers: function(users){
                //console.log('renderNewUsers');
                //console.log(users);
                var self = this;
                var liContainer = this.$el.find("#invitees");
                users.forEach(function(attendence){
                    var invitee = Opus.people.get(attendence.user_id);
                    var options = {
                        user_id: attendence.user_id,
                        accept_status: attendence.accept_status || 2,
                        //accept_status_str: attendence.accept_status == 1 ? "accepted" : "pending",
                        avatar_url: invitee.attributes.avatar_url || "https://secure.gravatar.com/avatar/7e501b840c474ffbd0d1124af2bcabf4.png?r=PG",
                        user_name: Opus.currentUser.id != invitee.attributes.id ? invitee.attributes.name : "Me",
                    };
                    liContainer.append(_.template(attendencesTemplate, {attendence: options}));
                });
            },

            showAvatarMenuMount:function(e){
                this.$el.find("#invitees .avatar_menu_mount").hide();
                $(e.target).next().attr('style', 'display: block;').children().attr('style', 'display: block;');
                return false;
            },

            removeAttendence: function(e){
                var li = $(e.target).closest('li.invitees_item');
                if (li.attr('user_id') == Opus.currentUser.id){
                    li.hide();
                } else {
                    li.remove();
                }
                return false;
            },

            viewProfile: function(e){
                console.log('viewProfile');
                Opus.Routers.navigate('#contacts', {trigger: true});
                this.$el.hide();
                return false;
            },

            hideAllPopUp: function(e){
                this.$el.find('.pop_up').hide();
                this.$el.find('.avatar_menu_mount').hide();
                $(".add_contacts.pop_up").hide();
            },

            destroyEvent: function(){
                var modelId = this.model.get('id');
                var self = this;
                if (modelId == undefined){
                    this.closeAddDialog();
                }
                else{
                    var model = this.parent.eventsCollection.get(modelId);
                    model.destroy({
                        success: function(){
                            self.parent.eventsCollection.remove(model);
                            $('#full_calendar').fullCalendar( 'removeEvents', modelId );
                            self.closeAddDialog();
                        },
                        error: function(model, res, options) {
                            self.closeAddDialog();
                            Opus.vent.trigger('failureResponse', model, res, options);
                        }
                    });
                }

            },
            acceptOrReject : function(e){
                e.stopPropagation();

                var acceptType = e.target.className;   //'accept' or 'reject';
                var acceptContainer = $(e.target).closest('.event_form');
                var eventId = acceptContainer.data('eventId');
                this.closeAddDialog();

                var event = Opus.collections.pendingEvents.get(eventId);
                if (event){
                    event.attributes.attendences.forEach(function (user){
                        if (user.user_id == Opus.currentUser.id && user.accept_status == 2){
                            var acceptKey = user.acceptkey;
                            var url = event.urlRoot+'/'+eventId+'/'+acceptType+'/'+ user.acceptkey;

                            $.ajax({
                                url: url,
                                type: "GET",
                                success: function (data, textStatus) {
                                    Opus.collections.pendingEvents.remove(eventId);
                                    //Opus.vent.trigger('update_badge', {type: 'calendar', increment: false});
                                    if (acceptType === 'accept') {
                                        $('#full_calendar [data-id="'+eventId+'"] .pending_badge').remove();
                                        $('#eventPopUp #invitees [user_id="'+Opus.currentUser.id+'"]').attr('title', 'Me / accepted');
                                    } else {
                                        //Opus.Collections.allEvent.remove(eventId);
                                        Opus.collections.allEvents.remove(eventId);
                                    }
                                },
                                error: function(model, res, options) {
                                    Opus.vent.trigger('failureResponse', model, res, options);
                                }
                            });    
 
                        }
                    });
                }
            }

        });

        return View;
    });

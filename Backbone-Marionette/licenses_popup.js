define([
        'text!templates/page/mainLaunchPad/request_confirmation.html'
    ],
    function (requestConfirmation) {
        'use strict';
        var View = Backbone.Marionette.View.extend({
            template: _.template(requestConfirmation),
			className: 'confirmation_popup',

            initialize : function (option) {
				this.licenses = option.licenses;
				this.callback = option.callback;
				var self = this;
				$.ajax({
					url: '/users/plan',
					type: "GET",
					dataType: "json"
				})
					.done(function(data, status, response) {
						console.log(data);
						self.plan = data;
						return self.render();
					})
					.fail(function (data) {
						Opus.execute('info_message', data);
					});
            },
            events: {
				"click .accept"                 : "continueAccept",
				"click .cancel"                 : "leave",
				"click .update_billing_button"  : "update_billing"
            },
			
			render: function(){
				$(document).find(".confirmation_popup").undelegate().remove();
				this.$el.html(this.template());
				this.$el.css({"position":"absolute"});
				$("body").append(this.$el);
				this.$('h5').html("Are you sure you wish to upgrade your group plan from "+Opus.plan.toJSON().group_plan.licenses+" licenses to "+this.icenses+" licenses?" );
				var base_msg = "Are you sure you want to subscribe to the group with "+this.licenses+" licenses?";
				this.$('h4').html(base_msg);
				var cc_msg = "Your credit card will be charged and your plan will be updated immediately."
				this.$('p').html(cc_msg);
				this.$('.update_billing_button').hide();
				return this;
			},

			continueAccept: function(){
				var self = this;
				   $.ajax({
					   url: "/users/update_licenses",
					   type: "PUT",
					   data:{licenses:this.licenses},
					   success: function (data, textStatus) {
						   var gp = Opus.plan.toJSON().group_plan;
						   gp.licenses = self.licenses;
						   Opus.plan.set({group_plan:gp});
						   var memb = parseInt($(".group_members_header .users_count .members").text());
						   $(".group_members_header .users_count .available").text(self.licenses-memb);
						   $(".group_members_header .users_count .licenses").text(self.licenses);
						   if (self.callback)self.callback();
					   },
					   error:function(error){
						   if (error&&error.responseJSON)
							   Opus.vent.trigger('new_notification', { status: 'Error', message: error.responseJSON.error });
					   }
				   });
				$(".confirmation_popup").remove();
			},

			leave: function(){
				this.undelegateEvents();
				$(".confirmation_popup").remove();
			}



        });

        return View;
    });

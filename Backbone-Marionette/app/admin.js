define(function (require) {
    'use strict';

    // Libraries
    var $           = require('jquery'),
        Backbone    = require('backbone'),
        Marionette  = require('marionette');

    // Routers
    var Router      = require('routers/admin');

    //check Equipment

    var ErrorView      = require('errorView');


    // Models
    var UserModel   = require('models/userModel');

//set new Backbone.ajax function
    Backbone.ajax=function(){
        if(typeof(arguments[0]) == "object"){
            console.log("arguments");
            var arg = arguments[0];
            arg['statusCode'] = {403: function(respons) {
                var error = JSON.parse(respons.responseText).error,
                    message = error.text,
                    code = error.code;
                app.vent.trigger('adminError', {type: "showMessage",code: code, message: message});
            }};
            console.log(arg);
            return Backbone.$.ajax.apply(Backbone.$,[arg]);
        }
        else{
            return Backbone.$.ajax.apply(Backbone.$,arguments)
        }
    };

    $.ajaxSetup({
        headers: {
            Accept : "application/json; charset=utf-8",
            "Content-Type": "application/json"
        }
    });



    var app = new Marionette.Application({

        verifyLoggedIn: function () {
            Backbone.ajax('/auth/me', {
                success: function (userData) {
                    if (userData) {
                        app.me = new UserModel();
                        app.me.set(app.me.parse(userData));
                        app.loggingIn = false;
                        app.router = new Router();
                        if (!window.location.hash) {
                            window.location.hash = 'home';
                        }
                    } else {
                        app.loggingIn = false;
                        window.location = '/admin/login';
                    }
                },
                error: function () {
                    app.loggingIn = false;
                    window.location = '/admin/login';
                }
            });
        },

        adminError : function(options){
            if(options) {
                var content = new ErrorView(options).render().el;
                $('body').append(content);
            }
        },


        onStart: function () {
            console.log('start app test');
        }

    });

    app.addInitializer(function () {
        this.verifyLoggedIn();
        // Pass in our Router module and call it's initialize function
        // Session.initialize();
        // MetroSideBar.initialize();
    });

    app.addInitializer(function () {
        _.extend(Marionette.TemplateCache.prototype, {
            loadTemplate: function (tpl) {
                return tpl;
            }
        });
    });

    app.vent.on('adminError', app.adminError);



//    app.addInitializer(function () {
//        this.checkEquipmentAccess();
//        // Pass in our Router module and call it's initialize function
//        // Session.initialize();
//        // MetroSideBar.initialize();
//    });

    // TODO: remove this by using app as requirejs dependency
    window.app = app;

    return app;
});
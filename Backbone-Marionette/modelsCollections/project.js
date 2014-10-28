define([
        "models/project"
],
    function (projectModel) {
        var Projects = Backbone.Collection.extend({

            url: "/projects",

            model: projectModel,

            initialize: function (options) {

                if (options && options.active)
                    this.url = "/projects?f=active";
                if (options && options.pending)
                    this.url = "/projects?f=pending";

                if (options && !options.fetch) {
                    this.projectOrder();
                }
                else {
                    this.fetchCollection();
                    this.projectOrder();
                }

            },

            projectOrder: function () {
                var curUser = Opus.currentUser.toJSON();
                if (!curUser.task_order || curUser.project_order == "---\n...\n") {
                    Opus.currentUser.set("project_order", "[]");
                }
                var projectOrder = curUser.project_order;
                if (projectOrder.indexOf('\n') !== -1) {
                    projectOrder = projectOrder.replace(/---|\n/g, '').split('- ');
                    projectOrder = _.compact(projectOrder);
                    projectOrder = _.map(projectOrder, function (order) {
                        return parseInt(order);
                    });
                    this.project_order = projectOrder;
                } else {
                    this.project_order = JSON.parse(curUser.project_order);
                }
            },

            fetchCollection: function () {
                this.fetch({
                    reset: true,
                    success: function () {
                        //console.log('success fetch projects collection');
                    },
                    error: function () {
                        console.log('An Error occured when fetch projects collection');
                    }
                });
            },

            comparator: function (task) {
                var id = task.get('id');
                return this.project_order.indexOf(id);
            },
            parse: function (response) {
                return response;
            }


        });
        return Projects;
    });


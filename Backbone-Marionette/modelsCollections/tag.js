define(["collections/base"],function (Base) {
    var Alarm = Base.extend({


		model: Opus.Models.Tag,

		initialize: function(models, options) {
			return this.source = options != null ? options.source : void 0;
		},

		url: function() {
			if (this.source) {
				return "/" + this.source.model_name + "s/" + this.source.id + "/tags";
			} else {
				return "/tags";
			}
		},

		comparator: function(first, second) {
			if (first.get('count') > second.get('count')) {
				return -1;
			} else if (second.get('count') > first.get('count')) {
				return 1;
			} else {
				if (first.get('name') > second.get('name')) {
					return -1;
				} else if (second.get('name') > first.get('name')) {
					return 1;
				} else {
					return 0;
				}
			}
		},

		update: function(models) {
			return this.reset(models);
		}

	});
    return Alarm;
});
/*
Opus.Collections.Tags = (function(_super) {
  __extends(Tags, _super);

  function Tags() {
    return Tags.__super__.constructor.apply(this, arguments);
  }

  Tags.prototype.model = Opus.Models.Tag;

  Tags.prototype.initialize = function(models, options) {
    return this.source = options != null ? options.source : void 0;
  };

  Tags.prototype.url = function() {
    if (this.source) {
      return "/" + this.source.model_name + "s/" + this.source.id + "/tags";
    } else {
      return "/tags";
    }
  };

  Tags.prototype.comparator = function(first, second) {
    if (first.get('count') > second.get('count')) {
      return -1;
    } else if (second.get('count') > first.get('count')) {
      return 1;
    } else {
      if (first.get('name') > second.get('name')) {
        return -1;
      } else if (second.get('name') > first.get('name')) {
        return 1;
      } else {
        return 0;
      }
    }
  };

  Tags.prototype.update = function(models) {
    return this.reset(models);
  };

  return Tags;

})(Opus.Collections.Base);
*/

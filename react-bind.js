var parse = require('obj-parse');
var _ = require('lodash');

function ReactBind(config) {
  if (!config) config = {};
  config = _.assign({
    propName: 'model',
    stateName: 'model',
    onNewModel: function(ev) {
      var newState = {};
      newState[config.stateName] = ev.model;
      if (ev.target.props) {
        ev.target.setState(newState);
      } else {
        ev.target.state = _.assign(ev.target.state || {}, newState);
      }
    }
  }, config);

  var exprCache = {};

  function Binder(component) {
    this.component = component;
    this.model = {};
    this.bind = this.bind.bind(this);
  }

  Binder.prototype.setModel = function(model) {
    if (this.hasPropModel()) {
      this.component.props[config.propName].set(model);
    }
    this.model = model;
    this.notifyModel();
  };

  Binder.prototype.notifyModel = function () {
    var state = {};
    state[config.stateName] = _.cloneDeep(this.model);
    var eventData = {
      target: this.component,
      binder: this.binder,
      oldModel: this.component.state && this.component.state[config.stateName],
      model: _.cloneDeep(this.model)
    };
    if (this.component.onNewModel) {
      this.component.onNewModel(eventData);
    } else {
      config.onNewModel.call(this.component, eventData);
    }
  };

  Binder.prototype.hasPropModel = function () {
    return this.component.props && this.component.props.hasOwnProperty(config.propName);
  };

  Binder.prototype.hasOwnModel = function () {
    return !this.hasPropModel();
  };

  Binder.prototype.getModel = function () {
    return this.hasOwnModel() ? this.model : this.component.props[config.propName].model;
  };

  Binder.prototype.getModelState = function () {
    return this.hasOwnModel() ? this.component.state.model : this.component.props.model.state;
  };

  Binder.prototype.getRootBinder = function () {
    return this.hasPropModel() ? this.component.props[config.propName].root : this;
  };

  Binder.prototype.ensureModelObject = function () {
    if (this.hasOwnModel()) {
      if (!this.model) {
        if (this.model === null || this.model === undefined) {
          this.model = {};
          return this.model;
        } else {
          console.error("Error info:", this, this.model);
          throw new Error("Model object required at root, but model is already set.");
        }
      } else {
        return this.model;
      }
    } else {
      return this.component.props[config.propName].ensureModelObject();
    }
  };


  Binder.prototype.bind = function (expr) {
    var tool = (function () {
      var existing = exprCache[expr];
      if (existing) return existing;
      var newExpr = parse(expr);
      exprCache[expr] = newExpr;
      return newExpr;
    }());

    return {
      set: function (value) {
        tool.assign(this.ensureModelObject(), value);
        this.getRootBinder().notifyModel();
      }.bind(this),
      state: tool(this.getModelState()),
      model: tool(this.getModel()),
      parentModel: this.getModel(),
      parent: this.component.props['model'] || null,
      root: this.getRootBinder(),
      ensureModelObject: function () {
        if (!this.model) {
          if (this.model === null || this.model === undefined) {
            this.model = {};
            tool.assign(this.parentModel, this.model);
            return this.model;
          } else {
            console.error("Error info:", this, this.model);
            throw new Error("Model object required at bind, but model is already set.");
          }
        } else {
          return this.model;
        }
      }
    }
  };

  return {
    Binder: Binder
  }
}

module.exports = {
  ReactBind: ReactBind,
  Binder: ReactBind().Binder
};


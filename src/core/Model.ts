/**
* Model decorator
*/
export function Model() {

  return function(target) {

    initializeAttrs(target);
    initializeValidations(target);
    injectModel(target);
    const enhancedTarget = enhanceTarget(target);
    initializePrototypeAttrs(enhancedTarget,target.attrs);
    return enhancedTarget;
  }

}

function initializeAttrs(target) {
  target.attrs = Object.assign({},target.attrs);
}

function initializeValidations(target) {
  target.validations = Object.assign({},target.validations);
}

function enhanceTarget(target) {

  return class extends (target as { new(): any;}) {

    constructor(attrs = {}) {
      super();
      this.model = target.model.create();
      this.populateAttrs(attrs);
    }

    populateAttrs(attrs) {
      for (const attr in attrs) {
        const value = attrs[attr];
        this[attr] = value;
      }
    }

    validate(throwError:boolean = true) {
      return new Promise((fullfill,reject) => {
        this.model.validate().then(() => {
          if (this.model.isValid || !throwError) {
            fullfill(this.model);
          } else {
            reject(this.model.errors);
          }
        })
      });
    }

  }

}

function createModel(target) {

  const model = require('nodejs-model')(target.name);
  const attrs = target.attrs;
  for (const attr in attrs) {
    const options = typeof attrs[attr] === "object" ? Object.assign({},attrs[attr]) : {};
    model.attr(attr,options)
  }
  return model;

}

function injectModel(target) {
  target.model = createModel(target);
}

function initializePrototypeAttrs(enhancedTarget,attrs) {

  for (const attr in attrs) {
    const type = typeof attrs[attr] === "object" ? attrs[attr].type : attrs[attr];
    initializePrototypeAttr(enhancedTarget.prototype,attr,type);
  }

}

function initializePrototypeAttr(enhancedPrototype,attrName,type) {

  const isValidType = (value,type) => {

    if (!type || type === "any") {
      return true;
    }

    const souldUseInstanceOf = typeof type === "function" && typeof value === "object";

    if (souldUseInstanceOf) {
      return value instanceof type;
    } else {
      return typeof value === type;
    }
  }

  Object.defineProperty(enhancedPrototype,attrName,{
    get: function() {
      return this.model[attrName]();
    },
    set: function(value) {

      if (!isValidType(value,type)) {
        throw new TypeError(`${value} is not a ${type}`);
      }
      return this.model[attrName](value);
    }
  });

}

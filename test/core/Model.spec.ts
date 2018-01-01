require("chai").use(require("chai-as-promised"));

import { expect } from 'chai';
import { Model } from '../../src/udev-model-ts';
import * as model from 'nodejs-model';

describe('Model Specifications', () => {

  describe('annotating a class with Model and adding a required attribute called title',() => {

    @Model()
    class Post {

      static attrs = {
        title: { type: "string", validations: { presence:true } }
      }
    }

    it('the validation promise should be rejected when an instance is created without setting the required field', () => {
      const post = new Post();
      return expect(post.validate()).to.be.rejected;
    });

    it('the validation promise should be fullfilled when an instance is created setting the required field', () => {
      const post = new Post({ title:"My Post" });
      return expect(post.validate()).to.be.fulfilled;
    });

  });

  describe('annotating a class with Model and adding a required attribute called createdAt',() => {

    @Model()
    class Post {

      static attrs = {
        createdAt: { type: Date }
      }
    }

    it('should throw an error when an instance is created setting an invalid type', () => {
      expect(() => new Post({ createdAt: "notADate" })).to.throw(TypeError);
    });

  });


});

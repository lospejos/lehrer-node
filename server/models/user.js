'use strict';

var config    = require('./../config/app'),
    bookshelf = require('./../config/bookshelf'),
    Promise   = require('bluebird'),
    Bcrypt    = require('bcryptjs'),
    Jwt       = require('jsonwebtoken');

var User = bookshelf.Model.extend({
  tableName: 'users',

  create: function(params) {
    const self = this;
    return new Promise(function(resolve, reject) {
      if(params.email === null ||
         params.password === null ||
         params.password.length < 6 ||
         params.password !== params.passwordConfirmation) {
        reject({error: 'error while validating data'});
      } else {
        let promise = self.save({email: params.email,
                                 encryptedPassword: Bcrypt.hashSync(params.password, 10)});
        promise.then(function(data) {
          resolve(this.token(data.attributes.id));
        });
        promise.catch(function(e) {
          reject({error: e});
        });
      }
    });
  },

  login: function(email, password) {
    const self = this;
    return new Promise(function(resolve, reject) {
      var promise = self.fetch({email: email});

      promise.then(function(data) {
        if(data === null){
          reject({error: 'bad username or password'});
        }
        Bcrypt.compare(password, data.attributes.encryptedPassword, function (err, isValid) {
          if(isValid)
            resolve(this.token(data.attributes.id));
          else
            reject({error: 'bad username or password'});
        }.bind(this));
      });

      promise.catch(function(e) {
        reject({error: e});
      });
    });
  },

  token: function(userId) {
    return({token: Jwt.sign({ id: userId }, config.secretKey, {expiresIn: '1h'})});
  }
}, {//class methods start

  find: function(userId) {
    return new User({id: userId}).fetch();
  },

  validate: function (decoded, request, callback) {
    const promise = new User({id: decoded.id}).fetch();
    promise.then(function(data) {
      if(data === null){
        return callback(null, false);
      } else {
        return callback(null, true);
      }
    });
    promise.catch(function(e) {
      return callback(null, false);
    });
  }

});


module.exports = User;

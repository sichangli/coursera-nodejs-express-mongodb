const express = require("express");
const bodyParser = require("body-parser");
const favoriteDb = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    favoriteDb
      .findOne({ user: req.user._id })
      .populate(["user", "dishes"])
      .then(
        favorites => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    favoriteDb
      .findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          req.body.forEach(dish => {
            if (favorites.dishes.indexOf(dish._id) === -1) {
              favorites.dishes.push(dish._id);
            }
          });
          favorites.save().then(
            favorites => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            },
            err => next(err)
          );
        } else {
          console.log("Favorites doesn't exists, creating new one");
          const dishes = [];
          req.body.forEach(dish => dishes.push(dish._id));
          favoriteDb
            .create({ user: req.user._id, dishes: dishes })
            .then(
              favorites => {
                console.log("Favorites Created ", favorites);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              },
              err => next(err)
            )
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    favoriteDb
      .findOneAndRemove({ user: req.user._id })
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites" + req.params.dishId);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    favoriteDb
      .findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          const index = favorites.dishes.indexOf(req.params.dishId);
          if (index === -1) {
            favorites.dishes.push(req.params.dishId);
          }
          favorites.save().then(
            favorites => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            },
            err => next(err)
          );
        } else {
          console.log("Favorites doesn't exists, creating new one");
          favoriteDb
            .create({ user: req.user._id, dishes: [req.params.dishId] })
            .then(
              favorites => {
                console.log("Favorites Created ", favorites);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              },
              err => next(err)
            )
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    favoriteDb
      .findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          const index = favorites.dishes.indexOf(req.params.dishId);
          if (index > -1) {
            favorites.dishes.splice(index, 1);
            favorites.save().then(
              favorites => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              },
              err => next(err)
            );
          } else {
            err = new Error("Dish doesn't exists in favorites, cannot delete");
            err.status = 404;
            return next(err);
          }
        } else {
          err = new Error("Favorites doesn't exists, cannot delete dish");
          err.status = 404;
          return next(err);
        }
      })
      .catch(err => next(err));
  });

module.exports = favoriteRouter;

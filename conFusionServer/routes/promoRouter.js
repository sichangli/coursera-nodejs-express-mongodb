const express = require("express");
const bodyParser = require("body-parser");
const promoDb = require("../models/promotions");
const authenticate = require("../authenticate");
const cors = require("./cors");

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    promoDb
      .find(req.query)
      .then(
        promotions => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotions);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      promoDb
        .create(req.body)
        .then(
          promotion => {
            console.log("Promotion Created ", promotion);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(promotion);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /promotions");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      promoDb
        .remove({})
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

promoRouter
  .route("/:promoId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    promoDb
      .findById(req.params.promoId)
      .then(
        promotion => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        "POST operation not supported on /promotions/" + req.params.promoId
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      promoDb
        .findByIdAndUpdate(
          req.params.promoId,
          {
            $set: req.body
          },
          { new: true }
        )
        .then(
          protmo => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(protmo);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      promoDb
        .findByIdAndRemove(req.params.promoId)
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

module.exports = promoRouter;

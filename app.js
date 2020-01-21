const knex = require('knex');
const express = require("express");
const app = express();
const environment = process.env.NODE_ENV || "development";
const configuration = require("./knexfile")[environment];
const database = require("knex")(configuration);
const cors = require("cors");

app.use(cors())
app.use(express.json());

app.locals.title = "Res Players";

app.get("/api/v1/players", (request, response) => {
    console.log('req', request)
    console.log('res', response)
    if (request.query.name) {
      database("players")
        .then(players => {
          if (players.length === 0) {
            console.log('hi')
            return response.status(404).json({error: `Could not find player with name ${request.query.name}`})
          } else {
            response.status(200).json(players);
          }
        })
    } else {
      database("players")
        .select()
        .then(players => {
          response.status(200).json(players);
        })
        .catch(error => {
          response.status(404).json({ error });
        });
    }
  });

app.get("/api/v1/scores", (request, response) => {
    database("scores")
      .select()
      .then(scores => {
        response.status(200).json(scores);
      })
      .catch(error => {
        response.status(500).json({ error });
      });
  });

  app.post("/api/v1/players", (request, response) => {
    const player = request.body;
    for (let requiredParameter of ["name"]) {
      if (!player[requiredParameter]) {
        return response.status(422).send({
          error: `Expected format: { name: <String> }. You're missing a "${requiredParameter}" property.`
        });
      }
    }
    database("players")
      .insert(player, "id")
      .then(playerId => response.status(201).json({ id: playerId[0] }))
      .catch(error => response.status(500).json({ error }));
  });

  app.post("/api/v1/scores", (request, response) => {
    const score = request.body;
    for (let requiredParameter of [
      "player_id",
      "score"
    ]) {
      if (score[requiredParameter] === undefined) {
        return response.status(422).send({
          error: `Expected format: { player_id: <String>, score: <String> }. Youre missing a "${requiredParameter}" property.`
        });
      }
    }
    database("scores")
      .insert(score, "id")
      .then(scoreId => response.status(201).json({ id: scoreId[0] }))
      .catch(error => response.status(500).json({ error }));
  });


  app.delete("/api/v1/scores/:id", (request, response) => {
    database("scores")
      .where("id", request.params.id)
      .del()
      .then(res => {
        if (res) {
          response
            .status(200)
            .json(`score with the id of ${request.params.id} has been deleted`);
        } else {
          response
            .status(404)
            .json(`Could not find score with the id of ${request.params.id}`);
        }
      })
      .catch(error => {
        response.status(500).json({ error });
      });
  });

  app.delete("/api/v1/players/:id", async (request, response) => {
    let id = request.params.id;
  
    database("palettes")
      .where("player_id", id)
      .del()
      .then(res => {
        database("players")
          .where("id", id)
          .del()
          .then(res => {
            if (res) {
              response
                .status(200)
                .json(`player with the id of ${id} has been deleted.`);
            } else {
              response
                .status(404)
                .json({ error: `Could not find player with the id of ${id}` });
            }
          });
      })
      .catch(error => {
        response.status(500).send({ error });
      });
  });

  module.exports = app;
let playersData = [
  {
    name: 'Test Player 1',
    scores: [420]
  },   
  {
    name: 'Test Player 2',
    scores: [500]
  }
]


const createPlayer = (knex, player) => {
  return knex('players').insert({
    name: player.name
  }, 'id')
    .then(playerId => {
      let scoresPromises = [];

      player.scores.forEach(score => {
        scoresPromises.push(
          createscore(knex, {
            player_id: playerId[0],
            score: player.scores[0]
          })
        )
      })

      return Promise.all(scoresPromises);
    })
}

const createscore = (knex, score) => {
  return knex('scores').insert(score)
} ;

exports.seed = (knex) => {
  return knex('scores').del()
    .then(() => knex('players').del())
    .then(() => {
      let playerPromises = [];

      playersData.forEach(player => {
        playerPromises.push(createPlayer(knex,player));
      })

      return Promise.all(playerPromises);
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
}
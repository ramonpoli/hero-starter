/*

  Strategies for the hero are contained within the "moves" object as
  name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

  The "moves" object only contains the data, but in order for a specific
  strategy to be implemented we MUST set the "move" variable to a
  definite property.  This is done like so:

  move = moves.heWhoLivesToFightAnotherDay;

  You MUST also export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")

  The "move" function should accept two arguments that the website will be passing in:
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  Such is the power of Javascript!!!

*/

// Strategy definitions
var moves = {
  // Aggressor
  aggressor: function(gameData, helpers) {
    // Here, we ask if your hero's health is below 30
    if (gameData.activeHero.health <= 30){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go attack someone...anyone.
      return helpers.findNearestEnemy(gameData);
    }
  },

  // Health Nut
  healthNut:  function(gameData, helpers) {
    // Here, we ask if your hero's health is below 75
    if (gameData.activeHero.health <= 75){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go mine some diamonds!!!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // Balanced
  balanced: function(gameData, helpers){
    //FIXME : fix;
    return null;
  },

  // The "Northerner"
  // This hero will walk North.  Always.
  northener : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    return 'North';
  },

  // The "Blind Man"
  // This hero will walk in a random direction each turn.
  blindMan : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  },

  // The "Priest"
  // This hero will heal nearby friendly champions.
  priest : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 60) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestTeamMember(gameData);
    }
  },

  // The "Unwise Assassin"
  // This hero will attempt to kill the closest enemy hero. No matter what.
  unwiseAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 30) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestEnemy(gameData);
    }
  },

  // The "Careful Assassin"
  // This hero will attempt to kill the closest weaker enemy hero.
  carefulAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestWeakerEnemy(gameData);
    }
  },

  // The "Safe Diamond Miner"
  // This hero will attempt to capture enemy diamond mines.
  safeDiamondMiner : function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });
    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // The "Selfish Diamond Miner"
  // This hero will attempt to capture diamond mines (even those owned by teammates).
  selfishDiamondMiner :function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });

    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestUnownedDiamondMine(gameData);
    }
  },

  // The "Coward"
  // This hero will try really hard not to die.
  coward : function(gameData, helpers) {
    return helpers.findNearestHealthWell(gameData);
  },

  // My test
  dslaugh : function(gameData, helpers) {
    var test = helpers.getLastMove();
    var myHero = gameData.activeHero;
    var whatsAround = helpers.getWhatsAroundMe(gameData);
    var moveDir;
    
    var directions = {
      North: 'North',
      South: 'South',
      East: 'East',
      West: 'West'
    };
    var healthDir = false;
    var diamondDir = false;
    var unoccupiedDirs = [];
    var friendsDir = [];
    var enemiesDir = [];

    var dirs = Object.keys(whatsAround);

    dirs.forEach(function(dir) {
        //HealthWell
        if (whatsAround[dir].type === 'HealthWell') {
            healthDir = directions[dir];  
        }
        //Non-team DiamondMine
        if(whatsAround[dir].type === 'DiamondMine') {
            if (whatsAround[dir].owner === undefined) {
              diamondDir = directions[dir];
            } else {
              if (whatsAround[dir].owner.team !== myHero.team) {
                  diamondDir = directions[dir];
              }
            }
        }
        //Friends
        if(whatsAround[dir].type === 'Hero' && whatsAround[dir].team === myHero.team) {
            friendsDir.push(directions[dir]);
        }
        //Enemies
        if(whatsAround[dir].type === 'Hero' && whatsAround[dir].team !== myHero.team) {
            enemiesDir.push(directions[dir]);
        }
        //Unoccupied
        if(whatsAround[dir].type === 'Unoccupied') {
            unoccupiedDirs.push(directions[dir]);
        }
    });

    if (healthDir && myHero.health < 100) {
      // console.log('health one');
      moveDir = healthDir;
    }
    if (myHero.health < 80) {
      if (myHero.health >= 55) {
        if (enemiesDir.length > 0) {
          enemiesDir.forEach(function(enemyDir) {
            var enemy = whatsAround[enemyDir];
            if (enemy.health <= 30) {
              // console.log('health three');
              moveDir = enemyDir;
            }
          });
        }
      }
      // console.log('health two')
      moveDir = helpers.findNearestHealthWell(gameData);
    }
    if (enemiesDir.length > 0) {
      // console.log('enemy');
      var enemyHealth = 100;
      var lowEnemyDir = false;
      enemiesDir.forEach(function(enemyDir) {
        var enemy = whatsAround[enemyDir];
        if (enemy.health <= enemyHealth) {
          lowEnemyDir = enemyDir;
        }
      });
      moveDir = lowEnemyDir;
    }
    if (diamondDir && myHero.health > 80) {
      // console.log('diamond');
      moveDir = diamondDir;
    }
    // console.log('default');
    moveDir = helpers.findNearestEnemy(gameData);

    if (!moveDir) {
      moveDir = helpers.findNearestHealthWell(gameData);
    }

    return moveDir;
  },

    dslaugh2: function(gameData, helpers) {
        var myTop = gameData.activeHero.distanceFromTop;
        var myLeft = gameData.activeHero.distanceFromLeft;
        var directions = {
            NorthWest: 'NorthWest',
            North: 'North',
            NorthEast: 'NorthEast',
            East: 'East',
            SouthEast: 'SouthEast',
            South: 'South',
            SouthWest: 'SouthWest',
            West: 'West'
        };
        var myHero = gameData.activeHero;
        var thingsAroundMe = {
          healthWells: [],
          diamonds:  [],
          enemies:  [],
          friends:  [],
          unoccupied:  []
        };
        var moveDir;


        var processWhatsAroundTile = function(whatsAround) {
            var things = {
              healthWells: [],
              diamonds:  [],
              enemies:  [],
              friends:  [],
              unoccupied:  []              
            };
            var dirs = Object.keys(directions);
            dirs.forEach(function(dir) {
                var tile = whatsAroundMe[dir];
                if (tile) {
                    if (tile.type === 'Unoccupied') {
                        things.unoccupied.push(directions[dir]);
                    } else if (tile.type === 'HealthWell') {
                        things.healthWells.push(directions[dir]);
                    } else if (tile.type === 'DiamondMine') {
                        things.diamonds.push(directions[dir]);
                    } else if (tile.type === 'Hero' && tile.team === myHero.team) {
                        things.friends.push(directions[dir]);
                    } else if (tile.type === 'Hero' && tile.team !== myHero.team) {
                        things.enemies.push(directions[dir]);
                    }
                }
            });
            return things;
        };

        var isDirectionICanMove = function(dir) {
            return ['North','South','East','West'].indexOf(dir) !== -1;
        };
        var inDirectionICanMove = function(arr) {
            return arr.filter(isDirectionICanMove);
        };
        var getLowestEnemyHealthDir = function(enemyDirs) {
            var lowestHealth = 100;
            var lowestHealthDir;
            enemyDirs.forEach(function(dir) {
                if (whatsAroundMe[dir].health <= lowestHealth) {
                    lowestHealth = whatsAroundMe[dir].health;
                    lowestHealthDir = dir;
                }
            });
            return lowestHealthDir;
        };


        var whatsAroundMe = helpers.getWhatsAroundTile(gameData, myTop, myLeft);
        thingsAroundMe = processWhatsAroundTile(whatsAroundMe);
        // console.log(thingsAroundMe);

        // See what is one move away
        var nearDeadEnemies = [];
        thingsAroundMe.unoccupied.forEach(function(dir) {
            var tile = whatsAroundMe[dir];
            var whatsAroundUnoccupied = helpers.getWhatsAroundTile(gameData, tile.distanceFromTop, tile.distanceFromLeft);

            var unoccupiedDirs = Object.keys(whatsAroundUnoccupied);
            unoccupiedDirs.forEach(function(udir) {
                var utile = whatsAroundUnoccupied[udir];
                if (utile.type === 'Hero' && utile.team !== myHero.team && utile.health <= 20) {
                    if (isDirectionICanMove(dir)) {
                        nearDeadEnemies.push(dir);
                    }
                }
            });
        });
        // console.log('nearDeadEnemies');
        // console.log(nearDeadEnemies);

        if (myHero.health < 100 && inDirectionICanMove(thingsAroundMe.healthWells).length > 0) {
            // console.log('getting health because it is there');
            moveDir = helpers.findNearestHealthWell(gameData);
        } else if (myHero.health < 80) {
            // console.log('need health');
            moveDir = helpers.findNearestHealthWell(gameData);
        } else if (thingsAroundMe.enemies.length > 0) {
            // console.log('going after enemy');
            var attackableEnemies = inDirectionICanMove(thingsAroundMe.enemies);
            if (attackableEnemies.length > 0) {
                moveDir = getLowestEnemyHealthDir(attackableEnemies);
            } else {
                moveDir = helpers.findNearestEnemy(gameData);
            }
        } else {
            // console.log('default');
            moveDir = helpers.findNearestEnemy(gameData);
            if (!moveDir) {
                moveDir = helpers.findNearestUnownedDiamondMine(gameData);
            }
            if (!moveDir) {
                moveDir = helpers.findNearestHealthWell(gameData);
            }
        }
        return moveDir;
    }

 };



//  Set our heros strategy
var  move =  moves.dslaugh2;

// Export the move function here
module.exports = move;

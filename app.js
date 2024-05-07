const { Console } = require(`console-mpds`);
const console = new Console();

playMastermind();

function playMastermind() {
  do {
    playGame();
  } while (isResumed());

  function playGame() {
    const game = initializeGame();
    do {
      showAttempts(game);
      setValidProposedCombination(game);
      compareProposedCombinationWithSecretCombination(game);
      showComparisonResult(game);
      verifyCorrectCombination(game);
      increaseAttempsByOne(game);
    } while (!game.isCorrectCombination && game.attempts < game.MAXIMUN_ATTEMPTS);
    if (game.isCorrectCombination) {
      showWinningMessage();
    } else {
      showLosingMessage();
    }

    function initializeGame() {
      let game = {
        TITLE: "\n\n----- MASTERMIND -----",
        ALLOWED_COLORS: ["r", "g", "b", "y", "c", "m"],
        COMBINATIONS_LENGTH: 4,
        MAXIMUN_ATTEMPTS: 10,
        secretCombination: [],
        attempts: 0,
        isCorrectCombination: false,
        proposedCombinations: [],
        restultsOfComparingCombinations: [],
      };
      showTitle(game);
      setSecretCombinationWithoutRepeatedColors(game);
      console.writeln(`Secret Combination: ${game.secretCombination}`);
      return game;

      function showTitle({ TITLE }) {
        console.writeln(TITLE);
      }

      function setSecretCombinationWithoutRepeatedColors(game) {
        for (let i = 0; i < game.COMBINATIONS_LENGTH; i++) {
          let randomColor;
          do {
            randomColor = game.ALLOWED_COLORS[parseInt(Math.random() * game.ALLOWED_COLORS.length)];
          } while (isRepeatedColor(randomColor, game.secretCombination));
          game.secretCombination[i] = randomColor;
        }

        function isRepeatedColor(color, secretCombination) {
          for (let i = 0; i < secretCombination.length; i++) {
            if (color === secretCombination[i]) {
              return true;
            }
          }
          return false;
        }
      }
    }

    function showAttempts({ attempts }) {
      console.writeln(`\n${attempts + 1} attempt${attempts !== 0 ? `s` : ``}:\n****`);
    }

    function setValidProposedCombination(game) {
      let proposedCombination;
      do {
        proposedCombination = console.readString(`Propose a combination:`);
      } while (!isValidCombination(proposedCombination, game));
      game.proposedCombinations[game.attempts] = proposedCombination;

      function isValidCombination(proposedCombination, { ALLOWED_COLORS, COMBINATIONS_LENGTH }) {
        const MSG_ERRORS = {
          LENGTH: `Wrong proposed combination length!!! (Correct length 4). Please try again`,
          COLORS_NOT_VALID: `Wrong colors, they must be "rgbycm". Please try again`,
          REPEATED_COLORS: `Wrong, there are repeated colors. Please try again`,
        };
        if (proposedCombination.length !== COMBINATIONS_LENGTH) {
          console.writeln(MSG_ERRORS.LENGTH);
          return false;
        } else if (!areValidColors(proposedCombination, ALLOWED_COLORS)) {
          console.writeln(MSG_ERRORS.COLORS_NOT_VALID);
          return false;
        } else if (thereAreRepeatedColors(proposedCombination)) {
          console.writeln(MSG_ERRORS.REPEATED_COLORS);
          return false;
        }
        return true;

        function areValidColors(proposedCombination, allowedColors) {
          for (const proposedColor of proposedCombination) {
            if (!isAllowed(proposedColor, allowedColors)) {
              return false;
            }
          }
          return true;

          function isAllowed(color, allowedColors) {
            let allowed = false;
            for (let i = 0; !allowed && i < allowedColors.length; i++) {
              if (color === allowedColors[i]) {
                allowed = true;
              }
            }
            return allowed;
          }
        }

        function thereAreRepeatedColors(proposedCombination) {
          const NOT_FOUND = -1;
          let uniqueColors = [];
          for (let color of proposedCombination) {
            if (uniqueColors.indexOf(color) === NOT_FOUND) {
              uniqueColors[uniqueColors.length] = color;
            }
          }
          return uniqueColors.length !== proposedCombination.length;
        }
      }
    }

    function compareProposedCombinationWithSecretCombination(game) {
      const WELL_POSITIONED = `b`;
      const POORLY_POSITIONED = `w`;
      const EMPTY = `E`;
      const currentProposedCombination = game.proposedCombinations[game.attempts];
      let comparisonResult = ``;
      for (let i = 0; i < currentProposedCombination.length; i++) {
        if (isWellPositioned(currentProposedCombination[i], game.secretCombination[i])) {
          comparisonResult += WELL_POSITIONED;
        } else if (isPoorlyPositioned(game.secretCombination, currentProposedCombination[i])) {
          comparisonResult += POORLY_POSITIONED;
        } else {
          comparisonResult += EMPTY;
        }
      }
      game.restultsOfComparingCombinations[game.attempts] = comparisonResult;

      function isWellPositioned(proposedColor, secretColor) {
        return proposedColor === secretColor;
      }

      function isPoorlyPositioned(secretCombination, colorToVerify) {
        let isEquals = false;
        for (let i = 0; !isEquals && i < secretCombination.length; i++) {
          if (colorToVerify === secretCombination[i]) {
            isEquals = true;
          }
        }
        return isEquals;
      }
    }

    function showComparisonResult(game) {
      let msg = `\nResults:\n`;
      for (let i = 0; i < game.restultsOfComparingCombinations.length; i++) {
        msg += `${game.proposedCombinations[i]} --> ${game.restultsOfComparingCombinations[i]}\n`;
      }
      console.writeln(msg);
    }

    function verifyCorrectCombination(game) {
      let isCorrect = true;
      for (let i = 0; isCorrect && i < game.restultsOfComparingCombinations[game.attempts].length; i++) {
        if (game.restultsOfComparingCombinations[game.attempts][i] !== `b`) {
          isCorrect = false;
        }
      }
      game.isCorrectCombination = isCorrect;
    }

    function increaseAttempsByOne(game) {
      game.attempts++;
    }

    function showWinningMessage() {
      console.writeln(`:) :) !!!!!!!!!!!! WELL DONE, YOU HAVE WON !!!!!!!!!!!`);
    }

    function showLosingMessage() {
      console.writeln(`:( :( !!!!!!!!!!!! SORRY, YOU LOST !!!!!!!!!!!!`);
    }
  }

  function isResumed() {
    let error;
    let answer;
    do {
      answer = console.readString(`Do you want play again? (yes / not):`);
      error = answer !== `yes` && answer !== `not`;
      if (error) {
        console.writeln(`Please, responde "yes" or "not".`);
      }
      if (answer === `not`) {
        console.writeln(`End of game. Come back soon`);
      }
    } while (error);
    return answer === `yes` ? true : false;
  }
}

const { Console } = require("console-mpds");
const console = new Console();

initMastermindView().play();

function initMastermindView() {
  return {
    play: function () {
      const continueDialogView = initYesNoDialogView(`¿Quieres jugar otra partida? `);
      do {
        initGameView().play();
        continueDialogView.read();
      } while (continueDialogView.isAffirmative());
    },
  };
}

function initYesNoDialogView(question) {
  let answer = ``;

  function isNegative() {
    return answer === `no`;
  }

  return {
    read: function () {
      let error;
      do {
        answer = console.readString(question);
        error = !this.isAffirmative() && !isNegative();
        if (error) {
          console.writeln(`Por favor, responda "si" o "no"`);
        }
      } while (error);
    },
    isAffirmative: function () {
      return answer === `si`;
    },
  };
}

function initGameView() {
  const game = initGame();

  function show() {
    console.writeln(`${game.getAttempts()} attempt(s):\n****`);
    for (let i = 0; i < game.getAttempts(); i++) {
      initProposalCombinationView().show(game.getProposalCombination(i));
      initResultView().show(game.getResult(i));
    }
  }

  return {
    play: function () {
      console.writeln(`----- MASTERMIND -----`);
      do {
        show();
        game.addProposalCombination(initProposalCombinationView().readProposalCombination());
      } while (!game.isEndGame());
      console.writeln(game.isWinner() ? "Has ganado!!! ;-)" : "Has perdido!!! :-(");
    },
  };
}

function initProposalCombinationView() {
  return {
    readProposalCombination: function () {
      let proposalCombination = initProposalCombination();
      do {
        proposalCombination.setColors(console.readString(`Propon una combinación:`));
        proposalCombination.validate();
        if (proposalCombination.hasError()) {
          console.writeln(proposalCombination.getErrorMessage());
        }
      } while (proposalCombination.hasError());
      return proposalCombination;
    },
    show: function (proposalCombination) {
      console.write(proposalCombination.getColors());
    },
  };
}

function initResultView() {
  return {
    show(result) {
      console.writeln(` --> ${result.getBlacks()} blacks and ${result.getWhites()} whites`);
    },
  };
}

function initGame() {
  let proposalsCombinations = [];
  const secretCombination = initSecretCombination();

  function isCompleteTheBoard() {
    const MAX_ATTEMPTS = 10;
    return proposalsCombinations.length === MAX_ATTEMPTS;
  }
  return {
    addProposalCombination(proposalCombination) {
      proposalsCombinations.push(proposalCombination);
    },
    isEndGame() {
      return this.isWinner() || isCompleteTheBoard();
    },
    isWinner() {
      const lastProposalCombination = proposalsCombinations[proposalsCombinations.length - 1];
      return secretCombination.getResult(lastProposalCombination).isWinner();
    },
    getAttempts() {
      return proposalsCombinations.length;
    },
    getResult(index) {
      return secretCombination.getResult(proposalsCombinations[index]);
    },
    getProposalCombination(index) {
      return proposalsCombinations[index];
    },
  };
}

function initSecretCombination() {
  const combination = initCombination();
  fillWithRandomColors();

  function fillWithRandomColors() {
    do {
      let randomColor = combination.getAllowedColors()[parseInt(Math.random() * combination.getAllowedColors().length)];
      if (!combination.contains(randomColor)) {
        combination.addColor(randomColor);
      }
    } while (!combination.hasValidLength());
    console.writeln(`Secrete combination: ${combination.getColors()}`);
  }

  function getBlacks(proposalCombination) {
    let blacks = 0;
    for (let i = 0; i < combination.length(); i++) {
      if (proposalCombination.contains(combination.getColor(i), i)) {
        blacks++;
      }
    }
    return blacks;
  }

  function getWhites(proposalCombination) {
    let whites = 0;
    for (let i = 0; i < combination.length(); i++) {
      const color = combination.getColor(i);
      if (proposalCombination.contains(color) && !proposalCombination.contains(color, i)) {
        whites++;
      }
    }
    return whites;
  }

  return {
    getResult: function (proposalCombination) {
      const blacks = getBlacks(proposalCombination);
      const whites = getWhites(proposalCombination);
      return initResult(blacks, whites);
    },
  };
}

function initResult(blacks, whites) {
  return {
    isWinner() {
      return blacks === initCombination().getCombinationLength();
    },
    getBlacks() {
      return blacks;
    },
    getWhites() {
      return whites;
    },
  };
}

function initProposalCombination() {
  const combination = initCombination();
  let error;
  let errorMessage;

  function hasValidLength() {
    return combination.hasValidLength();
  }

  function hasValidColors() {
    return combination.hasValidColors();
  }

  function hasRepeatedColors() {
    return combination.hasRepeatedColors();
  }

  return {
    getCombination: function () {
      return combination;
    },
    length: function () {
      return combination.length();
    },
    contains: function (color, index) {
      return combination.contains(color, index);
    },
    setColors: function (colors) {
      combination.setColors(colors);
    },
    getColors: function () {
      return combination.getColors();
    },
    validate: function () {
      error = false;
      if (!hasValidLength()) {
        errorMessage = `- La longitud de la combinación es incorrecta!`;
        error = true;
      } else if (hasRepeatedColors()) {
        errorMessage = `- Combinación propuesta incorrecta, al menos, un color está repetido.`;
        error = true;
      } else if (!hasValidColors()) {
        errorMessage = `- Colores invalidos, los colores son: ${combination.getAllowedColors()}`;
        error = true;
      }
    },
    hasError: function () {
      return error;
    },
    getErrorMessage: function () {
      return errorMessage;
    },
  };
}

function initCombination() {
  const COMBINATION_LENGTH = 4;
  const ALLOWED_COLORS = "rgbycm";
  let colors = [];
  return {
    length: function () {
      return colors.length;
    },
    contains: function (color, index) {
      if (index !== undefined) {
        return colors[index] === color;
      }
      for (let i = 0; i < colors.length; i++) {
        if (this.contains(color, i)) {
          return true;
        }
      }
      return false;
    },
    getColor: function (index) {
      return colors[index];
    },
    getColors: function () {
      return colors;
    },
    hasValidLength: function () {
      return colors.length === COMBINATION_LENGTH;
    },
    hasValidColors: function () {
      const gameColors = initCombination();
      gameColors.setColors(ALLOWED_COLORS);
      let hasValidColors = true;
      for (let i = 0; i < colors.length; i++) {
        hasValidColors &= gameColors.contains(colors[i]);
      }
      return hasValidColors;
    },
    hasRepeatedColors: function () {
      let hasRepeatedColors = false;
      for (let i = 0; i < colors.length - 1; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          if (colors[i] === colors[j]) {
            hasRepeatedColors = true;
          }
        }
      }
      return hasRepeatedColors;
    },
    setColors: function (otherColors) {
      colors = otherColors;
    },
    addColor: function (color) {
      colors.push(color);
    },
    getAllowedColors: function () {
      return ALLOWED_COLORS;
    },
    getCombinationLength: function () {
      return COMBINATION_LENGTH;
    },
  };
}

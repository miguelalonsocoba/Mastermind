const { Console } = require("console-mpds");
const console = new Console();

playMastermind();

function playMastermind() {
  do {
    playGame();
  } while (isResumed());
}

function isResumed() {
  let error;
  let answer;
  do {
    answer = console.readString("Do you want to play again? (yes / not):");
    error = answer !== "yes" && answer !== "not";
    if (error) {
      console.writeln("Please, answer yes or not.");
    }
    if (answer === "not") {
      console.writeln("End of the game. Come back soon!");
    }
  } while (error);
  return answer === "yes" ? true : false;
}

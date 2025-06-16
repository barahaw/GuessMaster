const inputTxt = document.getElementById("guessInput");
const guessButton = document.getElementById("guessButton");
const attemptsDisplay = document.getElementById("attempts");
const timeLeft = document.getElementById("timeLeft");
const difficultySelect = document.getElementById("difficulty");
const hintDisplay = document.getElementById("hint");
const timerInput = document.getElementById("timerInput");
const scoreboard = document.getElementById("scoreboard");

let attempts = 0;
const maxAttempts = 10;
let randomGuess = Math.floor(Math.random() * 10) + 1;
let time = 30;
let timer = null;
let aiAttempts = 0;
let aiTried = [];
let aiMin = 1;
let aiMax = 10;
let maxNumber = 10;

let userWins = parseInt(localStorage.getItem("userWins")) || 0;
let aiWins = parseInt(localStorage.getItem("aiWins")) || 0;
let userBest = parseInt(localStorage.getItem("userBest")) || null;
let aiBest = parseInt(localStorage.getItem("aiBest")) || null;

function updateAttempts() {
  attemptsDisplay.textContent = `👤 You: ${attempts} tries | 🤖 AI: ${aiAttempts} tries`;
}

function resetGame() {
  attempts = 0;
  aiAttempts = 0;
  aiTried = [];
  maxNumber = parseInt(difficultySelect.value);
  randomGuess = Math.floor(Math.random() * maxNumber) + 1;
  inputTxt.value = "";
  updateAttempts();
  time = parseInt(timerInput.value) || 30;
  timeLeft.textContent = time;
  aiMin = 1;
  aiMax = maxNumber;
  hintDisplay.textContent = "";
  updateScoreboard();
}

function aiMakeGuess() {
  const guess = Math.floor((aiMin + aiMax) / 2);
  aiTried.push(guess);
  aiAttempts++;
  if (guess < randomGuess) {
    aiMin = guess + 1;
  } else if (guess > randomGuess) {
    aiMax = guess - 1;
  }
  return guess;
}

function startGame() {
  resetGame();
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    time--;
    if (time > 0) {
      timeLeft.textContent = time;
    } else {
      clearInterval(timer);
      alert(" Time's up! Game over.");
      startGame();
    }
  }, 1000);
}

function updateScoreboard() {
  scoreboard.innerHTML = `
    <div>👤 User Wins: <b>${userWins}</b> | Best: <b>${
    userBest ?? "-"
  }</b> tries</div>
    <div>🤖 AI Wins: <b>${aiWins}</b> | Best: <b>${
    aiBest ?? "-"
  }</b> tries</div>
  `;
}

function saveStats() {
  localStorage.setItem("userWins", userWins);
  localStorage.setItem("aiWins", aiWins);
  if (userBest !== null) localStorage.setItem("userBest", userBest);
  if (aiBest !== null) localStorage.setItem("aiBest", aiBest);
}

guessButton.addEventListener("click", () => {
  const userGuess = parseInt(inputTxt.value);
  if (isNaN(userGuess) || userGuess < 1 || userGuess > maxNumber) {
    alert(` Please enter a number between 1 and ${maxNumber}.`);
    return;
  }

  attempts++;

  const aiGuess = aiMakeGuess();

  if (userGuess === randomGuess) {
    userWins++;
    if (!userBest || attempts < userBest) userBest = attempts;
    saveStats();
    alert(
      ` You win! You guessed the number ${randomGuess} in ${attempts} attempts.`
    );
    startGame();
    return;
  }

  if (aiGuess === randomGuess) {
    aiWins++;
    if (!aiBest || aiAttempts < aiBest) aiBest = aiAttempts;
    saveStats();
    alert(
      `🤖 AI wins! It guessed the number ${randomGuess} in ${aiAttempts} attempts.`
    );
    startGame();
    return;
  }

  if (attempts >= maxAttempts) {
    alert(` Game over! The number was ${randomGuess}.`);
    startGame();
    return;
  }

  if (userGuess < randomGuess) {
    hintDisplay.textContent = "Too low!";
  } else if (userGuess > randomGuess) {
    hintDisplay.textContent = "Too high!";
  }

  inputTxt.value = "";
  updateAttempts();
});

difficultySelect.addEventListener("change", startGame);
timerInput.addEventListener("change", startGame);

startGame();
updateScoreboard();

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
let maxNumber = 100;

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
  maxNumber = parseInt(difficultySelect.value) || 100;
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

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  const voiceBtn = document.createElement("button");
  voiceBtn.textContent = "🎤 Speak Guess";
  voiceBtn.className = "btn btn-secondary mt-2";
  guessButton.parentNode.appendChild(voiceBtn);

  voiceBtn.addEventListener("click", () => {
    hintDisplay.textContent = "Listening...";
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    hintDisplay.textContent = `Heard: "${transcript}"`;
    let spokenNumber = parseInt(transcript.match(/\d+/));
    if (isNaN(spokenNumber)) {
      const numberWords = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,
        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90,
        hundred: 100,
      };
      let lowerTranscript = transcript.toLowerCase();
      for (const [word, num] of Object.entries(numberWords)) {
        if (lowerTranscript.trim() === word) {
          spokenNumber = num;
          break;
        }
      }
      if (isNaN(spokenNumber)) {
        const compound = lowerTranscript.match(
          /(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[ -]?(one|two|three|four|five|six|seven|eight|nine)?/
        );
        if (compound) {
          let base = numberWords[compound[1]];
          let extra = compound[2] ? numberWords[compound[2]] : 0;
          spokenNumber = base + extra;
        }
      }
      if (isNaN(spokenNumber) && lowerTranscript.includes("hundred")) {
        spokenNumber = 100;
      }
    }
    if (!isNaN(spokenNumber)) {
      inputTxt.value = spokenNumber;
      guessButton.click();
      speakAI(`You said ${spokenNumber}.`);
    } else {
      hintDisplay.textContent = `Could not recognize a number. Heard: "${transcript}". Try again.`;
      speakAI("Sorry, I did not catch a number. Please try again.");
    }
  };

  recognition.onerror = (event) => {
    hintDisplay.textContent = "Speech recognition error.";
    speakAI("Speech recognition error.");
  };
}

function speakAI(text) {
  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  }
}

startGame();
updateScoreboard();

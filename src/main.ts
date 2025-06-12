import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Countdown Timer</h1>
    <div id="timer-inputs">
      <input type="number" id="hours" placeholder="Hours" min="0" value="0">
      <input type="number" id="minutes" placeholder="Minutes" min="0" max="59" value="1">
      <input type="number" id="seconds" placeholder="Seconds" min="0" max="59" value="30">
    </div>
    <button id="start-btn">Start</button>
    <p id="timer-display"></p>
  </div>
`

const hoursInput = document.querySelector<HTMLInputElement>('#hours')!
const minutesInput = document.querySelector<HTMLInputElement>('#minutes')!
const secondsInput = document.querySelector<HTMLInputElement>('#seconds')!
const startBtn = document.querySelector<HTMLButtonElement>('#start-btn')!
const timerDisplay = document.querySelector<HTMLParagraphElement>('#timer-display')!

let countdownInterval: number | undefined

function startCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  const hours = parseInt(hoursInput.value) || 0
  const minutes = parseInt(minutesInput.value) || 0
  const seconds = parseInt(secondsInput.value) || 0

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  if (totalSeconds <= 0) {
    timerDisplay.textContent = 'Please enter a valid time.'
    return
  }
  
  const initialTotalSeconds = totalSeconds
  const endTime = Date.now() + totalSeconds * 1000

  hoursInput.disabled = true
  minutesInput.disabled = true
  secondsInput.disabled = true
  startBtn.disabled = true

  const updateTimer = () => {
    const remainingMilliseconds = endTime - Date.now()

    if (remainingMilliseconds < 0) {
      clearInterval(countdownInterval)
      timerDisplay.textContent = "Time's up!"
      hoursInput.disabled = false
      minutesInput.disabled = false
      secondsInput.disabled = false
      startBtn.disabled = false
      return
    }

    const totalSecondsLeft = Math.round(remainingMilliseconds / 1000)
    const hoursLeft = Math.floor(totalSecondsLeft / 3600)
    const minutesLeft = Math.floor((totalSecondsLeft % 3600) / 60)
    const secondsLeft = totalSecondsLeft % 60

    let displayString = ''
    if (initialTotalSeconds >= 3600) {
      displayString += `${String(hoursLeft).padStart(2, '0')}:`
    }
    displayString += `${String(minutesLeft).padStart(2, '0')}:${String(
      secondsLeft
    ).padStart(2, '0')}`

    timerDisplay.textContent = displayString
  }

  updateTimer()
  countdownInterval = setInterval(updateTimer, 1000)
}

startBtn.addEventListener('click', startCountdown)

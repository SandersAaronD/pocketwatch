import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Countdown Timer</h1>
    <p id="timer-display"></p>
    <div id="timer-inputs">
        <div class="dial-container">
            <div class="dial">
                <button class="dial-btn up-btn" data-unit="hours">▲</button>
                <div class="dial-display" id="hours-display">00</div>
                <button class="dial-btn down-btn" data-unit="hours">▼</button>
            </div>
            <div class="dial-label">Hours</div>
        </div>
        <div class="dial-separator">:</div>
        <div class="dial-container">
            <div class="dial">
                <button class="dial-btn up-btn" data-unit="minutes">▲</button>
                <div class="dial-display" id="minutes-display">01</div>
                <button class="dial-btn down-btn" data-unit="minutes">▼</button>
            </div>
            <div class="dial-label">Minutes</div>
        </div>
        <div class="dial-separator">:</div>
        <div class="dial-container">
            <div class="dial">
                <button class="dial-btn up-btn" data-unit="seconds">▲</button>
                <div class="dial-display" id="seconds-display">30</div>
                <button class="dial-btn down-btn" data-unit="seconds">▼</button>
            </div>
            <div class="dial-label">Seconds</div>
        </div>
    </div>
    <button id="start-btn">Start</button>
  </div>
`

const startBtn = document.querySelector<HTMLButtonElement>('#start-btn')!
const timerDisplay = document.querySelector<HTMLParagraphElement>('#timer-display')!
const dialButtons = document.querySelectorAll<HTMLButtonElement>('.dial-btn')
const timerInputs = document.querySelector<HTMLDivElement>('#timer-inputs')!

const time = {
  hours: 0,
  minutes: 1,
  seconds: 30,
}

const displays = {
  hours: document.querySelector<HTMLDivElement>('#hours-display')!,
  minutes: document.querySelector<HTMLDivElement>('#minutes-display')!,
  seconds: document.querySelector<HTMLDivElement>('#seconds-display')!,
}

function updateDisplay(unit: 'hours' | 'minutes' | 'seconds') {
  displays[unit].textContent = String(time[unit]).padStart(2, '0')
}

function updateAllDisplays() {
    for (const unit of Object.keys(time) as Array<keyof typeof time>) {
        updateDisplay(unit)
    }
}

function handleDialClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLButtonElement
  const unit = target.dataset.unit as 'hours' | 'minutes' | 'seconds'
  const direction = target.classList.contains('up-btn') ? 1 : -1

  let currentValue = time[unit]
  currentValue += direction

  if (unit === 'minutes' || unit === 'seconds') {
    if (currentValue > 59) currentValue = 0
    if (currentValue < 0) currentValue = 59
  } else { // hours
    if (currentValue < 0) currentValue = 0
  }

  time[unit] = currentValue
  updateDisplay(unit)
}

dialButtons.forEach(button => {
  // Removed click event listener to disable on-click increment/decrement
})

// Drag logic
let isDragging = false
let dragStartY: number
let dragStartValue: number
let activeDragUnit: keyof typeof time | null = null
const dragSensitivity = 15 // pixels per unit change

function onDragStart(event: MouseEvent | TouchEvent, unit: keyof typeof time) {
    if (countdownInterval || (event.target as HTMLElement).classList.contains('dial-btn')) return
    isDragging = true
    activeDragUnit = unit
    dragStartY = 'touches' in event ? event.touches[0].clientY : event.clientY
    dragStartValue = time[unit]
    document.body.style.cursor = 'ns-resize'
    timerInputs.style.pointerEvents = 'none' // Prevent spurious events on other elements
    event.preventDefault()

    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('touchmove', onDragMove, { passive: false })
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('touchend', onDragEnd)
}

function onDragMove(event: MouseEvent | TouchEvent) {
    if (!isDragging || !activeDragUnit) return
    event.preventDefault()
    const currentY = 'touches' in event ? event.touches[0].clientY : event.clientY
    const deltaY = dragStartY - currentY // Drag up to increase
    const valueChange = Math.floor(deltaY / dragSensitivity)

    let newValue = dragStartValue + valueChange
    const unit = activeDragUnit

    if (unit === 'minutes' || unit === 'seconds') {
        // Clamp between 0 and 59
        newValue = Math.max(0, Math.min(59, newValue))
    } else { // hours
        // Clamp between 0 and 24
        newValue = Math.max(0, Math.min(24, newValue))
    }

    if (time[unit] !== newValue) {
        time[unit] = newValue
        updateDisplay(unit)
    }
}

function onDragEnd() {
    isDragging = false
    activeDragUnit = null
    document.body.style.cursor = 'default'
    timerInputs.style.pointerEvents = 'auto'

    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('touchmove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
    window.removeEventListener('touchend', onDragEnd)
}

Object.entries(displays).forEach(([unit, displayElement]) => {
    const parentDial = displayElement.parentElement!
    parentDial.addEventListener('mousedown', (e) => onDragStart(e, unit as keyof typeof time))
    parentDial.addEventListener('touchstart', (e) => onDragStart(e, unit as keyof typeof time), { passive: false })
})


let countdownInterval: number | undefined

function setDialsEnabled(enabled: boolean) {
    dialButtons.forEach(button => {
        button.disabled = !enabled
    })
    timerInputs.classList.toggle('disabled', !enabled)
}

startBtn.addEventListener('click', () => {
    if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = undefined
        timerDisplay.textContent = ''
        setDialsEnabled(true)
        startBtn.textContent = 'Start'
    } else {
        startCountdown()
    }
})

function startCountdown() {
  const { hours, minutes, seconds } = time
  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  if (totalSeconds <= 0) {
    timerDisplay.textContent = 'Please set a time.'
    return
  }
  
  const initialTotalSeconds = totalSeconds
  const endTime = Date.now() + totalSeconds * 1000

  setDialsEnabled(false)
  startBtn.textContent = 'Cancel'

  const updateTimer = () => {
    const remainingMilliseconds = endTime - Date.now()

    if (remainingMilliseconds <= 0) {
      clearInterval(countdownInterval)
      countdownInterval = undefined
      timerDisplay.textContent = "Time's up!"
      setDialsEnabled(true)
      startBtn.textContent = 'Start'
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
  countdownInterval = setInterval(updateTimer, 250)
}

updateAllDisplays()

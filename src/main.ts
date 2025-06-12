import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Countdown Timer</h1>
    <p id="timer-display"></p>
    <div id="timer-inputs">
        <div class="dial-container">
            <div class="dial">
                <div class="dial-display" id="hours-display">00</div>
            </div>
            <div class="dial-label">Hours</div>
        </div>
        <div class="dial-separator"></div>
        <div class="dial-container">
            <div class="dial">
                <div class="dial-display" id="minutes-display">01</div>
            </div>
            <div class="dial-label">Minutes</div>
        </div>
        <div class="dial-separator"></div>
        <div class="dial-container">
            <div class="dial">
                <div class="dial-display" id="seconds-display">30</div>
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
  seconds: 0,
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

// For momentum
let lastDragTime: number = 0
let lastDragY: number = 0
let dragVelocity: number = 0
let momentumAnimationFrame: number | null = null

function onDragStart(event: MouseEvent | TouchEvent, unit: keyof typeof time) {
    if (countdownInterval || (event.target as HTMLElement).classList.contains('dial-btn')) return
    isDragging = true
    activeDragUnit = unit
    dragStartY = 'touches' in event ? event.touches[0].clientY : event.clientY
    dragStartValue = time[unit]
    lastDragY = dragStartY
    lastDragTime = performance.now()
    dragVelocity = 0
    if (momentumAnimationFrame !== null) {
        cancelAnimationFrame(momentumAnimationFrame)
        momentumAnimationFrame = null
    }
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

    // Clamp values
    if (unit === 'minutes' || unit === 'seconds') {
        newValue = Math.max(0, Math.min(59, newValue))
    } else { // hours
        newValue = Math.max(0, Math.min(24, newValue))
    }

    if (time[unit] !== newValue) {
        time[unit] = newValue
        updateDisplay(unit)
    }

    // Track velocity for momentum
    const now = performance.now()
    const dy = lastDragY - currentY
    const dt = now - lastDragTime
    if (dt > 0) {
        dragVelocity = dy / dt // pixels per ms
    }
    lastDragY = currentY
    lastDragTime = now
}

function onDragEnd() {
    isDragging = false
    document.body.style.cursor = 'default'
    timerInputs.style.pointerEvents = 'auto'
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('touchmove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
    window.removeEventListener('touchend', onDragEnd)

    if (activeDragUnit && Math.abs(dragVelocity) > 0.05) {
        startMomentum(activeDragUnit, dragVelocity)
    }
    activeDragUnit = null
}

function startMomentum(unit: keyof typeof time, initialVelocity: number) {
    let value = time[unit]
    let velocity = initialVelocity * 10 // scale velocity for dial units
    const friction = 0.92 // base friction per frame
    const resistanceStrength = 0.7 // extra resistance at multiples of 5
    const frame = () => {
        // Apply resistance for minutes/seconds at multiples of 5
        if ((unit === 'minutes' || unit === 'seconds') && Math.abs(velocity) > 0.1) {
            const distToNearest5 = Math.abs((value % 5) - 5 * Math.round(value / 5))
            if (distToNearest5 < 1) {
                velocity *= resistanceStrength // extra slow near multiples of 5
            }
        }
        value += velocity
        // Clamp
        if (unit === 'minutes' || unit === 'seconds') {
            if (value < 0) { value = 0; velocity = 0; }
            if (value > 59) { value = 59; velocity = 0; }
        } else {
            if (value < 0) { value = 0; velocity = 0; }
            if (value > 24) { value = 24; velocity = 0; }
        }
        // Snap to integer
        const intValue = Math.round(value)
        if (time[unit] !== intValue) {
            time[unit] = intValue
            updateDisplay(unit)
        }
        velocity *= friction
        if (Math.abs(velocity) > 0.1) {
            momentumAnimationFrame = requestAnimationFrame(frame)
        } else {
            // Snap to nearest 5 for minutes/seconds if close
            if ((unit === 'minutes' || unit === 'seconds')) {
                const mod = intValue % 5
                if (mod !== 0 && Math.abs(mod) < 2) {
                    const snapValue = Math.round(intValue / 5) * 5
                    time[unit] = Math.max(0, Math.min(59, snapValue))
                    updateDisplay(unit)
                }
            }
            momentumAnimationFrame = null
        }
    }
    momentumAnimationFrame = requestAnimationFrame(frame)
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

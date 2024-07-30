(function() {
  // DOM Elements
  const timerElement = createTimerElement();
  const timerText = timerElement.querySelector('.timer-text');
  const stopButton = timerElement.querySelector('.stop-button');
  const resetButton = timerElement.querySelector('.reset-button');
  const analyticsIcon = timerElement.querySelector('.analytics-icon');
  const analyticsTooltip = timerElement.querySelector('.analytics-tooltip');
  let isDragging = false;
  let dragOffsetX, dragOffsetY;

  // Timer State
  let startTime = Date.now();
  let running = true;
  let totalElapsedTime = 0;
  let timerInterval;
  let websiteStartTime = Date.now();
  let sessionLog = [];

  // Functions
  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hrs, mins, secs].map(val => val.toString().padStart(2, '0')).join(':');
  }

  function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function updateTimer() {
    if (running) {
      const elapsedTime = (Date.now() - startTime) / 1000;
      timerText.textContent = formatTime(totalElapsedTime + elapsedTime);
      
      // Pulse animation
      timerElement.style.transform = 'scale(1.05)';
      setTimeout(() => {
        timerElement.style.transform = 'scale(1)';
      }, 50);
    }
  }

  function updateAnalytics(totalTime) {
    let logContent = `Date: ${getCurrentDate()}<br><br>Total time on site: ${formatTime(totalTime)}<br><br>Session log:`;
    
    const logArray = [...sessionLog];
    if (running) {
      const currentSession = (Date.now() - startTime) / 1000 + totalElapsedTime;
      logArray.push(currentSession);
    }
    logArray.reverse().forEach((session, index) => {
      logContent += `<br>${index + 1}. ${formatTime(session)}`;
    });

    analyticsTooltip.innerHTML = logContent;
  }

  function startTimer() {
    timerInterval = setInterval(updateTimer, 1000);
    timerElement.style.backgroundColor = '#e6ffe6';
  }

  function stopTimer() {
    clearInterval(timerInterval);
    running = false;
    const sessionTime = (Date.now() - startTime) / 1000;
    totalElapsedTime += sessionTime;
    sessionLog.push(sessionTime);
    timerText.textContent = formatTime(totalElapsedTime);
    timerElement.style.backgroundColor = '#ffe6e6';
    updateAnalytics((Date.now() - websiteStartTime) / 1000);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    if (running) {
      const sessionTime = (Date.now() - startTime) / 1000;
      sessionLog.push(totalElapsedTime + sessionTime);
    } else if (totalElapsedTime > 0) {
      sessionLog.push(totalElapsedTime);
    }
    running = false;
    totalElapsedTime = 0;
    startTime = Date.now();
    timerText.textContent = '00:00:00';
    timerElement.style.backgroundColor = 'white';
    updateAnalytics((Date.now() - websiteStartTime) / 1000);
    
    // Shake animation
    timerElement.style.animation = 'shake 0.5s';
    setTimeout(() => {
      timerElement.style.animation = '';
    }, 500);
  }

  // Event Listeners
  stopButton.addEventListener('click', () => {
    if (running) {
      stopTimer();
      stopButton.textContent = 'Start';
      stopButton.style.backgroundColor = '#4CAF50';
    } else {
      startTime = Date.now();
      running = true;
      startTimer();
      stopButton.textContent = 'Stop';
      stopButton.style.backgroundColor = '#f44336';
    }
    
    // Button press animation
    stopButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      stopButton.style.transform = 'scale(1)';
    }, 100);
  });

  resetButton.addEventListener('click', () => {
    resetTimer();
    stopButton.textContent = 'Start';
    stopButton.style.backgroundColor = '#4CAF50';
    
    // Button press animation
    resetButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      resetButton.style.transform = 'scale(1)';
    }, 100);
  });

  analyticsIcon.addEventListener('mouseenter', () => {
    updateAnalytics((Date.now() - websiteStartTime) / 1000);
    analyticsTooltip.style.opacity = '1';
  });

  analyticsIcon.addEventListener('mouseleave', () => {
    analyticsTooltip.style.opacity = '0';
  });

  // Dragging functionality
  timerElement.addEventListener('mousedown', (e) => {
    if (e.target === stopButton || e.target === resetButton || e.target === analyticsIcon) return;
    isDragging = true;
    dragOffsetX = e.clientX - timerElement.offsetLeft;
    dragOffsetY = e.clientY - timerElement.offsetTop;
    timerElement.style.transition = 'none'; // Disable transition during drag
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      timerElement.style.left = `${x}px`;
      timerElement.style.top = `${y}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      timerElement.style.transition = ''; // Re-enable transition
    }
  });

  // Initialize
  startTimer();
  updateTimer();

  // Helper function to create and style the timer element
  function createTimerElement() {
    const timerHTML = `
      <div class="timer-title">${document.title || 'Current Website'}</div>
      <div class="timer-controls">
        <span class="timer-text">00:00:00</span>
        <button class="stop-button">Stop</button>
        <button class="reset-button">Reset</button>
        <div class="analytics-icon">📊</div>
      </div>
      <div class="analytics-tooltip"></div>
    `;

    const timerElement = document.createElement('div');
    timerElement.className = 'timer-widget';
    timerElement.innerHTML = timerHTML;
    document.body.appendChild(timerElement);

    const style = document.createElement('style');
    style.textContent = `
      .timer-widget {
        position: absolute; /* Changed to absolute for free movement */
        bottom: 10px;
        right: 10px;
        background-color: white;
        border: 1px solid black;
        border-radius: 10px;
        padding: 10px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        cursor: move; /* Show move cursor */
        max-width: 300px; /* Set a maximum width */
      }
      .timer-title {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 5px;
        color: #333;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }
      .timer-controls {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .timer-text {
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
      }
      .stop-button, .reset-button {
        padding: 5px 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        font-weight: bold;
      }
      .stop-button { background-color: #4CAF50; }
      .reset-button { background-color: #008CBA; }
      .analytics-icon {
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
      }
      .analytics-tooltip {
        position: absolute;
        top: -10px;
        right: 105%;
        background-color: #333;
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
        white-space: nowrap;
        max-height: 200px;
        overflow-y: auto;
      }
      @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
      }
    `;
    document.head.appendChild(style);

    return timerElement;
  }
})();

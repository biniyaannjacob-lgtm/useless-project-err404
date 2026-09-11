// ============================================
// KEYBOARD PSYCHOLOGIST™
// ============================================


// -------------------------------
// SESSION VARIABLES
// -------------------------------

let sessionRunning = false;

let totalKeys = 0;

let backspaceCount = 0;

let spaceCount = 0;

let enterCount = 0;

let seconds = 0;

let timer = null;


// This object remembers how many
// times each key was pressed.

let keyCounts = {};


// -------------------------------
// GET HTML ELEMENTS
// -------------------------------

const startButton =
    document.getElementById("startButton");

const stopButton =
    document.getElementById("stopButton");

const resetButton =
    document.getElementById("resetButton");

const timerDisplay =
    document.getElementById("timer");

const totalKeysDisplay =
    document.getElementById("totalKeys");

const backspaceDisplay =
    document.getElementById("backspaceCount");

const spaceDisplay =
    document.getElementById("spaceCount");

const enterDisplay =
    document.getElementById("enterCount");

const statusDisplay =
    document.getElementById("status");

const lastKeyDisplay =
    document.getElementById("lastKey");

const mostUsedDisplay =
    document.getElementById("mostUsedKey");

const mostUsedMessage =
    document.getElementById("mostUsedMessage");

const wpmDisplay =
    document.getElementById("wpm");

const heatmap =
    document.getElementById("heatmap");

const diagnosisDisplay =
    document.getElementById("diagnosis");

const diagnosisTextDisplay =
    document.getElementById("diagnosisText");

const diagnosisEmojiDisplay =
    document.getElementById("diagnosisEmoji");


// -------------------------------
// START BUTTON
// -------------------------------

startButton.addEventListener(
    "click",
    function () {

        sessionRunning = true;

        startButton.disabled = true;

        stopButton.disabled = false;

        statusDisplay.textContent =
            "🟢 Session running... TYPE!";

        startTimer();

    }
);


// -------------------------------
// STOP BUTTON
// -------------------------------

stopButton.addEventListener(
    "click",
    function () {

        sessionRunning = false;

        startButton.disabled = false;

        stopButton.disabled = true;

        clearInterval(timer);

        statusDisplay.textContent =
            "🔴 Session finished.";

        createDiagnosis();

    }
);


// -------------------------------
// RESET BUTTON
// -------------------------------

resetButton.addEventListener(
    "click",
    function () {

        sessionRunning = false;

        clearInterval(timer);


        totalKeys = 0;

        backspaceCount = 0;

        spaceCount = 0;

        enterCount = 0;

        seconds = 0;

        keyCounts = {};


        timerDisplay.textContent =
            "00:00";


        totalKeysDisplay.textContent =
            "0";


        backspaceDisplay.textContent =
            "0";


        spaceDisplay.textContent =
            "0";


        enterDisplay.textContent =
            "0";


        wpmDisplay.textContent =
            "0 WPM";


        statusDisplay.textContent =
            "Ready to analyse your keyboard.";


        lastKeyDisplay.textContent =
            "Last key: —";


        mostUsedDisplay.textContent =
            "—";


        mostUsedMessage.textContent =
            "Your keyboard is waiting for evidence.";


        diagnosisDisplay.textContent =
            "Diagnosis Pending...";


        diagnosisTextDisplay.textContent =
            "Start typing to allow our highly questionable psychological analysis to begin.";


        diagnosisEmojiDisplay.textContent =
            "🧠";


        heatmap.textContent =
            "Start typing to generate your heatmap.";


        startButton.disabled = false;

        stopButton.disabled = true;

        removeHighlights();

    }
);


// -------------------------------
// KEYBOARD DETECTION
// -------------------------------

document.addEventListener(
    "keydown",
    function (event) {


        // Don't count keys when
        // session isn't running.

        if (!sessionRunning) {

            return;

        }


        // Don't count a key repeatedly
        // when it is being held down.

        if (event.repeat) {

            return;

        }


        // Count total key

        totalKeys++;

        totalKeysDisplay.textContent =
            totalKeys;


        // Get the actual key

        const key = event.key;


        // Convert to lowercase

        const keyName =
            key.toLowerCase();


        // Store the count

        if (keyCounts[keyName]) {

            keyCounts[keyName]++;

        }

        else {

            keyCounts[keyName] = 1;

        }


        // ---------------------------
        // BACKSPACE
        // ---------------------------

        if (key === "Backspace") {

            backspaceCount++;

            backspaceDisplay.textContent =
                backspaceCount;

        }


        // ---------------------------
        // SPACE
        // ---------------------------

        if (key === " ") {

            spaceCount++;

            spaceDisplay.textContent =
                spaceCount;

        }


        // ---------------------------
        // ENTER
        // ---------------------------

        if (key === "Enter") {

            enterCount++;

            enterDisplay.textContent =
                enterCount;

        }


        // ---------------------------
        // LAST KEY
        // ---------------------------

        let shownKey = key;


        if (key === " ") {

            shownKey = "SPACE";

        }


        lastKeyDisplay.textContent =
            "Last key: " + shownKey;


        // ---------------------------
        // ANIMATE KEYBOARD
        // ---------------------------

        highlightKey(key);


        // ---------------------------
        // UPDATE RESULTS
        // ---------------------------

        updateMostUsed();

        updateHeatmap();

        updateWPM();

    }
);


// -------------------------------
// HIGHLIGHT VIRTUAL KEY
// -------------------------------

function highlightKey(key) {


    const keys =
        document.querySelectorAll(".key");


    keys.forEach(
        function (button) {


            const buttonKey =
                button.getAttribute("data-key");


            if (!buttonKey) {

                return;

            }


            if (
                buttonKey.toLowerCase() ===
                key.toLowerCase()
            ) {


                button.classList.add(
                    "active"
                );


                setTimeout(
                    function () {

                        button.classList.remove(
                            "active"
                        );

                    },
                    150
                );

            }

        }
    );

}


// -------------------------------
// REMOVE HIGHLIGHTS
// -------------------------------

function removeHighlights() {


    const keys =
        document.querySelectorAll(".key");


    keys.forEach(
        function (key) {

            key.classList.remove(
                "active"
            );

        }
    );

}


// -------------------------------
// MOST USED KEY
// -------------------------------

function updateMostUsed() {


    let mostUsed = null;

    let highestCount = 0;


    for (
        let key in keyCounts
    ) {


        if (
            keyCounts[key] >
            highestCount
        ) {

            highestCount =
                keyCounts[key];

            mostUsed =
                key;

        }

    }


    if (mostUsed === null) {

        return;

    }


    let displayKey =
        mostUsed;


    if (displayKey === " ") {

        displayKey =
            "SPACE";

    }


    if (
        displayKey === "backspace"
    ) {

        displayKey =
            "BACKSPACE";

    }


    if (
        displayKey === "enter"
    ) {

        displayKey =
            "ENTER";

    }


    mostUsedDisplay.textContent =
        displayKey.toUpperCase();


    mostUsedMessage.textContent =

        displayKey.toUpperCase()
        +
        " has been pressed "
        +
        highestCount
        +
        " time(s). Your keyboard remembers everything.";

}


// -------------------------------
// HEATMAP
// -------------------------------

function updateHeatmap() {


    const letters =
        "qwertyuiopasdfghjklzxcvbnm"
        .split("");


    heatmap.innerHTML = "";


    let highest =
        1;


    // Find highest count

    for (
        let letter of letters
    ) {


        const count =
            keyCounts[letter] || 0;


        if (
            count > highest
        ) {

            highest =
                count;

        }

    }


    // Create boxes

    for (
        let letter of letters
    ) {


        const count =
            keyCounts[letter] || 0;


        const box =
            document.createElement(
                "div"
            );


        box.className =
            "heat-key";


        box.textContent =

            letter.toUpperCase()
            +
            " "
            +
            count;


        if (count > 0) {


            const intensity =
                count / highest;


            box.style.opacity =
                0.45 +
                intensity * 0.55;


            box.style.boxShadow =

                "0 0 "
                +
                Math.round(
                    intensity * 20
                )
                +
                "px rgba(139,92,246,"
                +
                intensity
                +
                ")";

        }


        heatmap.appendChild(box);

    }

}


// -------------------------------
// TIMER
// -------------------------------

function startTimer() {


    clearInterval(timer);


    timer =
        setInterval(
            function () {


                seconds++;


                const minutes =
                    Math.floor(
                        seconds / 60
                    );


                const remainingSeconds =
                    seconds % 60;


                const minuteText =
                    String(minutes)
                    .padStart(2, "0");


                const secondText =
                    String(remainingSeconds)
                    .padStart(2, "0");


                timerDisplay.textContent =

                    minuteText
                    +
                    ":"
                    +
                    secondText;


                updateWPM();


            },
            1000
        );

}


// -------------------------------
// WPM
// -------------------------------

function updateWPM() {


    if (seconds === 0) {

        wpmDisplay.textContent =
            "0 WPM";

        return;

    }


    // Approximately 5 characters = 1 word

    const words =
        totalKeys / 5;


    const minutes =
        seconds / 60;


    const wpm =
        Math.round(
            words / minutes
        );


    wpmDisplay.textContent =
        wpm + " WPM";

}


// -------------------------------
// DIAGNOSIS
// -------------------------------

function createDiagnosis() {


    let title;

    let message;

    let icon;


    // Very little typing

    if (
        totalKeys < 10
    ) {


        title =
            "THE MYSTERIOUS ONE";


        message =
            "You barely typed anything. Your keyboard knows almost nothing about you.";


        icon =
            "🕵️";

    }


    // Lots of backspace

    else if (
        backspaceCount >
        totalKeys * 0.15
    ) {


        title =
            "THE PERFECTIONIST";


        message =
            "You don't make mistakes. You simply reconsider every decision.";


        icon =
            "🧐";

    }


    // Lots of spaces

    else if (
        spaceCount >
        totalKeys * 0.25
    ) {


        title =
            "THE SPACER";


        message =
            "Your spacebar has worked harder than you.";


        icon =
            "🌌";

    }


    // Lots of Enter

    else if (
        enterCount > 15
    ) {


        title =
            "THE COMMITTER";


        message =
            "You press Enter with confidence you probably don't possess.";


        icon =
            "🚀";

    }


    // Lots of typing

    else if (
        totalKeys > 1000
    ) {


        title =
            "THE KEYBOARD WARRIOR";


        message =
            "You have typed enough to make your keyboard question its life choices.";


        icon =
            "⚔️";

    }


    // Normal

    else {


        title =
            "THE NORMAL HUMAN";


        message =
            "Your typing is suspiciously normal. We don't trust you.";


        icon =
            "🤨";

    }


    diagnosisDisplay.textContent =
        title;


    diagnosisTextDisplay.textContent =
        message;


    diagnosisEmojiDisplay.textContent =
        icon;

}


// ============================================
// END
// ============================================
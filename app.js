// ==========================================
// BIBLE APP - MAIN JAVASCRIPT
// ==========================================

const API_BASE = "https://api.midvash.com/v1";


// ==========================================
// BIBLE VERSIONS
// ==========================================

const BIBLE_VERSIONS = {
    kjv: {
        name: "King James Version",
        shortName: "KJV"
    },

    asv: {
        name: "American Standard Version",
        shortName: "ASV"
    },

    web: {
        name: "World English Bible",
        shortName: "WEB"
    },

    geneva1599: {
        name: "Geneva Bible 1599",
        shortName: "Geneva 1599"
    },

    dra: {
        name: "Douay-Rheims American Edition",
        shortName: "DRA"
    }
};


// ==========================================
// 66 BOOKS
// ==========================================

const BOOKS = [

    { name: "Genesis", id: "genesis", chapters: 50, testament: "OT" },
    { name: "Exodus", id: "exodus", chapters: 40, testament: "OT" },
    { name: "Leviticus", id: "leviticus", chapters: 27, testament: "OT" },
    { name: "Numbers", id: "numbers", chapters: 36, testament: "OT" },
    { name: "Deuteronomy", id: "deuteronomy", chapters: 34, testament: "OT" },
    { name: "Joshua", id: "joshua", chapters: 24, testament: "OT" },
    { name: "Judges", id: "judges", chapters: 21, testament: "OT" },
    { name: "Ruth", id: "ruth", chapters: 4, testament: "OT" },
    { name: "1 Samuel", id: "1-samuel", chapters: 31, testament: "OT" },
    { name: "2 Samuel", id: "2-samuel", chapters: 24, testament: "OT" },
    { name: "1 Kings", id: "1-kings", chapters: 22, testament: "OT" },
    { name: "2 Kings", id: "2-kings", chapters: 25, testament: "OT" },
    { name: "1 Chronicles", id: "1-chronicles", chapters: 29, testament: "OT" },
    { name: "2 Chronicles", id: "2-chronicles", chapters: 36, testament: "OT" },
    { name: "Ezra", id: "ezra", chapters: 10, testament: "OT" },
    { name: "Nehemiah", id: "nehemiah", chapters: 13, testament: "OT" },
    { name: "Esther", id: "esther", chapters: 10, testament: "OT" },
    { name: "Job", id: "job", chapters: 42, testament: "OT" },
    { name: "Psalms", id: "psalms", chapters: 150, testament: "OT" },
    { name: "Proverbs", id: "proverbs", chapters: 31, testament: "OT" },
    { name: "Ecclesiastes", id: "ecclesiastes", chapters: 12, testament: "OT" },
    { name: "Song of Solomon", id: "song", chapters: 8, testament: "OT" },
    { name: "Isaiah", id: "isaiah", chapters: 66, testament: "OT" },
    { name: "Jeremiah", id: "jeremiah", chapters: 52, testament: "OT" },
    { name: "Lamentations", id: "lamentations", chapters: 5, testament: "OT" },
    { name: "Ezekiel", id: "ezekiel", chapters: 48, testament: "OT" },
    { name: "Daniel", id: "daniel", chapters: 12, testament: "OT" },
    { name: "Hosea", id: "hosea", chapters: 14, testament: "OT" },
    { name: "Joel", id: "joel", chapters: 3, testament: "OT" },
    { name: "Amos", id: "amos", chapters: 9, testament: "OT" },
    { name: "Obadiah", id: "obadiah", chapters: 1, testament: "OT" },
    { name: "Jonah", id: "jonah", chapters: 4, testament: "OT" },
    { name: "Micah", id: "micah", chapters: 7, testament: "OT" },
    { name: "Nahum", id: "nahum", chapters: 3, testament: "OT" },
    { name: "Habakkuk", id: "habakkuk", chapters: 3, testament: "OT" },
    { name: "Zephaniah", id: "zephaniah", chapters: 3, testament: "OT" },
    { name: "Haggai", id: "haggai", chapters: 2, testament: "OT" },
    { name: "Zechariah", id: "zechariah", chapters: 14, testament: "OT" },
    { name: "Malachi", id: "malachi", chapters: 4, testament: "OT" },

    { name: "Matthew", id: "matthew", chapters: 28, testament: "NT" },
    { name: "Mark", id: "mark", chapters: 16, testament: "NT" },
    { name: "Luke", id: "luke", chapters: 24, testament: "NT" },
    { name: "John", id: "john", chapters: 21, testament: "NT" },
    { name: "Acts", id: "acts", chapters: 28, testament: "NT" },
    { name: "Romans", id: "romans", chapters: 16, testament: "NT" },
    { name: "1 Corinthians", id: "1-corinthians", chapters: 16, testament: "NT" },
    { name: "2 Corinthians", id: "2-corinthians", chapters: 13, testament: "NT" },
    { name: "Galatians", id: "galatians", chapters: 6, testament: "NT" },
    { name: "Ephesians", id: "ephesians", chapters: 6, testament: "NT" },
    { name: "Philippians", id: "philippians", chapters: 4, testament: "NT" },
    { name: "Colossians", id: "colossians", chapters: 4, testament: "NT" },
    { name: "1 Thessalonians", id: "1-thessalonians", chapters: 5, testament: "OT" },
    { name: "2 Thessalonians", id: "2-thessalonians", chapters: 3, testament: "NT" },
    { name: "1 Timothy", id: "1-timothy", chapters: 6, testament: "NT" },
    { name: "2 Timothy", id: "2-timothy", chapters: 4, testament: "NT" },
    { name: "Titus", id: "titus", chapters: 3, testament: "NT" },
    { name: "Philemon", id: "philemon", chapters: 1, testament: "NT" },
    { name: "Hebrews", id: "hebrews", chapters: 13, testament: "NT" },
    { name: "James", id: "james", chapters: 5, testament: "NT" },
    { name: "1 Peter", id: "1-peter", chapters: 5, testament: "NT" },
    { name: "2 Peter", id: "2-peter", chapters: 3, testament: "NT" },
    { name: "1 John", id: "1-john", chapters: 5, testament: "NT" },
    { name: "2 John", id: "2-john", chapters: 1, testament: "NT" },
    { name: "3 John", id: "3-john", chapters: 1, testament: "NT" },
    { name: "Jude", id: "jude", chapters: 1, testament: "NT" },
    { name: "Revelation", id: "revelation", chapters: 22, testament: "NT" }
];


// ==========================================
// CURRENT APP STATE
// ==========================================

let currentVersion = "kjv";
let currentBook = BOOKS[0];
let currentChapter = 1;


// ==========================================
// LOAD CHAPTER
// ==========================================

async function loadChapter() {

    const reader = document.getElementById("reader");

    if (!reader) return;

    reader.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading Scripture...</p>
        </div>
    `;

    try {

        const url =
            `${API_BASE}/${currentVersion}/${currentBook.id}/${currentChapter}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to load chapter");
        }

        const result = await response.json();

        const data = result.data || result;

        displayChapter(data);

    } catch (error) {

        console.error("Bible API error:", error);

        reader.innerHTML = `
            <div class="error-message">
                <h3>Unable to load Scripture</h3>

                <p>
                    We couldn't load this chapter.
                    Please check your internet connection
                    and try again.
                </p>

                <button onclick="loadChapter()">
                    Try Again
                </button>
            </div>
        `;
    }
}


// ==========================================
// DISPLAY CHAPTER
// ==========================================

function displayChapter(data) {

    const reader =
        document.getElementById("reader");

    reader.innerHTML = "";

    const title =
        document.createElement("div");

    title.className = "chapter-title";

    title.innerHTML = `
        <span>${currentBook.name}</span>
        <strong>Chapter ${currentChapter}</strong>
    `;

    reader.appendChild(title);


    if (!data || !data.verses) {

        reader.innerHTML += `
            <div class="error-message">
                <h3>No verses found</h3>
                <p>
                    This chapter could not be displayed.
                </p>
            </div>
        `;

        return;
    }


    data.verses.forEach(verse => {

        const verseElement =
            document.createElement("div");

        verseElement.className = "verse-row";

        verseElement.innerHTML = `
            <span class="verse-number">
                ${verse.number}
            </span>

            <span class="verse-text">
                ${verse.text}
            </span>
        `;

        reader.appendChild(verseElement);
    });


    updateNavigation();
}


// ==========================================
// POPULATE BOOKS
// ==========================================

function populateBooks() {

    const bookSelect =
        document.getElementById("bookSelect");

    if (!bookSelect) return;

    bookSelect.innerHTML = "";


    const oldTestament =
        document.createElement("optgroup");

    oldTestament.label =
        "Old Testament";


    BOOKS
        .filter(book => book.testament === "OT")
        .forEach(book => {

            const option =
                document.createElement("option");

            option.value = book.id;

            option.textContent = book.name;

            if (book.id === currentBook.id) {
                option.selected = true;
            }

            oldTestament.appendChild(option);
        });


    const newTestament =
        document.createElement("optgroup");

    newTestament.label =
        "New Testament";


    BOOKS
        .filter(book => book.testament === "NT")
        .forEach(book => {

            const option =
                document.createElement("option");

            option.value = book.id;

            option.textContent = book.name;

            if (book.id === currentBook.id) {
                option.selected = true;
            }

            newTestament.appendChild(option);
        });


    bookSelect.appendChild(oldTestament);

    bookSelect.appendChild(newTestament);

    populateChapters();
}


// ==========================================
// POPULATE CHAPTERS
// ==========================================

function populateChapters() {

    const chapterSelect =
        document.getElementById("chapterSelect");

    if (!chapterSelect) return;

    chapterSelect.innerHTML = "";


    for (
        let i = 1;
        i <= currentBook.chapters;
        i++
    ) {

        const option =
            document.createElement("option");

        option.value = i;

        option.textContent =
            `Chapter ${i}`;

        if (i === currentChapter) {
            option.selected = true;
        }

        chapterSelect.appendChild(option);
    }
}


// ==========================================
// POPULATE VERSIONS
// ==========================================

function populateVersions() {

    const versionSelect =
        document.getElementById("versionSelect");

    if (!versionSelect) return;

    versionSelect.innerHTML = "";


    Object.entries(BIBLE_VERSIONS)
        .forEach(([id, version]) => {

            const option =
                document.createElement("option");

            option.value = id;

            option.textContent =
                `${version.shortName} — ${version.name}`;

            if (id === currentVersion) {
                option.selected = true;
            }

            versionSelect.appendChild(option);
        });
}


// ==========================================
// NAVIGATION
// ==========================================

function updateNavigation() {

    const previousButton =
        document.getElementById(
            "previousChapter"
        );

    const nextButton =
        document.getElementById(
            "nextChapter"
        );

    if (!previousButton || !nextButton) {
        return;
    }


    const firstBook =
        BOOKS[0];

    const lastBook =
        BOOKS[BOOKS.length - 1];


    previousButton.disabled =
        currentBook === firstBook &&
        currentChapter === 1;


    nextButton.disabled =
        currentBook === lastBook &&
        currentChapter === currentBook.chapters;
}


// ==========================================
// PREVIOUS CHAPTER
// ==========================================

function previousChapter() {

    if (currentChapter > 1) {

        currentChapter--;

    } else {

        const index =
            BOOKS.indexOf(currentBook);

        if (index > 0) {

            currentBook =
                BOOKS[index - 1];

            currentChapter =
                currentBook.chapters;
        }
    }

    populateBooks();

    loadChapter();
}


// ==========================================
// NEXT CHAPTER
// ==========================================

function nextChapter() {

    if (
        currentChapter <
        currentBook.chapters
    ) {

        currentChapter++;

    } else {

        const index =
            BOOKS.indexOf(currentBook);

        if (
            index <
            BOOKS.length - 1
        ) {

            currentBook =
                BOOKS[index + 1];

            currentChapter = 1;
        }
    }

    populateBooks();

    loadChapter();
}


// ==========================================
// EVENT LISTENERS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        populateVersions();

        populateBooks();

        loadChapter();


        document
            .getElementById("versionSelect")
            ?.addEventListener(
                "change",
                event => {

                    currentVersion =
                        event.target.value;

                    loadChapter();
                }
            );


        document
            .getElementById("bookSelect")
            ?.addEventListener(
                "change",
                event => {

                    const selectedBook =
                        BOOKS.find(
                            book =>
                                book.id ===
                                event.target.value
                        );

                    if (!selectedBook) {
                        return;
                    }

                    currentBook =
                        selectedBook;

                    currentChapter = 1;

                    populateChapters();

                    loadChapter();
                }
            );


        document
            .getElementById("chapterSelect")
            ?.addEventListener(
                "change",
                event => {

                    currentChapter =
                        Number(
                            event.target.value
                        );

                    loadChapter();
                }
            );


        document
            .getElementById("previousChapter")
            ?.addEventListener(
                "click",
                previousChapter
            );


        document
            .getElementById("nextChapter")
            ?.addEventListener(
                "click",
                nextChapter
            );
    }
);

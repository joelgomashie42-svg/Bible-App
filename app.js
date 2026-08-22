// ==========================================
// BIBLE APP
// ==========================================

// Bible data is loaded directly from the
// official Midvash open Bible dataset.
//
// The dataset provides public-domain or
// freely redistributable Bible texts.
// ==========================================


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

    // OLD TESTAMENT

    { name: "Genesis", id: "Gen", chapters: 50, testament: "OT" },
    { name: "Exodus", id: "Exod", chapters: 40, testament: "OT" },
    { name: "Leviticus", id: "Lev", chapters: 27, testament: "OT" },
    { name: "Numbers", id: "Num", chapters: 36, testament: "OT" },
    { name: "Deuteronomy", id: "Deut", chapters: 34, testament: "OT" },
    { name: "Joshua", id: "Josh", chapters: 24, testament: "OT" },
    { name: "Judges", id: "Judg", chapters: 21, testament: "OT" },
    { name: "Ruth", id: "Ruth", chapters: 4, testament: "OT" },
    { name: "1 Samuel", id: "1Sam", chapters: 31, testament: "OT" },
    { name: "2 Samuel", id: "2Sam", chapters: 24, testament: "OT" },
    { name: "1 Kings", id: "1Kgs", chapters: 22, testament: "OT" },
    { name: "2 Kings", id: "2Kgs", chapters: 25, testament: "OT" },
    { name: "1 Chronicles", id: "1Chr", chapters: 29, testament: "OT" },
    { name: "2 Chronicles", id: "2Chr", chapters: 36, testament: "OT" },
    { name: "Ezra", id: "Ezra", chapters: 10, testament: "OT" },
    { name: "Nehemiah", id: "Neh", chapters: 13, testament: "OT" },
    { name: "Esther", id: "Esth", chapters: 10, testament: "OT" },
    { name: "Job", id: "Job", chapters: 42, testament: "OT" },
    { name: "Psalms", id: "Ps", chapters: 150, testament: "OT" },
    { name: "Proverbs", id: "Prov", chapters: 31, testament: "OT" },
    { name: "Ecclesiastes", id: "Eccl", chapters: 12, testament: "OT" },
    { name: "Song of Solomon", id: "Song", chapters: 8, testament: "OT" },
    { name: "Isaiah", id: "Isa", chapters: 66, testament: "OT" },
    { name: "Jeremiah", id: "Jer", chapters: 52, testament: "OT" },
    { name: "Lamentations", id: "Lam", chapters: 5, testament: "OT" },
    { name: "Ezekiel", id: "Ezek", chapters: 48, testament: "OT" },
    { name: "Daniel", id: "Dan", chapters: 12, testament: "OT" },
    { name: "Hosea", id: "Hos", chapters: 14, testament: "OT" },
    { name: "Joel", id: "Joel", chapters: 3, testament: "OT" },
    { name: "Amos", id: "Amos", chapters: 9, testament: "OT" },
    { name: "Obadiah", id: "Obad", chapters: 1, testament: "OT" },
    { name: "Jonah", id: "Jonah", chapters: 4, testament: "OT" },
    { name: "Micah", id: "Mic", chapters: 7, testament: "OT" },
    { name: "Nahum", id: "Nah", chapters: 3, testament: "OT" },
    { name: "Habakkuk", id: "Hab", chapters: 3, testament: "OT" },
    { name: "Zephaniah", id: "Zeph", chapters: 3, testament: "OT" },
    { name: "Haggai", id: "Hag", chapters: 2, testament: "OT" },
    { name: "Zechariah", id: "Zech", chapters: 14, testament: "OT" },
    { name: "Malachi", id: "Mal", chapters: 4, testament: "OT" },


    // NEW TESTAMENT

    { name: "Matthew", id: "Matt", chapters: 28, testament: "NT" },
    { name: "Mark", id: "Mark", chapters: 16, testament: "NT" },
    { name: "Luke", id: "Luke", chapters: 24, testament: "NT" },
    { name: "John", id: "John", chapters: 21, testament: "NT" },
    { name: "Acts", id: "Acts", chapters: 28, testament: "NT" },
    { name: "Romans", id: "Rom", chapters: 16, testament: "NT" },
    { name: "1 Corinthians", id: "1Cor", chapters: 16, testament: "NT" },
    { name: "2 Corinthians", id: "2Cor", chapters: 13, testament: "NT" },
    { name: "Galatians", id: "Gal", chapters: 6, testament: "NT" },
    { name: "Ephesians", id: "Eph", chapters: 6, testament: "NT" },
    { name: "Philippians", id: "Phil", chapters: 4, testament: "NT" },
    { name: "Colossians", id: "Col", chapters: 4, testament: "NT" },
    { name: "1 Thessalonians", id: "1Thess", chapters: 5, testament: "NT" },
    { name: "2 Thessalonians", id: "2Thess", chapters: 3, testament: "NT" },
    { name: "1 Timothy", id: "1Tim", chapters: 6, testament: "NT" },
    { name: "2 Timothy", id: "2Tim", chapters: 4, testament: "NT" },
    { name: "Titus", id: "Titus", chapters: 3, testament: "NT" },
    { name: "Philemon", id: "Phlm", chapters: 1, testament: "NT" },
    { name: "Hebrews", id: "Heb", chapters: 13, testament: "NT" },
    { name: "James", id: "Jas", chapters: 5, testament: "NT" },
    { name: "1 Peter", id: "1Pet", chapters: 5, testament: "NT" },
    { name: "2 Peter", id: "2Pet", chapters: 3, testament: "NT" },
    { name: "1 John", id: "1John", chapters: 5, testament: "NT" },
    { name: "2 John", id: "2John", chapters: 1, testament: "NT" },
    { name: "3 John", id: "3John", chapters: 1, testament: "NT" },
    { name: "Jude", id: "Jude", chapters: 1, testament: "NT" },
    { name: "Revelation", id: "Rev", chapters: 22, testament: "NT" }

];


// ==========================================
// CURRENT POSITION
// ==========================================

let currentVersion = "kjv";

let currentBook = BOOKS[0];

let currentChapter = 1;


// ==========================================
// GET BIBLE BOOK URL
// ==========================================

function getBookURL() {

    return (
        "https://raw.githubusercontent.com/" +
        "midvash/bible-data/main/versions/en/" +
        currentVersion +
        "/books/" +
        currentBook.id +
        ".json"
    );

}


// ==========================================
// LOAD CHAPTER
// ==========================================

async function loadChapter() {

    const reader =
        document.getElementById("reader");

    if (!reader) return;


    reader.innerHTML = `

        <div class="loading">

            <div class="loading-spinner"></div>

            <p>
                Loading Scripture...
            </p>

        </div>

    `;


    try {

        const response =
            await fetch(getBookURL());


        if (!response.ok) {

            throw new Error(
                "Unable to load Bible book."
            );

        }


        const book =
            await response.json();


        /*
         * The dataset stores chapters
         * in an array.
         *
         * Array positions start at 0,
         * while Bible chapters start at 1.
         *
         * Therefore:
         *
         * Chapter 1 = chapters[0]
         * Chapter 2 = chapters[1]
         * etc.
         */

        const chapter =
            book.chapters[currentChapter - 1];


        if (!chapter) {

            throw new Error(
                "Chapter not found."
            );

        }


        displayChapter(chapter);


    } catch (error) {

        console.error(
            "Bible loading error:",
            error
        );


        reader.innerHTML = `

            <div class="error-message">

                <h3>
                    Unable to load Scripture
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="loadChapter()"
                >
                    Try Again
                </button>

            </div>

        `;

    }

}


// ==========================================
// DISPLAY CHAPTER
// ==========================================

function displayChapter(chapter) {

    const reader =
        document.getElementById("reader");


    reader.innerHTML = "";


    // Chapter heading

    const title =
        document.createElement("div");

    title.className =
        "chapter-title";


    title.innerHTML = `

        <span>
            ${currentBook.name}
        </span>

        <strong>
            Chapter ${currentChapter}
        </strong>

    `;


    reader.appendChild(title);


    // Make sure verses exist

    if (
        !chapter ||
        !Array.isArray(chapter.verses)
    ) {

        reader.innerHTML += `

            <div class="error-message">

                <h3>
                    No verses found
                </h3>

                <p>
                    This chapter contains
                    no readable verse data.
                </p>

            </div>

        `;

        return;

    }


    // Display every verse

    chapter.verses.forEach(
        verse => {

            const verseElement =
                document.createElement("div");


            verseElement.className =
                "verse-row";


            verseElement.innerHTML = `

                <span class="verse-number">
                    ${verse.number}
                </span>

                <span class="verse-text">
                    ${verse.text}
                </span>

            `;


            reader.appendChild(
                verseElement
            );

        }
    );


    updateNavigation();

}


// ==========================================
// VERSION SELECTOR
// ==========================================

function populateVersions() {

    const select =
        document.getElementById(
            "versionSelect"
        );


    if (!select) return;


    select.innerHTML = "";


    Object.entries(
        BIBLE_VERSIONS
    ).forEach(
        ([id, version]) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value = id;


            option.textContent =
                `${version.shortName} — ${version.name}`;


            if (
                id === currentVersion
            ) {

                option.selected = true;

            }


            select.appendChild(
                option
            );

        }
    );

}


// ==========================================
// BOOK SELECTOR
// ==========================================

function populateBooks() {

    const select =
        document.getElementById(
            "bookSelect"
        );


    if (!select) return;


    select.innerHTML = "";


    const oldTestament =
        document.createElement(
            "optgroup"
        );


    oldTestament.label =
        "Old Testament";


    BOOKS
        .filter(
            book =>
                book.testament === "OT"
        )
        .forEach(
            book => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    book.id;


                option.textContent =
                    book.name;


                if (
                    book.id ===
                    currentBook.id
                ) {

                    option.selected = true;

                }


                oldTestament.appendChild(
                    option
                );

            }
        );


    const newTestament =
        document.createElement(
            "optgroup"
        );


    newTestament.label =
        "New Testament";


    BOOKS
        .filter(
            book =>
                book.testament === "NT"
        )
        .forEach(
            book => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    book.id;


                option.textContent =
                    book.name;


                if (
                    book.id ===
                    currentBook.id
                ) {

                    option.selected = true;

                }


                newTestament.appendChild(
                    option
                );

            }
        );


    select.appendChild(
        oldTestament
    );


    select.appendChild(
        newTestament
    );


    populateChapters();

}


// ==========================================
// CHAPTER SELECTOR
// ==========================================

function populateChapters() {

    const select =
        document.getElementById(
            "chapterSelect"
        );


    if (!select) return;


    select.innerHTML = "";


    for (
        let i = 1;
        i <= currentBook.chapters;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value = i;


        option.textContent =
            `Chapter ${i}`;


        if (
            i === currentChapter
        ) {

            option.selected = true;

        }


        select.appendChild(
            option
        );

    }

}


// ==========================================
// NAVIGATION BUTTONS
// ==========================================

function updateNavigation() {

    const previous =
        document.getElementById(
            "previousChapter"
        );


    const next =
        document.getElementById(
            "nextChapter"
        );


    if (!previous || !next) return;


    const firstBook =
        BOOKS[0];


    const lastBook =
        BOOKS[
            BOOKS.length - 1
        ];


    previous.disabled =
        currentBook === firstBook &&
        currentChapter === 1;


    next.disabled =
        currentBook === lastBook &&
        currentChapter ===
        currentBook.chapters;

}


// ==========================================
// PREVIOUS CHAPTER
// ==========================================

function previousChapter() {

    if (currentChapter > 1) {

        currentChapter--;

    } else {

        const index =
            BOOKS.indexOf(
                currentBook
            );


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
            BOOKS.indexOf(
                currentBook
            );


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
// START APP
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        populateVersions();

        populateBooks();

        loadChapter();


        // Version changed

        document
            .getElementById(
                "versionSelect"
            )
            ?.addEventListener(
                "change",
                event => {

                    currentVersion =
                        event.target.value;

                    loadChapter();

                }
            );


        // Book changed

        document
            .getElementById(
                "bookSelect"
            )
            ?.addEventListener(
                "change",
                event => {

                    const selectedBook =
                        BOOKS.find(
                            book =>
                                book.id ===
                                event.target.value
                        );


                    if (!selectedBook)
                        return;


                    currentBook =
                        selectedBook;


                    currentChapter = 1;


                    populateChapters();

                    loadChapter();

                }
            );


        // Chapter changed

        document
            .getElementById(
                "chapterSelect"
            )
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


        // Previous

        document
            .getElementById(
                "previousChapter"
            )
            ?.addEventListener(
                "click",
                previousChapter
            );


        // Next

        document
            .getElementById(
                "nextChapter"
            )
            ?.addEventListener(
                "click",
                nextChapter
            );

    }
);

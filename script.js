// JavaScript

// Define top 10 COVID-19 symptoms
const symptoms = [
    { name: "Fever or chills", image: "images/fever.jpg" },
    { name: "Cough", image: "images/cough.jpg" },
    { name: "Shortness of breath or difficulty breathing", image: "images/breath.jpg" },
    { name: "Fatigue", image: "images/fatigue.jpg" },
    { name: "Muscle or body aches", image: "images/aches.jpg" },
    { name: "Headache", image: "images/headache.jpg" },
    { name: "New loss of taste or smell", image: "images/taste_smell.jpg" },
    { name: "Sore throat", image: "images/sore_throat.jpg" },
    { name: "Congestion or runny nose", image: "images/congestion.jpg" },
    { name: "Nausea or vomiting", image: "images/nausea.jpg" }
];

let selectedDate = new Date().toISOString().slice(0, 10); // Default selected date is today

// Function to generate symptom list
function generateSymptomList() {
    const symptomList = document.getElementById('symptoms');
    symptomList.innerHTML = ''; // Clear previous symptoms

    symptoms.forEach(symptom => {
        const symptomItem = document.createElement('div');
        symptomItem.classList.add('symptom-item');
        symptomItem.innerHTML = `
            <img src="${symptom.image}" alt="${symptom.name}" class="symptom-image">
            <div class="symptom-item-name">${symptom.name}</div>
        `;
        symptomList.appendChild(symptomItem);

        symptomItem.addEventListener('click', function() {
            openRatingModal(symptom.name); // Open rating modal on click
        });
    });
}

// Open the rating modal and handle stored ratings
function openRatingModal(symptom) {
    const modal = document.getElementById('ratingModal');
    const modalSymptom = document.getElementById('modalSymptom');
    modalSymptom.innerText = symptom;

    const storedRatingKey = `${selectedDate}-${symptom}`;
    const storedRating = parseInt(localStorage.getItem(storedRatingKey)) || 0;

    const ratingStars = document.querySelector('.rating-stars');
    ratingStars.innerHTML = ''; // Clear previous stars

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.classList.add('rating-star');
        star.innerHTML = '&#9733;';
        star.dataset.rating = i;

        star.addEventListener('click', function() {
            highlightStars(i, ratingStars);
            submitRating(symptom, i); // Save rating immediately on click
        });
        ratingStars.appendChild(star);
    }

    highlightStars(storedRating, ratingStars);

    modal.style.display = 'block';
}

// Highlight stars based on the rating
function highlightStars(rating, ratingStars) {
    const stars = ratingStars.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        star.classList.toggle('selected', index < rating);
    });
}

// Save the rating to local storage
function submitRating(symptom, rating) {
    const ratingKey = `${selectedDate}-${symptom}`;
    localStorage.setItem(ratingKey, rating);
    generateSummary();
}

// Close the modal window
function closeModal() {
    const modal = document.getElementById('ratingModal');
    modal.style.display = 'none';
}

document.getElementById('submitRating').addEventListener('click', closeModal);

function setupModalClose() {
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', closeModal);
    const modal = document.getElementById('ratingModal');
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function generateCalendar(month, year) {
    const calendarBody = document.querySelector('.calendar-body');
    calendarBody.innerHTML = '';

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        calendarBody.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month + 1}-${day}`;
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.innerText = day;
        cell.addEventListener('click', () => {
            selectedDate = `${year}-${month + 1}-${day}`;
            updateSymptomListForDate(selectedDate);
            // Remove 'selected' class from all calendar-day elements
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('selected');
            });
            // Add 'selected' class to the clicked date cell
            cell.classList.add('selected');
        });
        calendarBody.appendChild(cell);
        if (new Date(year, month, day).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)) {
            cell.classList.add('active'); // Highlight the current day
        }
    }
}


function setupNavigation() {
    document.querySelector('.prev').addEventListener('click', () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else {
            currentMonth -= 1;
        }
        updateCalendar();
    });

    document.querySelector('.next').addEventListener('click', () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear += 1;
        } else {
            currentMonth += 1;
        }
        updateCalendar();
    });
}

function updateCalendar() {
    document.querySelector('.month-year').textContent = `${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`;
    generateCalendar(currentMonth, currentYear);
}

function updateSymptomListForDate(date) {
    console.log(`Updating symptoms for ${date}`);
    generateSymptomList(); // Regenerate symptom list which might include loading specific data for the selected date
}

function generateSummary() {
    const ratings = {};

    // Collect ratings for each symptom from local storage
    symptoms.forEach(symptom => {
        const rating = localStorage.getItem(`${selectedDate}-${symptom.name}`);
        if (rating) {
            ratings[symptom.name] = parseInt(rating);
        }
    });

    const ratedSymptoms = Object.keys(ratings);
    if (ratedSymptoms.length >= 3) {
        let summary = "Patient Condition Summary for " + new Date(selectedDate).toDateString() + ":\n\n";
        let resourceLinks = new Set(); // To store unique links
        
        // Generate detailed summaries for each symptom
        symptoms.forEach(symptom => {
            const rating = ratings[symptom.name];
            if (rating !== undefined && rating >= 3) {
                summary += `${symptom.name}: Reported severity is high. `;
                const adviceDetails = generateAdvice(symptom.name);
                summary += adviceDetails.advice;
                resourceLinks.add(adviceDetails.link);
            }
        });

        summary += "\nFor more information, please refer to the following resources:\n";
        resourceLinks.forEach(link => {
            summary += `${link}\n`; // Append each unique link to the summary
        });

        document.getElementById('conditionSummary').innerText = summary;
    } else {
        document.getElementById('conditionSummary').innerText = "Please rate at least 3 symptoms to generate a comprehensive summary.";
    }
}

function generateAdvice(symptomName) {
    switch (symptomName) {
        case "Fever or chills":
            return {
                advice: "It's crucial to monitor temperature and hydrate well. Consider seeking medical advice if fever is high or persistent. ",
                link: "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html"
            };
        case "Cough":
            return {
                advice: "If persistent, consider consulting a healthcare provider. ",
                link: "https://www.covid.gov"
            };
        case "Shortness of breath or difficulty breathing":
            return {
                advice: "This may require immediate medical attention if conditions worsen. ",
                link: "https://www.healthcare.gov"
            };
        case "Fatigue":
            return {
                advice: "Rest is crucial for recovery. ",
                link: "https://www.cdc.gov/sleep/about_sleep/index.html"
            };
        case "Muscle or body aches":
            return {
                advice: "Potentially indicates strenuous activities or flu-like symptoms. ",
                link: "https://www.cdc.gov/flu/symptoms/symptoms.htm"
            };
        case "Headache":
            return {
                advice: "If severe, consider medication after consulting with a doctor. ",
                link: "https://www.healthcare.gov"
            };
        case "New loss of taste or smell":
            return {
                advice: "Testing may be advised as it could indicate viral infections such as COVID-19. ",
                link: "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html"
            };
        case "Sore throat":
            return {
                advice: "Could be alleviated with warm fluids and rest. ",
                link: "https://www.cdc.gov/antibiotic-use/sore-throat.html"
            };
        case "Congestion or runny nose":
            return {
                advice: "Common in colds or allergies. ",
                link: "https://www.usa.gov/health"
            };
        case "Nausea or vomiting":
            return {
                advice: "Ensure to stay hydrated and consume light meals. ",
                link: "https://www.healthcare.gov"
            };
        default:
            return {
                advice: "Consider monitoring and reviewing health safety guidelines. ",
                link: "https://www.usa.gov/health"
            };
    }
}



// Call this function whenever you want to generate a summary, for example after updating any rating


document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    updateCalendar();
    generateSymptomList();
});

window.onload = setupModalClose;

document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    setupForm();
    initializeDatePicker();
    setupCarousel();

});

const webAppUrl = 'https://script.google.com/macros/s/AKfycbzUftLx1pEHi-FPKDJc8PE5pTTDFSaESziqwIiQJNpJZ30Grtmi6_62mBjqeBuvl4CY9g/exec'; // Replace with your Menu fetch script URL

let menus = {};
let currentWeek = 'thisWeekMenu'; // Default to this week

function fetchMenu() {
    fetch(webAppUrl)
        .then(response => response.json())
        .then(data => {
            menus = data;
            displayCurrentMenu();
        })
        .catch(error => {
            console.error('Error fetching menu:', error);
            const menuSection = document.getElementById('menu');
            menuSection.innerHTML += '<p class="text-center text-red-500 mt-4">Unable to load the menu at this time.</p>';
        });
}


function displayCurrentMenu() {
    const menuCardsContainer = document.getElementById('menu-cards');
    menuCardsContainer.innerHTML = ''; // Clear existing content

    const currentMenu = menus[currentWeek] || [];

    // Create a menu card
    const card = document.createElement('div');
    card.classList.add('bg-white', 'shadow-md', 'rounded-lg', 'p-6', 'mx-auto');

    const header = document.createElement('h3');
    header.classList.add('text-2xl', 'font-semibold', 'mb-4', 'text-center', 'text-blue-800');
    header.textContent = getWeekTitle(currentWeek);
    card.appendChild(header);

    if (currentMenu.length === 0) {
        const li = document.createElement('p');
        li.textContent = `No menu available for ${getWeekTitle(currentWeek).toLowerCase()}.`;
        li.classList.add('text-center', 'text-gray-500');
        card.appendChild(li);
    } else {
        const ul = document.createElement('ul');
        ul.classList.add('space-y-2');
        currentMenu.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `• ${item}`;
            li.classList.add('text-lg');
            ul.appendChild(li);
        });
        card.appendChild(ul);
    }

    menuCardsContainer.appendChild(card);
}

function getWeekTitle(weekKey) {
    switch (weekKey) {
        case 'lastWeekMenu':
            return "Last Week's Menu";
        case 'thisWeekMenu':
            return "This Week's Menu";
        case 'nextWeekMenu':
            return "Next Week's Menu";
        default:
            return "Menu";
    }
}

function setupForm() {
    const form = document.getElementById('rsvp-form');
    const message = document.getElementById('form-message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Gather form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const date = document.getElementById('date').value.trim();
        const guests = document.getElementById('guests').value.trim();

        // Regular expressions for validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[0-9]{10,15}$/;

        // Validate required fields
        if (!name || !date || !guests) {
            message.classList.remove('text-green-500');
            message.classList.add('text-red-500');
            message.textContent = 'Please fill in all required fields.';
            return;
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            message.classList.remove('text-green-500');
            message.classList.add('text-red-500');
            message.textContent = 'Please enter a valid email address.';
            return;
        }

        // Validate phone format if provided
        if (phone && !phoneRegex.test(phone)) {
            message.classList.remove('text-green-500');
            message.classList.add('text-red-500');
            message.textContent = 'Please enter a valid phone number.';
            return;
        }

        const formData = {
            name: name,
            email: email,
            phone: phone,
            date: date,
            guests: guests
        };

        // Send data to Google Apps Script
        fetch('https://script.google.com/macros/s/AKfycbybRQ_qVmQDVDGgQx1wfQfYdV8xusSsTvTjdOXiVAVlJo18k5Swu87iOaFgIdH4G0rfVg/exec', { // Replace with your RSVP script URL
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(() => {
            message.classList.remove('text-red-500');
            message.classList.add('text-green-500');
            message.textContent = 'Thank you for your RSVP!';
            form.reset();
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            message.classList.remove('text-green-500');
            message.classList.add('text-red-500');
            message.textContent = 'There was an error submitting your RSVP. Please try again later.';
        });
    });
}

let flatpickrInstance;

function initializeDatePicker() {
    flatpickrInstance = flatpickr("#date-picker", {
        inline: true,
        justify: "center",
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: new Date().fp_incr(100), // Allows selection within the next 30 days
        locale: {
            firstDayOfWeek: 6 // Saturday
        },
        enable: [
            function(date) {
                return date.getDay() === 5; // Enable only Fridays (5 = Friday)
            }
        ],
        disable: [
            function(date) {
                return date.getDay() !== 5; // Disable all except Fridays
            }
        ],
        onChange: function(selectedDates, dateStr, instance) {
            // Update the hidden input field
            document.getElementById('date').value = dateStr;
        }
    });
}

function setupCarousel() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    prevButton.addEventListener('click', () => {
        if (currentWeek === 'nextWeekMenu') {
            currentWeek = 'thisWeekMenu';
            displayCurrentMenu();
        } else if (currentWeek === 'thisWeekMenu') {
            currentWeek = 'lastWeekMenu';
            displayCurrentMenu();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentWeek === 'lastWeekMenu') {
            currentWeek = 'thisWeekMenu';
            displayCurrentMenu();
        } else if (currentWeek === 'thisWeekMenu') {
            currentWeek = 'nextWeekMenu';
            displayCurrentMenu();
        }
    });
}

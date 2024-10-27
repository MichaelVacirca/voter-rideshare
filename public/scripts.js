// Utility function for showing notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Handle rider form submission
document.getElementById('riderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        pickupAddress: document.getElementById('pickup').value,
        pollingLocation: document.getElementById('polling').value,
        requestedTime: new Date(document.getElementById('time').value)
    };

    try {
        const response = await fetch('/api/riders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showNotification('Ride request submitted successfully! We\'ll contact you soon.');
            e.target.reset();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error submitting ride request', 'error');
        }
    } catch (error) {
        showNotification('Error connecting to server', 'error');
        console.error('Error:', error);
    }
});

// Handle driver form submission
document.getElementById('driverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const availabilitySelect = document.getElementById('availability');
    const selectedAvailability = Array.from(availabilitySelect.selectedOptions).map(option => option.value);
    
    const formData = {
        name: document.getElementById('driverName').value,
        phone: document.getElementById('driverPhone').value,
        email: document.getElementById('driverEmail').value,
        vehicle: document.getElementById('vehicle').value,
        availableSeats: parseInt(document.getElementById('seats').value),
        availability: selectedAvailability.map(time => ({
            date: new Date(),
            timeSlot: time
        }))
    };

    try {
        const response = await fetch('/api/drivers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showNotification('Driver registration successful! We\'ll verify your information and contact you soon.');
            e.target.reset();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error registering as driver', 'error');
        }
    } catch (error) {
        showNotification('Error connecting to server', 'error');
        console.error('Error:', error);
    }
});

// Set minimum date/time for the pickup time input
const timeInput = document.getElementById('time');
const now = new Date();
const timezoneOffset = now.getTimezoneOffset() * 60000;
const localDateTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
timeInput.min = localDateTime;
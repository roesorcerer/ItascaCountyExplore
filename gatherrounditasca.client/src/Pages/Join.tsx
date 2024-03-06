import React, { useState } from 'react';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';

// Sample data for dropdowns
const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Black", "White", "Pink", "Grey"];
const foods = ["Pizza", "Sushi", "Pasta", "Burger", "Salad", "Steak", "Tacos", "Curry", "Ice Cream", "Chocolate"];
const animals = ["Dog", "Cat", "Bird", "Fish", "Lion", "Tiger", "Bear", "Elephant", "Wolf", "Fox"];

/*interface Player {
        updateNumber: number;
        date: string;
        locationUpdate: string;
        leaderboardUpdate: string;
}*/

const Join: React.FC = () => {
    const [email, setEmail] = useState('');
    const [favoriteColor, setFavoriteColor] = useState('');
    const [favoriteFood, setFavoriteFood] = useState('');
    const [favoriteAnimal, setFavoriteAnimal] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [showModal, setShowModal] = useState(false);
   // const [updates, setUpdates] = useState<Player[]>([]);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        // Check if all fields are filled
        if (!email || !favoriteColor || !favoriteFood || !favoriteAnimal) {
            setErrorMessage('Please complete all fields.');
            return;
        }

        setErrorMessage(''); // Clear error message on successful validation
        // Ensure generateId has already been called and playerId is set
        generateId();
    };

    const generateId = async () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Keep this line
        const id = `${favoriteColor[0]}${favoriteFood[0]}${favoriteAnimal[0]}${randomNum}`;
        const playerId = id.toUpperCase();
        setPlayerId(playerId); // Set the playerId state
        setShowModal(true); // Show modal with Player ID

        // Send data to backend after generating player ID
        const data = { email, favoriteColor, favoriteFood, favoriteAnimal, playerId }; // This already includes playerId

        const response = await fetch('/api/player/register', { // Make sure the URL is correct
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            // Handle error
            console.error("Failed to register player");
        }
    };

    // Added logic for "Retrieve ID" button
    const retrieveId = async () => {
        try {
            const response = await fetch(`/api/player/retrieve?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.PlayerId) {
                setPlayerId(data.PlayerId);
                setShowModal(true); // Show modal with Player ID
            } else {
                alert('No player ID found for the provided email.');
            }
        } catch (error) {
            console.error("Failed to retrieve player ID:", error);
            alert('Error retrieving player ID. Please try again.');
        }
    };




    return (
        <>
            <Header />
            <div className="container-fluid">
                <div className="container-fluid">
            <h1>Sign up to play now</h1>
            <h3>Join the adventure around some of the sights around Itasca County. Enter your email address to
                    receive a unique player identification number to get started and watch yourself climb the ranks!</h3>
                {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3" style={{ maxWidth: '300px', margin: 'auto' }}>
                    <label htmlFor="emailInput" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="emailInput" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {/* Dropdown for favorite color */}
                <div className="mb-3" style={{ maxWidth: '300px', margin: 'auto' }}>
                    <label htmlFor="favoriteColorSelect" className="form-label">What is your favorite color?</label>
                    <select className="form-select" id="favoriteColorSelect" value={favoriteColor} onChange={(e) => setFavoriteColor(e.target.value)}>
                            <option value="">Please select your favorite color</option>
                            {colors.map(color => <option key={color} value={color}>{color}</option>)}
                    </select>
                </div>
                {/* Dropdown for favorite food */}
                <div className="mb-3" style={{ maxWidth: '300px', margin: 'auto' }}>
                    <label htmlFor="favoriteFoodSelect" className="form-label">What is your favorite food?</label>
                    <select className="form-select" id="favoriteFoodSelect" value={favoriteFood} onChange={(e) => setFavoriteFood(e.target.value)}>
                            <option value="">Please select your favorite food</option>
                            {foods.map(food => <option key={food} value={food}>{food}</option>)}
                    </select>
                </div>
                {/* Dropdown for favorite animal */}
                <div className="mb-3" style={{ maxWidth: '300px', margin: 'auto' }}>
                    <label htmlFor="favoriteAnimalSelect" className="form-label">What is your favorite animal?</label>
                    <select className="form-select" id="favoriteAnimalSelect" value={favoriteAnimal} onChange={(e) => setFavoriteAnimal(e.target.value)}>
                            <option value="">Please select your favorite animal</option>
                            {animals.map(animal => <option key={animal} value={animal}>{animal}</option>)}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Generate ID</button>
                <button type="button" className="btn btn-secondary" onClick={retrieveId}>Retrieve ID</button>
            </form>
            {/* Modal for displaying Player ID */}
            {showModal && (
                <div className="modal" tabIndex={-1} style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Your Player ID</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Your unique player ID is: <strong>{playerId}</strong></p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
            </div>
            <Footer />
        </>
    );
};

export default Join;
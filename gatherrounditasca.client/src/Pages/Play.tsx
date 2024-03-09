import React, { useState, useEffect } from 'react';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import { toast, ToastContainer } from 'react-toastify';


interface Location {
    id: string;
    date: string;
    location: string;
    image: string;
    url: string;
    title: string;
    description: string;
    coordinates: string;
    riddle: string;
}

const Play: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [playerId, setPlayerId] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // New function to print current location to the console for testing purposes remove later
    const printCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log(`Current Position: Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch('http://localhost:5164/api/locations');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLocations(data);
                printCurrentLocation();
            } catch (error) {
                console.error('Failed to fetch location:', error);
                toast.error('Failed to fetch locations');
            }
        };

        fetchLocations();
    }, []);

    const handleSolveRiddle = async () => {
        console.log("Submit Answer Clicked");
        if (!playerId) {
            console.log("No player ID entered");
            toast.error('Please enter your playerID');
            return;
        }

        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const playerDataResponse = await fetch(`http://localhost:5164/api/Player/retrieveID?playerID=${playerId}`);
                if (!playerDataResponse.ok) throw new Error('Failed to fetch player data');
                const playerData = await playerDataResponse.json();

                if (playerData.playerId === playerId && selectedLocation) {
                    // No longer need to check if selectedLocation is not null here
                    const proximityThreshold = 0.01; // Example threshold for "closeness", adjust as needed
                    const targetCoordinates = selectedLocation.coordinates.split(', ').map(Number);
                    const distanceLat = Math.abs(latitude - targetCoordinates[0]);
                    const distanceLon = Math.abs(longitude - targetCoordinates[1]);

                    if (distanceLat <= proximityThreshold && distanceLon <= proximityThreshold) {
                        toast.success('Correct Location! Points added.');
                        // Logic to add a point to the player's data here
                    } else {
                        toast.error('Incorrect Location! Try again.');
                    }
                } else {
                    toast.error('Player does not exist or no location selected');
                }
            } catch (error) {
                console.error('Failed to solve riddle:', error);
                toast.error('Failed to solve riddle');
            }
        }, (error) => {
            toast.error(`Geolocation error: ${error.message}`);
        });
    };

    const handleOpenModal = (id: string) => {
        const foundLocation = locations.find(loc => loc.id === id);
        setSelectedLocation(foundLocation || null);
        setShowModal(true);
    };


        return (
            <>
                <Header />
                <div className="container-margin-top">
                    <h5>Play</h5>
                    <p>Travel to the first location and explore the area. Unlock clues
                        and solve puzzles to find the next location. Share your journey
                        with us and the community by tagging your discoveries on social
                        media.</p>



                    {locations.length > 0 ? (
                        <div className="row"> {/* Use row here to utilize your CSS for layout */}
                            {locations.map(locations => (
                                <div className="card text-center" key={locations.id}>
                                    <div className="card-header">Explore Location: {locations.title}</div>
                                    <img src={locations.image} className="card-img-top" alt={locations.title} />

                                    <div className="card-body">
                                        <button onClick={() => handleOpenModal(locations.id)} className="btn btn-primary">
                                            Solve Riddle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Loading location...</p>
                    )}
                    {showModal && selectedLocation && (
                        <div className="modal">
                            <div className="modal-content">
                                {/* Including location information in the modal */}
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">Riddle for first location</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModal(false)}></button>
                                </div>


                                {/* Example: Assuming your location object has a 'riddle' property */}
                                <div>
                                    {selectedLocation?.riddle.split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                                <br />
                                
                                <h3>Enter your playerID</h3>
                                <input
                                    type="text"
                                    placeholder="Enter your playerID"
                                    value={playerId}
                                    onChange={(e) => setPlayerId(e.target.value)}
                                />
                                <br />

                                <button onClick={handleSolveRiddle} className="btn btn-success">
                                    Submit Answer
                                </button>
                                
                            </div>
                        </div>


                    )}

                </div>
                <ToastContainer />
                <Footer />
            </>
        );
    };

export default Play;
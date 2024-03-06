import { useEffect, useState } from 'react';

interface Location {
    header: string;
    URL: string;
    title: string;
    description: string;
    linkUrl: string;
    // include other properties as needed
}

function Card() {
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        // Fetch the locations from your API
        const fetchLocations = async () => {
            const response = await fetch('http://localhost:5164/locations'); // Use the correct backend URL
            if (response.ok) {
                const data = await response.json();
                setLocations(data);
            } else {
                // Handle HTTP errors
                console.error('Failed to fetch locations:', response.statusText);
            }
        };

        fetchLocations();
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div className="container">
            {locations.map((location, index) => (
                <div key={index} className="card" style={{ height: '32rem', width: '16rem' }}>
                    <div className="card-header">{location.header}</div>
                    <img src={location.URL} className="card-img-top" alt={location.title} />
                    <div className="card-body">
                        <h5 className="card-title">{location.title}</h5>
                        <p className="card-text">{location.description}</p>
                        <a href={location.linkUrl} className="btn btn-primary">Go somewhere</a>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Card; // Ensure this matches the name of your component

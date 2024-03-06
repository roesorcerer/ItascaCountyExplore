import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import slider1 from '../assets/imgs/slider/slider1.jpg';
import slider2 from '../assets/imgs/slider/slider2.jpg';
import slider3 from '../assets/imgs/slider/slider3.jpg';


interface Update {
    updateNumber: number;
    date: string;
    locationUpdate: string;
    leaderboardUpdate: string;

}

const LatestUpdatesAccordion = () => {
    const [updates, setUpdates] = useState<Update[]>([]);

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const response = await fetch('http://localhost:5164/api/updates');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setUpdates(data);
            } catch (error) {
                console.error('Failed to fetch updates:', error);
            }
        };
        fetchUpdates();
    }, []);
    // Slide settings
      const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: true,
                    },
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    },
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    },
                },
            ],
        };


    const images = [slider1, slider2, slider3]; // Array of images for rotation


    return (
        <section className="slider mt-5">
            <div className="container-fluid">
                <div className="columns is-gapless">
                    <div className="column is-12 slider-wrap slick-initialized slick-slider slick-dotted">
                        <button className="slick-prev slick-arrow" aria-label="Previous" type="button" style={{ display: 'block' }}> </button>
                        <div className="slick-list draggable">
       
                            <Slider {...settings}>
                                {updates.slice(0, 6).map((update, index) => (
                    <div key={index} className="slider-item">
                        <div className="slider-item-content">
                            <div className="post-thumb mb-5">
                                                <img src={images[index % images.length]} alt={`Update ${update.updateNumber}`} />
                            </div>
                            <div className="slider-post-content">
                                <h3>{`Update ${update.updateNumber}`}</h3>
                                <p>{`Date: ${update.date}`}</p>
                                <p>{`Location: ${update.locationUpdate}`}</p>
                                <p>{`Leaderboard: ${update.leaderboardUpdate}`}</p>
                            </div>
                        </div>
                    </div>                   
                ))}
                            </Slider>
                    </div>
                        </div>
                    </div>
                
            </div>
        </section>
    );
};

export default LatestUpdatesAccordion;

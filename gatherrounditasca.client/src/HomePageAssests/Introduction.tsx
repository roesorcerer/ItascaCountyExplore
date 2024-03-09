import infoIcon from '..//assets/imgs/fashion/img-1.jpg';
import infoIcon2 from '..//assets/imgs/fashion/img-2.jpg';
import infoIcon3 from '..//assets/imgs/fashion/img-3.jpg';
import { Link } from 'react-router-dom';
import titleImg from '../assets/imgs/homepage/oldcentralschool-inside.jpg';


const Introduction = () => {
    { /* Images and text for the quick information section. This is for the middle section images and inforamtion iteration */ }
    const images = [
        {
            src: infoIcon, className: "center-img", text: "Create a PlayerID", title: "Go on a new kind of adventure",
            detail: "Start by answering a few simple questions. These questions will help generate you a unique number to play so you are able to track your progress." },
        {
            src: infoIcon2, className: "left-img", text: "Search through Locations", title: "Search through Locations",
            detail: "Look through the locations and see if you can identify any local spots. See if you can guess the location."
},
        {
            src: infoIcon3, className: "right-img", text: "Make your guess!", title: "Go out and Explore!",
            detail: "Take it one guess at a time, or just spend the day seeing how much you know about your time. Climb the ranks and find the locations."
}
    ];

    return (
        <>
            {/* Section for Banner Image and Title. A quick introduction to the game. */}
            <section className="banner">
                <div className="container">
                    {/*Header of the Home Page with quick PlayNow button and a brief introduction to the game.*/}           
                    <div className="banner-img" style={{ backgroundImage: `url(${titleImg})` }}>
                    </div>
                    {/* Image Credit */}
                    <div className="image-credit">
                        Image by <a href="https://www.flickr.com/photos/peterjsieger/8155619634/in/photostream/" target="_blank" rel="noopener noreferrer">Peter Sieger</a> on Flickr
                    </div>

                    {/* Banner Box with quick information and a button to sign up. */} 
                    <div className="columns">
                            <div className="column is-12">
                            <div className="banner-box has-text-centered"> 
                            <div className="meta-cat">
                                <span className="is-capitalize letter-spacing-1 cat-name font-extra text-color">Explore and Discover Your Local Community</span>
                                </div>
                                <div className="post-title">
                                    <Link to="/about"><h2>Sign up now</h2></Link></div>
                                <div className="post-content">
                                    <strong>Travel Through Grand Rapids and see what little gems it has to offer.</strong>
                                    <p>Take the limited chance to participate and learn about the area around you in a new and fun way.</p>
                                    <Link to="/play" className="btn btn-grey mt-4">Play Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
</section>
            {/* Section for quick information on how the game works. */}            
            <section className="section-padding pt-4">
                <div className="container">
                    {images.map((image, index) => (
                        <div key={index} className="columns is-desktop">
                            <div className="column is-5-desktop">
                                {/* Center of the page with Images and quick information on how to sign up */} 
                                <div className={`image-container ${image.className}`} style={{ backgroundImage: `url(${image.src})` }}>
                                    <div className="text-over-image">
                                        <span className="letter-spacing cat-name font-extra text-color">{image.text}</span>
                                        <h3 className="post-title mt-2">{image.title}</h3>
                                        <p>{image.detail}</p>
                                    </div>
                                </div>  
                                </div>
                         </div>
                    ))}
                </div>
            </section>
      
        </>
    );
};

export default Introduction;
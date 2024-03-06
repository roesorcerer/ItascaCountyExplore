import infoIcon from '..//assets/imgs/fashion/img-1.jpg';
import infoIcon2 from '..//assets/imgs/fashion/img-2.jpg';
import infoIcon3 from '..//assets/imgs/fashion/img-3.jpg';
import { Link } from 'react-router-dom';
import logo from '../assets/imgs/fashion/bannertempschoolhouse.jpg';


const Introduction = () => {
    const images = [
        { src: infoIcon, className: "center-img" },
        { src: infoIcon2, className: "left-img" },
        { src: infoIcon3, className: "right-img" }
    ];

    return (
        <>
            {/* Section for Banner Image and Title. A quick introduction to the game. */}
            <section className="banner">
            <div className="container"> 
                    <div className="banner-img" style={{ backgroundImage: `url(${logo})` }}>
                        </div>
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
            {/* Section for quick information. */}

            <section className="section-padding pt-4">
                <div className="container">
                    {images.map((image, index) => (
                        <div key={index} className="columns is-desktop">
                            <div className="column is-5-desktop">
                                <div className={`image-container ${image.className}`} style={{ backgroundImage: `url(${image.src})` }}></div>
                            </div>
                            <div className="column is-7-desktop">
                                <div className="post-article">
                                    <span className="letter-spacing cat-name font-extra text-color">Create a PlayerID</span>
                                    <h3 className="post-title mt-2">Find New Areas Or Visit Local Favorites</h3>
                                    <p>Stay up-to-date with the latest happenings in the community.</p>
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
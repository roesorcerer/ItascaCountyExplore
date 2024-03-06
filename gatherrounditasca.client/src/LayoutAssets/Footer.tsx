
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // You need to install react-icons for this to work

const Footer = () => {
    const handleLoginClick = () => {
        // Logic to handle admin login, possibly show a login modal or redirect to a login page
        console.log('Admin login clicked');
    };

    return (
        
        <footer className="footer-section mt-0 bg-grey">
                <div className="container">
            <div className="colmns is-multiline">
                <div className="social-media">
                    <span>Share your results:</span>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                div</div>
                <div className="admin-login" onClick={handleLoginClick}>
                    <a href="#login" className="login-link">Admin</a>
                </div></div>
            </div>
            </footer>


    );
};

export default Footer;


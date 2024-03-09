import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // You need to install react-icons for this to work

const Footer = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        // Logic to handle admin login, possibly show a login modal or redirect to a login page
        console.log('Admin login clicked');
        navigate('/login');
    };

    return (
        <section className="footer-2 section-padding gray-bg pb-5">
            <div className="container footer-container">
                {/* Widget at the top */}
                <div className="widget footer-widget mb-6">
                    <h3 className="widget-title">Remember to be respectful of the areas you visit.</h3>
                    <p>So others can enjoy each site as much as you.</p>
                </div>           
                {/* Horizontal line for separation */}
                <hr className="footer-divider" />

                {/* Social and navigation links */}
                <div className="footer-links">
                    <ul className="list-inline footer-socials-2 has-text-centered mb-0">
                        <li className="list-inline-item"><a href="/">Home</a></li>
                        <li className="list-inline-item"><a href="/about">About</a></li>
                        <li className="list-inline-item"><a href="/join">Join</a></li>
                        <li className="list-inline-item"><a href="/play">Play</a></li>
                    </ul>
                </div>

                {/* Admin login link, hidden on the bottom right */}
                <div className="admin-login" onClick={handleLoginClick}>
                    <a href="#login" className="login-link">Admin</a>
                </div>
            </div>
        </section>
);
               
};

export default Footer;


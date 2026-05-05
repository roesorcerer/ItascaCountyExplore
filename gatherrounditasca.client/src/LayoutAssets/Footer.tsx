import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const year = new Date().getFullYear();

    return (
        <footer className="it-footer it-scope">
            <div className="it-footer__inner">
                <div className="it-footer__about">
                    <h5>Itasca Trails</h5>
                    <p>
                        A community scavenger hunt for Grand Rapids and the trails of Itasca County.
                        Get out, explore, and learn what makes this corner of Minnesota special — and please leave each spot
                        as beautiful as you found it.
                    </p>
                </div>

                <div>
                    <h5>Play</h5>
                    <ul>
                        <li><Link to="/join">Get a Player ID</Link></li>
                        <li><Link to="/play">Browse trails</Link></li>
                        <li><Link to="/leaderboard">Leaderboard</Link></li>
                    </ul>
                </div>

                <div>
                    <h5>About</h5>
                    <ul>
                        <li><Link to="/about">How it works</Link></li>
                        <li><Link to="/about">Trail etiquette</Link></li>
                    </ul>
                </div>
            </div>

            <div className="it-footer__bottom">
                <span>&copy; {year} Itasca Trails. Walk softly.</span>
                <button type="button" className="it-footer__admin" onClick={() => navigate('/login')}>
                    Admin
                </button>
            </div>
        </footer>
    );
};

export default Footer;

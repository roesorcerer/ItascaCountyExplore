

import About from '../Pages/About.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "../HomePageAssests/HomePage.js";
import Join from '../Pages/Join.js';
import Play from '../Pages/Play.js';
import Leaderboard from '../Pages/Leaderboard.js';


function Layout() {
    return (
        <>
            <Router>
            
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/join" element={<Join />} />
                        <Route path="/play" element={<Play />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                    </Routes>          

            
                
            
        </Router >
        </>
    );
}

export default Layout;
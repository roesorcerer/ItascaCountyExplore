// HomePage.js
import * as React from 'react';
import Header from '../LayoutAssets/Header';
import Introduction from './Introduction';
import LastestUpdates from './LastestUpdates';
import Footer from '../LayoutAssets/Footer';


const HomePage: React.FC = () => {
    return (
        <div className="d-flex flex-column">
            <Header />
            <Introduction />
            <LastestUpdates />
            <Footer />
        </div>
    );
}

export default HomePage;
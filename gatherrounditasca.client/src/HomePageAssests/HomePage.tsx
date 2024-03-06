// HomePage.js
import * as React from 'react';
import Introduction from './Introduction';
import HowParticipate from './HowParticipate';
import LastestUpdates from './LastestUpdates';
import Footer from '../LayoutAssets/Footer';
import Header from '../LayoutAssets/Header';

const HomePage: React.FC = () => {
    return (
        <div>
            <Header />
            <Introduction />
            <HowParticipate />
            <LastestUpdates />
            <Footer />
        </div>
    );
}

export default HomePage;
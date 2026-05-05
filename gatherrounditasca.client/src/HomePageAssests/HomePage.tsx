import * as React from 'react';
import Header from '../LayoutAssets/Header';
import Introduction from './Introduction';
import Footer from '../LayoutAssets/Footer';

const HomePage: React.FC = () => {
    return (
        <>
            <Header />
            <Introduction />
            <Footer />
        </>
    );
};

export default HomePage;

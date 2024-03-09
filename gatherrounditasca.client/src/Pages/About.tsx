import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';
import FAQ from '../LayoutAssets/HowParticipate';

const About = () => {
    return (
        <>
            <Header />
        <div className="breadcrumb-wrapper">
            <div className="container">
        <div className="columns">
                        <h2 className="lg-title">About the Community Scavenger Hunt</h2>
                    </div>
                </div>
                <div className="pt-5 padding-bottom">
                <div className="container">
            <p>Welcome to Explore Itasca! A new way to engage with your community through the view of others and notice the beauty around you. Every location is a free and accessible location within the county we live in. Through technology I hope to showcase some of the beauty of this little gem we all live in. </p>
            <p>If you are looking for an excuse to get out of the house, let's get up and go! Have an adventure with your community in a free and innovative way that brings us all together. Share your expierences on social media. </p>
            <p>Here's how you can participate:</p>
            <ul>
                <li>Sign up on our website and start the hunt at any time.</li>
                <li>Use the clues provided to find specific locations within the community.</li>
                <li>At each location, you'll solve puzzles or complete tasks to find the next clue.</li>
                <li>Share your journey with us and the community by tagging your discoveries on social media.</li>
            </ul>
            <p>We believe that the Community Scavenger Hunt is more than just a game; it's a way to connect with your surroundings and the people who share them. So, lace up your shoes, charge your phone, and get ready for an adventure that promises to be both fun and enlightening!</p>
                        <FAQ />
                    </div>
                </div>
            </div>
                   
                    
                
            
            
            <Footer />
        </>
    );
};

export default About;

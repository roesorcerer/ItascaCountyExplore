import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';

const About = () => {
    return (
        <>
        <Header />
        <div className="about-container">
            <h1>About the Community Scavenger Hunt</h1>
            <p>Welcome to our Community Scavenger Hunt, a thrilling adventure that invites you to explore the hidden gems and fascinating stories within your community. Our mission is to engage people of all ages in discovering the rich history, unique landmarks, and secret spots that make our area special.</p>
            <p>Through a series of carefully crafted riddles and challenges, participants will embark on a journey of discovery. Each riddle is designed not only to guide you to a specific location but also to share interesting facts and stories about the area. Whether you're a long-time resident or a new visitor, you'll find yourself seeing our community in a whole new light.</p>
            <p>Here's how you can participate:</p>
            <ul>
                <li>Sign up on our website and start the hunt at any time.</li>
                <li>Use the clues provided to find specific locations within the community.</li>
                <li>At each location, you'll solve puzzles or complete tasks to find the next clue.</li>
                <li>Share your journey with us and the community by tagging your discoveries on social media.</li>
            </ul>
            <p>We believe that the Community Scavenger Hunt is more than just a game; it's a way to connect with your surroundings and the people who share them. So, lace up your shoes, charge your phone, and get ready for an adventure that promises to be both fun and enlightening!</p>
            </div>
            <Footer />
        </>
    );
};

export default About;

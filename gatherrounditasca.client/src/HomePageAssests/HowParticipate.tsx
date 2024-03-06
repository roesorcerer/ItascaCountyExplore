import { useState, useRef, useEffect } from 'react';



const ParticipationAccordion = () => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null); // Use the generic parameter to specify the type
    const [contentHeight, setContentHeight] = useState(0);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        // Set the content height if the ref is not null
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [isOpen]);

    const contentStyle = isOpen ? {
        maxHeight: `${contentHeight}px`,
        transition: "max-height 0.6s ease"
    } : {
        maxHeight: "0",
        transition: "max-height 0.6s ease"
    };

    return (
        <div className="participation-accordion">
            <button className="accordion-button" onClick={toggleAccordion}>
                {isOpen ? 'Hide How to Participate' : 'Show How to Participate'}
            </button>
            <div className="accordion-content" style={contentStyle} ref={contentRef}>
                <h2>How to Participate in the Scavenger Hunt</h2>
                <p>To join the scavenger hunt, follow these simple steps:</p>
                <ol>
                    <li>Create a unique Exploration ID (EID) on our website.</li>
                    <li>Visit the first location and confirm your presence through your web browser.</li>
                    <li>Your EID will record your location data and present you with a riddle.</li>
                    <li>Solve the riddle to uncover your next destination.</li>
                    <li>Continue to solve riddles and explore locations to advance in the game!</li>
                </ol>
                <p>Embark on a thrilling quest to learn more about your community, solve challenging puzzles, and have fun!</p>
            </div>
        </div>
    );
};

export default ParticipationAccordion;
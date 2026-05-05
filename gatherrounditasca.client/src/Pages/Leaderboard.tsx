import * as React from 'react';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';

//create interface for leaderboard so I can set the state
interface Leaderboard {
    playerId: string;
    ranking: number;
    locationsVisited: number;

}

const Leaderboard: React.FC = () => {
    //set the state for the leaderboard
    const [leaderboard, setLeaderboard] = React.useState<Leaderboard[]>([]);

React.useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('http://localhost:5164/api/leaderboard');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLeaderboard(data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
        };

        fetchLeaderboard();
    }, []);
    return (
        <>
            <Header />
            <div className="container-fluid">
                <div className="columns is-desktop">
                    <div className="column is-8-desktop">
                        <div className="columns">
                            <div className="column is-12">
                                <article className="post">
                                    <div className="post-header mb-6 has-text-centered">
                                        <div className="meta-cat">
                                            <span className="post-category font-extra text-color is-uppercase font-sm letter-spacing-1">#Leaderboard</span>
                                        </div>
                                        <h1 className="post-title mt-2">Top Players</h1>
                                    </div>
                                </article>
                                <table className="table table-light table-striped table-hover table-bordered ">
                                    <thead>
                                        <tr>
                                            <th scope="col">PlayerID</th>
                                            <th scope="col">Locations Visited</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-group-divider">
                                        {leaderboard.map((entry) => (
                                            <tr key={entry.playerId}>
                                                <th scope="row">{entry.playerId}</th>
                                                <td>{entry.locationsVisited}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Leaderboard;

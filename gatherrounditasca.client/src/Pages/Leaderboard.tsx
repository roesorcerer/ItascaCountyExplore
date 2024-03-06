import * as React from 'react';
import Header from '../LayoutAssets/Header';
import Footer from '../LayoutAssets/Footer';

const Leaderboard: React.FC = () => {
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
                                        <tr>
                                            <th scope="row">1</th>
                                            <td>Mark</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">2</th>
                                            <td>Jacob</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">3</th>
                                            <td colSpan={2}>Larry the Bird</td>
                                        </tr>
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

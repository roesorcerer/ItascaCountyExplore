import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import logo from '../assets/imgs/header/logo-exploreitasca.png';


const Header: React.FC = () => {
    return (     
        <>
        {/* Header section */}
            <header className="header-custom">
            <div className="container">
                <div className="columns is-gapless">
                    <div className="column is-12">
                        <nav className="navbar navigation">                            
                                {/* Logo and title */} 
                                <Navbar.Brand  href="/">
                                        {/*Banner image style is in the css file*/}
                                    {/* Logo Container */}
                                    <div className="navbar-brand">
                                        <div className="logo-container">
                                            <img src={logo} alt="Logo" className="logo-img" />
                                        </div>
                                
                                        <span className="header-title">Itasca Explorers</span>
                                    </div>
                                </Navbar.Brand>
                                    {/* Burger menu */ }
                                    <span role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="menu1">
                                        <span aria-hidden="true"></span>
                                        <span aria-hidden="true"></span>
                                        <span aria-hidden="true"></span>
                                    </span>
                               
                                {/* Menu and navigation */}
                                {/* Menu starts here */} 
                                <nav id="menu1" className="navbar-menu">
                                    <div className="navbar-start">
                                        {/*Home Nav Menu Item */}
                                        <div className="navbar-item has-dropdown is-hoverable">                                            
                                        <Nav.Item>
                                                <NavLink to="/" className="navbar-link">Home</NavLink> 
                                            </Nav.Item>
                                        </div>
                                        {/*About Nav Menu Item */} 
                                        <div className="navbar-item has-dropdown is-hoverable">
                                        <Nav.Item>
                                        <NavLink to="/about" className="navbar-link">About</NavLink>  
                                            </Nav.Item>
                                    </div>
                                        {/*Join Nav Menu Item */}
                                        <div className="navbar-item has-dropdown is-hoverable">
                                        <Nav.Item>
                                        <NavLink to="/join" className="navbar-link">Join</NavLink>      
                                            </Nav.Item>
                                        </div>
                                            {/*Play Nav Menu Item */}
                                            <div className="navbar-item has-dropdown is-hoverable">
                                        <Nav.Item>
                                        <NavLink to="/play" className="navbar-link">Play</NavLink> 
                                            </Nav.Item>
                                        </div>
                                                {/*Leaderboard Nav Menu Item */}
                                                <div className="navbar-item has-dropdown is-hoverable">
                                                <Nav.Item>
                                                <NavLink to="/leaderboard" className="navbar-link">Leaderboard</NavLink>
                                            </Nav.Item>
                                        </div>


                                        {/* Add more Nav.Links or LinkContainer as needed */}

                                          
                                    
                                 
                                        {/* Add more Nav.Links or LinkContainer as needed */}
                                        <div className="navbar-end">
                                            <div className="navbar-item">
                                                <ul className="header-socials-2 list-inline">
                                                    <li className="list-inline-item"><a href="#"><i className="ti-facebook"></i></a></li>
                                                    <li className="list-inline-item"><a href="#"><i className="ti-twitter"></i></a></li>
                                                    <li className="list-inline-item"><a href="#"><i className="ti-linkedin"></i></a></li>
                                                    <li className="list-inline-item"><a href="#"><i className="ti-pinterest"></i></a></li>
                                                </ul>
                                            </div>
                                    
                                </div>
                            </div>
                                </nav>
                        </nav>
                    </div>
                </div>
            </div>
            </header >

</>
    );
};

              
                   
export default Header;

  
                           
{/* Menu and navigation  
                <div id="menu1" className="navbar-menu">
                       <Nav className="navbar-start">
                                    <LinkContainer className="navbar-item" to="/">
                                        <Nav.Link className="navbar-link">Home</Nav.Link>
                        </LinkContainer>
                                    <LinkContainer className="navbar-item" to="/about">
                                        <Nav.Link className="navbar-link">About
                                        </Nav.Link>
                                        </LinkContainer>
                                    <LinkContainer className="navbar-item" to="/join">
                                            <Nav.Link className="navbar-link">Join
                                            </Nav.Link>
                                        </LinkContainer>
                                    <LinkContainer className="navbar-item" to="/play">
                                        <Nav.Link className="navbar-link">Play</Nav.Link>
                        </LinkContainer>
                                    <LinkContainer className="navbar-item" to="/leaderboard">
                                        <Nav.Link className="navbar-link">Leaderboard</Nav.Link>
                        </LinkContainer>
                                     Add more Nav.Links or LinkContainer as needed 
                                    <div className="navbar-end">
                                        <div className="navbar-item">
                                            <ul className="header-socials-2 list-inline">
                                                <li className="list-inline-item"><a href="#"><i className="ti-facebook"></i></a></li>
                                                <li className="list-inline-item"><a href="#"><i className="ti-twitter"></i></a></li>
                                                <li className="list-inline-item"><a href="#"><i className="ti-linkedin"></i></a></li>
                                                <li className="list-inline-item"><a href="#"><i className="ti-pinterest"></i></a></li>
                                            </ul>
                                        </div>
                                    </div>
                    </Nav>
                    </div>
                            </nav>
    
            </div>
                    </div>
                </Container>
            </Navbar>
                            </div> 
                        </nav >
                        </div>
                    </div >

                </div>
</div>
            </header >
</>
    );
};


*/}
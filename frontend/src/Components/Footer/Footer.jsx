import React, { useState } from "react";
import "./Footer.css";
import axios from "axios";
import instagram from "../Assets/instagram.png";
import facebook from "../Assets/facebook.png";
import twitter from "../Assets/twitter.png";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [copySuccess, setCopySuccess] = useState('');
    const [subscribeMsg, setSubscribeMsg] = useState("");

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }).catch(() => {
            setCopySuccess('Failed to copy');
        });
    };

    const handleSubscribe = async () => {
        if (!email.trim()) {
            setSubscribeMsg("Please enter a valid email.");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/subscribers", { email });
            setSubscribeMsg("Subscribed successfully!");
            setEmail("");
        } catch (error) {
            if (error.response?.data?.message) {
                setSubscribeMsg(error.response.data.message);
            } else {
                setSubscribeMsg("Subscription failed. Try again.");
            }
        }

        setTimeout(() => setSubscribeMsg(""), 4000);
    };

    return (
        <footer className="footer">
            {/* Newsletter Section */}
            <div className="newsletter">
                <h2>Stay Updated!</h2>
                <p>Subscribe to our newsletter for exclusive offers and updates.</p>
                <div className="newsletter-form">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button onClick={handleSubscribe}>Subscribe</button>
                </div>
                {subscribeMsg && (
                    <p style={{ color: "#000", marginTop: "10px" }}>{subscribeMsg}</p>
                )}
            </div>

            {/* Footer Links Section */}
            <div className="footer-links">
                {/* Quick Links */}
                <div className="footer-column">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/skincare">Skincare</a></li>
                        <li><a href="/hair_body">Hair + Body</a></li>
                        <li><a href="/sets_collections">Sets & Collections</a></li>
                        <li><a href="/about">About</a></li>
                    </ul>
                </div>

                {/* Contact Us */}
                <div className="footer-column">
                    <h3>Contact Us</h3>
                    <p>
                        Email:<br />
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=asadebukhari04@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            asadebukhari04@gmail.com
                        </a>
                    </p>
                    <p>
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=faizaalamawarraich@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            faizaalamawarraich@gmail.com
                        </a>
                    </p>
                    <p
                        onClick={() => handleCopy("0300-5584987")}
                        style={{ cursor: "pointer", color: "white" }}
                        title="Click to copy"
                    >
                        Phone: 0300-5584987{" "}
                        {copySuccess && (
                            <span style={{ marginLeft: "10px", color: "green" }}>
                                {copySuccess}
                            </span>
                        )}
                    </p>
                </div>

                {/* Social Links */}
                <div className="footer-column">
                    <h3>Follow Us</h3>
                    <div className="social-icons">
                        <a
                            href="https://instagram.com/theordinary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={instagram} alt="Instagram" />
                        </a>
                        <a
                            href="https://facebook.com/theordinary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={facebook} alt="Facebook" />
                        </a>
                        <a
                            href="https://twitter.com/theordinary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={twitter} alt="Twitter" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} TheOrdinary. No rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

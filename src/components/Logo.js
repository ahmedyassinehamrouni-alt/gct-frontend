import React from 'react';
import icon from '../assets/logo-gct-icon.png';

function Logo() {
    return (
        <div className="gct-logo">
            <img src={icon} alt="" />
            <span className="gct-logo-text" aria-label="GCT">GCT</span>
        </div>
    );
}

export default Logo;

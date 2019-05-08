import React, { Component } from 'react';

import init from './WebGL/init';
import styles from './Tetrahedron.module.css';

class tetrahedron extends Component {
    state = {
        width: window.innerWidth / 3
    }

    componentDidMount() {
        init('tetra');
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillMount() {
        this.updateDimensions();
        init('tetra');
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions = () => {
        this.setState({width: window.innerWidth / 3});
    }

    render() {
        return (
            <div className={styles.wrapper}>
                <canvas id='tetra' width={this.state.width} height={this.state.width}></canvas>
            </div>
        );
    }
}

export default tetrahedron;

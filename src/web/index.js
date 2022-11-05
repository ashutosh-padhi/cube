import './assets/styles/style.scss';
import { appendTemplate } from '../WebUtils';
import { GetCube } from './Cube';
import React, { createRef, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import cubeImage from './assets/images/axis.png';

class Cube extends React.Component {
    constructor(props) {
        super(props);
        this.cubeRoot = createRef();
        this.player = null;
    }
    componentDidMount() {
        var { player } = GetCube(this.cubeRoot.current);
        this.player = player;
    }
    render() {
        return <div className="cube-root" ref={this.cubeRoot}></div>;
    }
}

function Footer() {
    return (
        <footer>
            <p>
                type <b>h</b> for help
            </p>
            <p>&copy; reserved with Ashutosh Padhi</p>
        </footer>
    );
}

function KeyButton(props) {
    return <span className="key-btn">{props.children}</span>;
}

function Help({ show }) {
    var keyDescTable = [
        { key: 'l', desc: 'left anti-clockwise' },
        { key: 'r', desc: 'right clockwise' },
        { key: 'u', desc: 'up clockwise' },
        { key: 'd', desc: 'down anti-clockwise' },
        { key: 'f', desc: 'front clockwise' },
        { key: 'b', desc: 'bottom anti-clockwise' },
        { key: 'L', desc: 'left clockwise' },
        { key: 'R', desc: 'right anti-clockwise' },
        { key: 'U', desc: 'up anti-clockwise' },
        { key: 'D', desc: 'down clockwise' },
        { key: 'F', desc: 'front clockwise' },
        { key: 'B', desc: 'bottom clockwise' },
    ];
    return (
        <>
            {show ? (
                <div
                    className="help-container"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: '30px',
                            justifyContent: 'center',
                        }}
                    >
                        <div>
                            <img
                                src={cubeImage}
                                alt={'rotation of the slices'}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    width: '500px',
                                    padding: '10px',
                                }}
                            ></img>
                        </div>
                        <div
                            style={{
                                color: 'white',
                                fontFamily: 'sans-serif',
                                marginLeft: '30px',
                                maxWidth: '400px',
                            }}
                        >
                            <p>
                                drag the cute to rotate, face of the cube can&apos;t be rotated with mouse. For that use
                                these below keyboard shortcuts.
                            </p>
                            <table>
                                {keyDescTable.map((desc) => (
                                    <tr>
                                        <td style={{ paddingRight: '10px' }}>
                                            <KeyButton>{desc.key}</KeyButton>
                                        </td>
                                        <td>{desc.desc}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ paddingRight: '10px' }}>
                                        <KeyButton>num</KeyButton> <KeyButton>key</KeyButton>
                                    </td>
                                    <td>
                                        a number can be prefixed to rotate any in between slice of the cube. e.g.{' '}
                                        <KeyButton>l</KeyButton> <KeyButton>l</KeyButton> will rotate the first slice
                                        after left face in anti-clockwise direction. For the case of a 3 x 3 cube it
                                        will be the middle face.
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

function App() {
    const cubeRef = useRef();
    const [help, setHelp] = useState(false);
    var handleKeyDown = function (e) {
        if (e.key.toLocaleLowerCase() === 'h') {
            setHelp((h) => !h);
            return;
        }
        if (cubeRef.current) cubeRef.current.player.play(e.key);
    };
    return (
        <>
            <div style={{ height: '100%', width: '100%' }} tabIndex={0} onKeyDown={handleKeyDown}>
                <Cube ref={cubeRef} />
            </div>
            <Help show={help} />
            <Footer />
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('cube'));
root.render(<App />);

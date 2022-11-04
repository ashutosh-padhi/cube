import './assets/styles/style.scss';
import { appendTemplate } from '../WebUtils';
import { GetCube } from './Cube';
import React, { createRef, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

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

function App() {
        const cubeRef = useRef();
        appendTemplate(require('./footer.pug')(), document.body);
        var helpNode = appendTemplate(require('./help.pug')(), document.body);
        var handleKeyDown = function (e) {
                if (e.key.toLocaleLowerCase() === 'h') {
                        if (helpNode.style.display === 'none') {
                                helpNode.style.display = 'flex';
                        } else {
                                helpNode.style.display = 'none';
                        }
                        return;
                }
                if (cubeRef.current) cubeRef.current.player.play(e.key);
        };
        return (
                <div style={{ height: '100%', width: '100%' }} tabIndex={0} onKeyDown={handleKeyDown}>
                        <Cube ref={cubeRef} />
                </div>
        );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

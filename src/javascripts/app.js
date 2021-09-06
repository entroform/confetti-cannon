import React, {
  useRef,
} from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  const canvasRef = useRef();
  return (
    <div>
      <button
        className="fire"
        type="button"
      >
        Fire!
      </button>
      <canvas ref={canvasRef} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));

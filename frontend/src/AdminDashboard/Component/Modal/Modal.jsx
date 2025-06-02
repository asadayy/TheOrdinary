import './Modal.css';

function Modal({ title, children, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <div className="modal-body">{children}</div>
                <button className="close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default Modal;
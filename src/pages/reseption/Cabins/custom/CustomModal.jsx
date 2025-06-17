import React, { useEffect, useRef } from "react";
import "./style.css";

const CustomModal = ({
    visible,
    title,
    content,
    onOk,
    onCancel,
    okText = "OK",
    cancelText = "Cancel",
    okLoading = false,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (visible && modalRef.current) {
            modalRef.current.focus();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <div className="custom-modal-overlay" >
            <div className="custom-modals" ref={modalRef} tabIndex={-1}>
                <div className="custom-modal-header" >
                    <h2> {title}</h2>
                </div>
                <div className="custom-modalcontent" >
                    <p> {content}</p>
                </div>
                <div className="custom-modal-footer" >
                    <button className="custom-modal-button custom-modal-cancel"
                        onClick={onCancel}
                        disabled={okLoading}
                    >
                        {cancelText}
                    </button>
                    <button className="custom-modal-button custom-modal-ok"
                        onClick={onOk}
                        disabled={okLoading}
                    >
                        {okLoading ? "Yuklanmoqda..." : okText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;
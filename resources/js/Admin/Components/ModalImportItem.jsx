import React, { useRef, useState } from "react";
import axios from "axios";
import Modal from "../../Components/Adminto/Modal";
import ItemsRest from "../../Actions/Admin/ItemsRest";
import { toast } from "sonner";
const itemsRest = new ItemsRest();

const ModalImportItem = ({ gridRef, modalRef }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Por favor, selecciona un archivo.");
            setIsError(true);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        try {
            const result = await itemsRest.importData(formData);
            console.log(result);

            if (result.error) {
                const errors = Array.isArray(result.error)
                    ? result.error.join("\n")
                    : result.error;

                setMessage(`Error en la importación:\n${errors}`);
                setIsError(true);
            } else {
                setMessage(result.message);
                setIsError(false);
                $(gridRef.current).dxDataGrid("instance").refresh();
                // Cerrar el modal si la importación es exitosa
                $(modalRef.current).modal('hide');

                toast.success("Importacion completada con exito", {
                    description: 'Todos tus productos han sido importados correctamente.',
                    duration: 3000,
                    position: "bottom-center",
                    richColors:true
                });

                // if (modalRef.current) {
                //     modalRef.current.close();
                // }
            }
        } catch (error) {
            setMessage(
                "Error al importar: " +
                    (error.response?.data?.error || error.message)
            );
            setIsError(true);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white">
            <div className="modal-content">
                <div className="mb-1"><a href="/assets/img/salafabulosa/formato_import_products.xlsx" download>Descargar formato .xlsx</a></div>
                <div>
                    <input
                        className="form-control"
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileChange}
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="btn btn-primary mt-2"
                    type="button"
                >
                    {loading ? "Subiendo..." : "Subir Archivo"}
                </button>

                {message && (
                    <div
                        className={`alert ${
                            isError ? "alert-danger" : "alert-success"
                        } mt-2`}
                        role="alert"
                    >
                        <div className="alert-message">{message}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalImportItem;

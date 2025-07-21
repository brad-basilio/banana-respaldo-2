import React from "react";
import { Editor } from '@tinymce/tinymce-react';

const TinyMCEFormGroup = ({ label, value, onChange, height = 400, variables = [] }) => (
    <div className="mb-2">
        <label className="form-label">{label}</label>
        <Editor
            apiKey="xiambljzyxjms4y2148wtxxl05f7bcpyt5o949l0c78tfe7c"
            value={value}
            init={{
                height,
                plugins: [
                    'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
                    'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
                    'media', 'table', 'emoticons', 'help'
                ],
                toolbar:
                    'undo redo | formatselect | bold italic underline forecolor backcolor | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | link image media | ' +
                    'table tabledelete tableprops tablerowprops tablecellprops | ' +
                    'codesample code | removeformat | help',
                menubar: 'file edit view insert format tools table help',
                image_advtab: true,
                // Removed table_toolbar, as all table controls are now in the main toolbar and menubar
                image_title: true,
                relative_urls: false,
                remove_script_host: false,
                convert_urls: true,
                automatic_uploads: true,
                extended_valid_elements: 'img[data-src|src|alt|style|width|height|class]',
                images_upload_handler: function (blobInfo) {
                    const formData = new FormData();
                    formData.append('file', blobInfo.blob());
                    return fetch('/api/upload-image', {
                        method: 'POST',
                        body: formData,
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Error en la subida');
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data?.location) {
                                return data.location;
                            }
                            throw new Error('Respuesta inválida');
                        })
                        .catch(error => {
                            throw new Error('Error al subir la imagen: ' + error.message);
                        });
                },
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                setup: (editor) => {
                    // Limpia cualquier base (incluyendo dominios y /admin/) antes de variables o URLs absolutas en src y href
                    const cleanSrcHref = (html) => {
                        // Para src de imágenes (igual que antes)
                        html = html.replace(/src="[^"]*({{[^}]+}})"/g, 'src="$1"');
                        html = html.replace(/src="[^"]*(https?:\/\/[^"}]+)"/g, 'src="$1"');
                        // Para href de enlaces
                        html = html.replace(/href="[^"]*({{[^}]+}})"/g, 'href="$1"');
                        html = html.replace(/href="[^"]*(https?:\/\/[^"}]+)"/g, 'href="$1"');
                        return html;
                    };
                    editor.on('BeforeSetContent', function (e) {
                        if (e.content && typeof e.content === 'string') {
                            e.content = cleanSrcHref(e.content);
                        }
                    });
                    editor.on('PostProcess', function (e) {
                        if (e.content && typeof e.content === 'string') {
                            e.content = cleanSrcHref(e.content);
                        }
                    });
                }
            }}
            onEditorChange={onChange}
        />
        {variables && variables.length > 0 && (
            <div className="mt-1 small text-muted">
                Variables disponibles: {variables.map(v => <code key={v} className="me-1">{'{{' + v + '}}'}</code>)}
            </div>
        )}
    </div>
);

export default TinyMCEFormGroup;

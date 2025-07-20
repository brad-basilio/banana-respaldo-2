import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Cookies, JSON, Notify } from "sode-extend-react";
import CreateReactScript from "../Utils/CreateReactScript";
import InputFormGroup from "../Components/Adminto/form/InputFormGroup";
import BaseAdminto from "../Components/Adminto/Base";
import ProfileRest from "../Actions/Admin/ProfileRest";

const Profile = (props) => {
    const nameRef = useRef();
    const lastnameRef = useRef();

    const [session, setSession] = useState(props.session);

    const onFormSubmit = async (e) => {
        e.preventDefault();

        const request = {
            name: nameRef.current.value,
            lastname: lastnameRef.current.value,
        };

        const result = await ProfileRest.save(request);

        if (!result) return;

        const newSession = structuredClone(session);
        newSession.name = request.name;
        newSession.lastname = request.lastname;
        newSession.birthdate = request.birthdate;
        setSession(newSession);
        
        // Recargar la página para reflejar los cambios en todos los componentes
        setTimeout(() => {
            window.location.reload();
        }, 1000); // Esperar 1 segundo para que se vea la notificación de éxito
    };

    const onProfileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const { full, thumbnail, type, ok } = await File.compress(file);

            if (!ok)
                throw new Error(
                    "Ocurrio un error al comprimir la imagen. Intenta con otra."
                );

            const request = new FormData();
            request.append(
                "thumbnail",
                await File.fromURL(`data:${type};base64,${thumbnail}`)
            );
            request.append(
                "full",
                await File.fromURL(`data:${type};base64,${full}`)
            );

            const res = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "X-Xsrf-Token": decodeURIComponent(
                        Cookies.get("XSRF-TOKEN")
                    ),
                },
                body: request,
            });
            const data = JSON.parseable(await res.text());
            if (!res.ok)
                throw new Error(data?.message ?? "Ocurrio un error inesperado");

            const newSession = structuredClone(session);
            newSession.uuid = data.data.uuid; // Usar uuid en lugar de relative_id
            setSession(newSession);

            Notify.add({
                icon: "/assets/img/icon.svg",
                title: "Correcto",
                body: "La imagen de perfil se actualizo correctamente",
                type: "success",
            });
            
            // Recargar la página para reflejar los cambios en todos los componentes
            setTimeout(() => {
                window.location.reload();
            }, 1500); // Esperar 1.5 segundos para que se vea la notificación de éxito
        } catch (error) {
            Notify.add({
                icon: "/assets/img/icon.svg",
                title: "Error",
                body: error.message,
                type: "danger",
            });
        }
    };

    return (
        <div
            className="row justify-content-center align-items-center"
            style={{ height: "calc(100vh - 135px)" }}
        >
            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8 col-xs-12">
                <form className="card" onSubmit={onFormSubmit}>
                    <div className="card-header">
                        <h4 className="card-title mb-0">Perfil</h4>
                    </div>
                    <div className="card-body">
                        <Tippy content="Cambiar foto de perfil" arrow={true}>
                            <label
                                htmlFor="avatar"
                                className="rounded-circle mx-auto d-block"
                                style={{
                                    cursor: "pointer",
                                    width: "max-content",
                                }}
                            >
                                <input
                                    className="d-none"
                                    type="file"
                                    name="avatar"
                                    id="avatar"
                                    accept="image/*"
                                    onChange={onProfileChange}
                                />
                                <img
                                    className="avatar-xl rounded-circle"
                                    src={`/api/profile/${session.uuid}`}
                                    alt={`Perfil de ${session.name} ${session.lastname}`}
                                    style={{
                                        objectFit: "cover",
                                        objectPosition: "center",
                                    }}
                                    onError={(e) =>
                                        (e.target.src =
                                            "/api/cover/thumbnail/null")
                                    }
                                />
                            </label>
                        </Tippy>
                        <hr className="mt-3 mb-2" />
                        <InputFormGroup
                            eRef={nameRef}
                            label="Nombres"
                            value={session.name}
                            required
                        />
                        <InputFormGroup
                            eRef={lastnameRef}
                            label="Apellidos"
                            value={session.lastname}
                            required
                        />
                        <div className="text-center">
                            <button
                                className="btn btn-primary btn-block"
                                type="submit"
                            >
                                <i className="fa fa-save"></i> Actualizar
                            </button>
                        </div>
                        <hr className="mt-3 mb-2" />
                        <p className="card-text text-center">
                            <small className="text-muted">
                                Ultima actualizacion{" "}
                                {moment(session.updated_at).fromNow()}
                            </small>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

CreateReactScript((el, properties) => {
    createRoot(el).render(
        <BaseAdminto {...properties} title="Perfil de usuario">
            <Profile {...properties} />
        </BaseAdminto>
    );
});

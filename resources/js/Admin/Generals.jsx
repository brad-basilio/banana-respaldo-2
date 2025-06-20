import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Asume que tienes un servicio para guardar los datos
import BaseAdminto from "../Components/Adminto/Base";
import GeneralsRest from "../Actions/Admin/GeneralsRest";
import CreateReactScript from "../Utils/CreateReactScript";
import { createRoot } from "react-dom/client";
import QuillFormGroup from "../Components/Adminto/form/QuillFormGroup";
import TinyMCEFormGroup from "../Components/Adminto/form/TinyMCEFormGroup";
import Global from "../Utils/Global";
import GalleryRest from "../Actions/Admin/GalleryRest";
import Tippy from "@tippyjs/react";
import TextareaFormGroup from "../Components/Adminto/form/TextareaFormGroup";

const generalsRest = new GeneralsRest();
const galleryRest = new GalleryRest();

const Generals = ({ generals }) => {
  const location =
    generals.find((x) => x.correlative == "location")?.description ?? "0,0";

  // First add these to your formData state
  // Filtrar solo los generales que son plantillas de email (excluyendo correo de soporte)
  const emailTemplates = generals.filter(g => g.correlative.endsWith('_email') && g.correlative !== 'support_email'&& g.correlative !== 'coorporative_email');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEmailCorrelative, setSelectedEmailCorrelative] = useState(emailTemplates[0]?.correlative || "");
  const [templateVariables, setTemplateVariables] = useState({});
  const [loadingVars, setLoadingVars] = useState(false);
  const [varsError, setVarsError] = useState(null);
  // Fetch variables for selected template
  useEffect(() => {
    if (!selectedEmailCorrelative) return;
    // Map correlatives to API types
    const correlativeToType = {
      purchase_summary_email: "purchase_summary",
      order_status_changed_email: "order_status_changed",
      blog_published_email: "blog_published",
      claim_email: "claim",
      password_changed_email: "password_changed",
      reset_password_email: "password_reset",
      subscription_email: "subscription",
      verify_account_email: "verify_account",
    };
    const type = correlativeToType[selectedEmailCorrelative];
    if (!type) {
      setTemplateVariables({});
      return;
    }
    setLoadingVars(true);
    setVarsError(null);
    fetch(`/api/notification-variables/${type}`)
      .then(res => res.json())
      .then(data => {
        setTemplateVariables(data.variables || {});
        setLoadingVars(false);
      })
      .catch(err => {
        setVarsError("No se pudieron cargar las variables.");
        setLoadingVars(false);
      });
  }, [selectedEmailCorrelative]);
  const [formData, setFormData] = useState({
    email_templates: Object.fromEntries(
      emailTemplates.map(t => [t.correlative, t.description ?? ""])
    ),
    phones: generals
      .find((x) => x.correlative == "phone_contact")
      ?.description?.split(",")
      ?.map((x) => x.trim()) ?? [""],
    emails: generals
      .find((x) => x.correlative == "email_contact")
      ?.description?.split(",")
      ?.map((x) => x.trim()) ?? [""],
    cintillo:
      generals.find((x) => x.correlative == "cintillo")?.description ??
      "",
    copyright:
      generals.find((x) => x.correlative == "copyright")?.description ??
      "",
    address:
      generals.find((x) => x.correlative == "address")?.description ?? "",
    openingHours:
      generals.find((x) => x.correlative == "opening_hours")
        ?.description ?? "",
    supportPhone:
      generals.find((x) => x.correlative == "support_phone")
        ?.description ?? "",
    supportEmail:
      generals.find((x) => x.correlative == "support_email")
        ?.description ?? "",
    coorporativeEmail:
      generals.find((x) => x.correlative == "coorporative_email")
        ?.description ?? "",
    privacyPolicy:
      generals.find((x) => x.correlative == "privacy_policy")
        ?.description ?? "",
    termsConditions:
      generals.find((x) => x.correlative == "terms_conditions")
        ?.description ?? "",
    deliveryPolicy:
      generals.find((x) => x.correlative == "delivery_policy")
        ?.description ?? "",
    salebackPolicy:
      generals.find((x) => x.correlative == "saleback_policy")
        ?.description ?? "",
    phoneWhatsapp:
      generals.find((x) => x.correlative == "phone_whatsapp")
        ?.description ?? "",
    messageWhatsapp:
      generals.find((x) => x.correlative == "message_whatsapp")
        ?.description ?? "",
    igvCheckout:
      generals.find((x) => x.correlative == "igv_checkout")
        ?.description ?? "",
    shippingFree:
      generals.find((x) => x.correlative == "shipping_free")
        ?.description ?? "",
    location: {
      lat: Number(location.split(",").map((x) => x.trim())[0]),
      lng: Number(location.split(",").map((x) => x.trim())[1]),
    },
    checkout_culqi: generals.find(x => x.correlative == 'checkout_culqi')?.description ?? "",
    checkout_culqi_name: generals.find(x => x.correlative == 'checkout_culqi_name')?.description ?? "",
    checkout_culqi_public_key: generals.find(x => x.correlative == 'checkout_culqi_public_key')?.description ?? "",
    checkout_culqi_private_key: generals.find(x => x.correlative == 'checkout_culqi_private_key')?.description ?? "",
    checkout_mercadopago: generals.find(x => x.correlative == 'checkout_mercadopago')?.description ?? "",
    checkout_mercadopago_name: generals.find(x => x.correlative == 'checkout_mercadopago_name')?.description ?? "",
    checkout_mercadopago_public_key: generals.find(x => x.correlative == 'checkout_mercadopago_public_key')?.description ?? "",
    checkout_mercadopago_private_key: generals.find(x => x.correlative == 'checkout_mercadopago_private_key')?.description ?? "",
    checkout_dwallet: generals.find(x => x.correlative == 'checkout_dwallet')?.description ?? "",
    checkout_dwallet_qr: generals.find(x => x.correlative == 'checkout_dwallet_qr')?.description ?? "",
    checkout_dwallet_name: generals.find(x => x.correlative == 'checkout_dwallet_name')?.description ?? "",
    checkout_dwallet_description: generals.find(x => x.correlative == 'checkout_dwallet_description')?.description ?? "",
    checkout_transfer: generals.find(x => x.correlative == 'checkout_transfer')?.description?? "",
    checkout_transfer_cci: generals.find(x => x.correlative == 'checkout_transfer_cci')?.description?? "",
    checkout_transfer_name: generals.find(x => x.correlative == 'checkout_transfer_name')?.description?? "",
    checkout_transfer_description: generals.find(x => x.correlative == 'checkout_transfer_description')?.description?? "",
    transfer_accounts: generals.find(x => x.correlative == 'transfer_accounts')?.description 
    ? JSON.parse(generals.find(x => x.correlative == 'transfer_accounts')?.description)
    : [
        {
          image: null,
          cc: "",
          cci: "",
          name: "",
          description: ""
        }
      ],
    // Píxeles de tracking
    googleAnalyticsId:
      generals.find((x) => x.correlative == "google_analytics_id")
        ?.description ?? "",
    googleTagManagerId:
      generals.find((x) => x.correlative == "google_tag_manager_id")
        ?.description ?? "",
    facebookPixelId:
      generals.find((x) => x.correlative == "facebook_pixel_id")
        ?.description ?? "",
    googleAdsConversionId:
      generals.find((x) => x.correlative == "google_ads_conversion_id")
        ?.description ?? "",
    googleAdsConversionLabel:
      generals.find((x) => x.correlative == "google_ads_conversion_label")
        ?.description ?? "",
    tiktokPixelId:
      generals.find((x) => x.correlative == "tiktok_pixel_id")
        ?.description ?? "",
    hotjarId:
      generals.find((x) => x.correlative == "hotjar_id")
        ?.description ?? "",
    clarityId:
      generals.find((x) => x.correlative == "clarity_id")
        ?.description ?? "",
    linkedinInsightTag:
      generals.find((x) => x.correlative == "linkedin_insight_tag")
        ?.description ?? "",
    twitterPixelId:
      generals.find((x) => x.correlative == "twitter_pixel_id")
        ?.description ?? "",
    pinterestTagId:
      generals.find((x) => x.correlative == "pinterest_tag_id")
        ?.description ?? "",
    snapchatPixelId:
      generals.find((x) => x.correlative == "snapchat_pixel_id")
        ?.description ?? "",
    customHeadScripts:
      generals.find((x) => x.correlative == "custom_head_scripts")
        ?.description ?? "",
    customBodyScripts:
      generals.find((x) => x.correlative == "custom_body_scripts")
        ?.description ?? "",
  });

  const [activeTab, setActiveTab] = useState("general");

  const handleInputChange = (e, index, field) => {
    const { value } = e.target;
    const list = [...formData[field]];
    list[index] = value;
    setFormData((prevState) => ({
      ...prevState,
      [field]: list,
    }));
  };

  const handleAddField = (field) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: [...prevState[field], ""],
    }));
  };

  const handleRemoveField = (index, field) => {
    const list = [...formData[field]];
    list.splice(index, 1);
    setFormData((prevState) => ({
      ...prevState,
      [field]: list,
    }));
  };

  const handleMapClick = (event) => {
    setFormData((prevState) => ({
      ...prevState,
      location: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Guardar solo el template seleccionado
      await generalsRest.save([
        // Guardar solo el template seleccionado
        ...Object.keys(formData.email_templates).map(correlative => ({
          correlative,
          name: emailTemplates.find(t => t.correlative === correlative)?.name || correlative,
          description: formData.email_templates[correlative],
        })),
        {
          correlative: "phone_contact",
          name: "Teléfono de contacto",
          description: formData.phones.join(","),
        },
        {
          correlative: "email_contact",
          name: "Correo de contacto",
          description: formData.emails.join(","),
        },
        {
          correlative: "address",
          name: "Dirección",
          description: formData.address,
        },
        {
          correlative: "cintillo",
          name: "Cintillo",
          description: formData.cintillo,
        },
        {
          correlative: "copyright",
          name: "Copyright",
          description: formData.copyright,
        },
        {
          correlative: "opening_hours",
          name: "Horarios de atención",
          description: formData.openingHours,
        },
        {
          correlative: "support_phone",
          name: "Número de soporte",
          description: formData.supportPhone,
        },
        {
          correlative: "support_email",
          name: "Correo de soporte",
          description: formData.supportEmail,
        },
        {
          correlative: "coorporative_email",
          name: "Correo corporativo",
          description: formData.coorporativeEmail,
        },
        {
          correlative: "privacy_policy",
          name: "Política de privacidad",
          description: formData.privacyPolicy,
        },
        {
          correlative: "terms_conditions",
          name: "Términos y condiciones",
          description: formData.termsConditions,
        },
        {
          correlative: "delivery_policy",
          name: "Políticas de envío",
          description: formData.deliveryPolicy,
        },
        {
          correlative: "saleback_policy",
          name: "Políticas de devolucion y cambio",
          description: formData.salebackPolicy,
        },
        {
          correlative: "phone_whatsapp",
          name: "Número de Whatsapp",
          description: formData.phoneWhatsapp,
        },
        {
          correlative: "message_whatsapp",
          name: "Mensaje de Whatsapp",
          description: formData.messageWhatsapp,
        },
        {
          correlative: "igv_checkout",
          name: "IGV en el checkout",
          description: formData.igvCheckout,
        },
        {
          correlative: "checkout_culqi",
          name: "Habilitar Culqi",
          description: formData.checkout_culqi,
        },
        {
          correlative: 'checkout_culqi_name',
          name: 'Nombre de la cuenta de Culqi',
          description: formData.checkout_culqi_name,
        },
        {
          correlative: 'checkout_culqi_public_key',
          name: 'Llave pública de Culqi',
          description: formData.checkout_culqi_public_key,
        },
        {
          correlative: 'checkout_culqi_private_key',
          name: 'Llave privada de Culqi',
          description: formData.checkout_culqi_private_key,
        },
        {
          correlative: "checkout_mercadopago",
          name: "Habilitar Mercadopago",
          description: formData.checkout_mercadopago,
        },
        {
          correlative: 'checkout_mercadopago_name',
          name: 'Nombre de la cuenta de Mercadopago',
          description: formData.checkout_mercadopago_name,
        },
        {
          correlative: 'checkout_mercadopago_public_key',
          name: 'Llave pública de Mercadopago',
          description: formData.checkout_mercadopago_public_key,
        },
        {
          correlative: 'checkout_mercadopago_private_key',
          name: 'Llave privada de Mercadopago',
          description: formData.checkout_mercadopago_private_key,
        },
        {
          correlative: 'checkout_dwallet',
          name: 'Habilitar Yape/Plin',
          description: formData.checkout_dwallet,
        },
        {
          correlative: 'checkout_dwallet_qr',
          name: 'QR Yape/Plin',
          description: formData.checkout_dwallet_qr,
        },
        {
          correlative: 'checkout_dwallet_name',
          name: 'Título Yape/Plin',
          description: formData.checkout_dwallet_name,
        },
        {
          correlative: 'checkout_dwallet_description',
          name: 'Descripción Yape/Plin',
          description: formData.checkout_dwallet_description,
        },
        {
          correlative: 'checkout_transfer',
          name: 'Habilitar Transferencia',
          description: formData.checkout_transfer,
        },
        {
          correlative: "transfer_accounts",
          name: "Cuentas Bancarias para Transferencia",
          description: JSON.stringify(formData.transfer_accounts),
        },
        {
          correlative: 'checkout_transfer_cci',
          name: 'CCI Transferencia',
          description: formData.checkout_transfer_cci,
        },
        {
          correlative: 'checkout_transfer_name',
          name: 'Nombre Transferencia',
          description: formData.checkout_transfer_name,
        },
        {
          correlative: 'checkout_transfer_description',
          name: 'Descripción Transferencia',
          description: formData.checkout_transfer_description,
        },
        {
          correlative: "location",
          name: "Ubicación",
          description: `${formData.location.lat},${formData.location.lng}`,
        },
        {
          correlative: 'shipping_free',
          name: 'Envio gratis a partir de',
          description: formData.shippingFree,
        },
        // Píxeles de tracking
        {
          correlative: "google_analytics_id",
          name: "Google Analytics ID",
          description: formData.googleAnalyticsId,
        },
        {
          correlative: "google_tag_manager_id",
          name: "Google Tag Manager ID",
          description: formData.googleTagManagerId,
        },
        {
          correlative: "facebook_pixel_id",
          name: "Facebook Pixel ID",
          description: formData.facebookPixelId,
        },
        {
          correlative: "google_ads_conversion_id",
          name: "Google Ads Conversion ID",
          description: formData.googleAdsConversionId,
        },
        {
          correlative: "google_ads_conversion_label",
          name: "Google Ads Conversion Label",
          description: formData.googleAdsConversionLabel,
        },
        {
          correlative: "tiktok_pixel_id",
          name: "TikTok Pixel ID",
          description: formData.tiktokPixelId,
        },
        {
          correlative: "hotjar_id",
          name: "Hotjar ID",
          description: formData.hotjarId,
        },
        {
          correlative: "clarity_id",
          name: "Microsoft Clarity ID",
          description: formData.clarityId,
        },
        {
          correlative: "linkedin_insight_tag",
          name: "LinkedIn Insight Tag ID",
          description: formData.linkedinInsightTag,
        },
        {
          correlative: "twitter_pixel_id",
          name: "Twitter Pixel ID",
          description: formData.twitterPixelId,
        },
        {
          correlative: "pinterest_tag_id",
          name: "Pinterest Tag ID",
          description: formData.pinterestTagId,
        },
        {
          correlative: "snapchat_pixel_id",
          name: "Snapchat Pixel ID",
          description: formData.snapchatPixelId,
        },
        {
          correlative: "custom_head_scripts",
          name: "Scripts Personalizados (Head)",
          description: formData.customHeadScripts,
        },
        {
          correlative: "custom_body_scripts",
          name: "Scripts Personalizados (Body)",
          description: formData.customBodyScripts,
        },
      ]);
      // alert('Datos guardados exitosamente');
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      // alert('Error al guardar los datos');
    }
  };

  return (
    <div className="card">
      <form className="card-body" onSubmit={handleSubmit}>
        <ul className="nav nav-tabs" id="contactTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "general" ? "active" : ""
                }`}
              onClick={() => setActiveTab("general")}
              type="button"
              role="tab"
            >
              Configuración general
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "contact" ? "active" : ""
                }`}
              onClick={() => setActiveTab("contact")}
              type="button"
              role="tab"
            >
              Información de Contacto
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "checkout" ? "active" : ""
                }`}
              onClick={() => setActiveTab("checkout")}
              type="button"
              role="tab"
            >
              Métodos de Pago
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "policies" ? "active" : ""
                }`}
              onClick={() => setActiveTab("policies")}
              type="button"
              role="tab"
            >
              Políticas y Términos
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "location" ? "active" : ""
                }`}
              onClick={() => setActiveTab("location")}
              type="button"
              role="tab"
            >
              Ubicación
            </button>
          </li>

        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "email" ? "active" : ""}`}
            onClick={() => setActiveTab("email")}
            type="button"
            role="tab"
          >
            Email
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "shippingfree" ? "active" : ""}`}
            onClick={() => setActiveTab("shippingfree")}
            type="button"
            role="tab"
          >
            Envio Gratis
          </button>
        </li>
       
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "pixels" ? "active" : ""}`}
            onClick={() => setActiveTab("pixels")}
            type="button"
            role="tab"
          >
            Píxeles & Analytics
          </button>
        </li>
        </ul>

        <div className="tab-content" id="generalTabsContent">
          <div
            className={`tab-pane fade ${activeTab === "email" ? "show active" : ""}`}
            role="tabpanel"
          >
            <div className="mb-2">
              <label htmlFor="email_correlative" className="form-label">
                Tipo de Email
              </label>
              <select
                id="email_correlative"
                className="form-select mb-3"
                value={selectedEmailCorrelative}
                onChange={e => setSelectedEmailCorrelative(e.target.value)}
              >
                {emailTemplates.map(t => (
                  <option key={t.correlative} value={t.correlative}>{t.name || t.correlative}</option>
                ))}
              </select>
              <TinyMCEFormGroup
                label={
                  <>
                    Plantilla de Email (HTML seguro, variables: <code>{`{{variable}}`}</code>)
                    <small className="d-block text-muted">
                      No se permite código PHP ni Blade. Solo variables seguras.<br />
                      {loadingVars && <span>Cargando variables...</span>}
                      {varsError && <span className="text-danger">{varsError}</span>}
                      {!loadingVars && !varsError && (
                        <>
                          <b>Variables disponibles:</b>{" "}
                          {Object.keys(templateVariables).length === 0
                            ? <span>No hay variables para esta notificación.</span>
                            : Object.entries(templateVariables).map(([key, desc]) => (
                                <span key={key} style={{display:'inline-block', marginRight:8}}>
                                  <code>{`{{${key}}}`}</code> <span className="text-muted">({desc})</span>{" "}
                                </span>
                              ))
                          }
                        </>
                      )}
                    </small>
                  </>
                }
                value={formData.email_templates[selectedEmailCorrelative] || ""}
                onChange={content => setFormData({
                  ...formData,
                  email_templates: {
                    ...formData.email_templates,
                    [selectedEmailCorrelative]: content
                  }
                })}
              />
            </div>
          </div>
          <div
            className={`tab-pane fade ${activeTab === "general" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <div className="row">
              <div className="col-md-6 mb-2">
                <label htmlFor="cintillo" className="form-label">
                  Cintillo
                </label>
                <textarea
                  className="form-control"
                  id="cintillo"
                  value={formData.cintillo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cintillo: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="col-md-6 mb-2">
                <label htmlFor="copyright" className="form-label">
                  Copyright
                </label>
                <textarea
                  className="form-control"
                  id="copyright"
                  value={formData.copyright}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      copyright: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>
            <div className="mb-2">
              <label htmlFor="address" className="form-label">
                Dirección
              </label>
              <textarea
                className="form-control"
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
                required
              ></textarea>
            </div>
            <div className="mb-2">
              <TextareaFormGroup
                label="Horarios de atencion"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openingHours: e.target.value,
                  })
                }
                value={formData.openingHours}
                required
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="igvCheckout"
                className="form-label"
              >
                IGV
                <small className="d-block text-muted">Dejar en 0 si no se quiere mostrar</small>
              </label>
              <input
                type="number"
                step={0.01}
                className="form-control"
                id="igvCheckout"
                value={formData.igvCheckout}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    igvCheckout: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="tab-content" id="contactTabsContent">
          <div
            className={`tab-pane fade ${activeTab === "contact" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <div className="row mb-2">
              <div className="col-md-6">
                {formData.phones.map((phone, index) => (
                  <div
                    key={`phone-${index}`}
                    className="mb-3"
                  >
                    <label
                      htmlFor={`phone-${index}`}
                      className="form-label"
                    >
                      Teléfono {index + 1}
                    </label>
                    <div className="input-group">
                      <input
                        type="tel"
                        className="form-control"
                        id={`phone-${index}`}
                        value={phone}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            index,
                            "phones"
                          )
                        }
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() =>
                          handleRemoveField(
                            index,
                            "phones"
                          )
                        }
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => handleAddField("phones")}
                >
                  Agregar teléfono
                </button>
              </div>
              <div className="col-md-6">
                {formData.emails.map((email, index) => (
                  <div
                    key={`email-${index}`}
                    className="mb-3"
                  >
                    <label
                      htmlFor={`email-${index}`}
                      className="form-label"
                    >
                      Correo {index + 1}
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id={`email-${index}`}
                        value={email}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            index,
                            "emails"
                          )
                        }
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() =>
                          handleRemoveField(
                            index,
                            "emails"
                          )
                        }
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => handleAddField("emails")}
                >
                  Agregar correo
                </button>
              </div>
            </div>
            <div className="mb-2">
              <label
                htmlFor="supportPhone"
                className="form-label"
              >
                Número de soporte
              </label>
              <input
                type="tel"
                className="form-control"
                id="supportPhone"
                value={formData.supportPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supportPhone: e.target.value,
                  })
                }
                required
              />
            </div>
             <div className="mb-2">
              <label
                htmlFor="coorporativeEmail"
                className="form-label"
              >
                Correo corporativo
              </label>
              <input
                type="email"
                className="form-control"
                id="coorporativeEmail"
                value={formData.coorporativeEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coorporativeEmail: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="supportEmail"
                className="form-label"
              >
                Correo de soporte
              </label>
              <input
                type="email"
                className="form-control"
                id="supportEmail"
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supportEmail: e.target.value,
                  })
                }
                required
              />
            </div>
           
            <div className="mb-2">
              <label
                htmlFor="phoneWhatsapp"
                className="form-label"
              >
                Número de Whatsapp
              </label>
              <input
                type="tel"
                className="form-control"
                id="phoneWhatsapp"
                value={formData.phoneWhatsapp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phoneWhatsapp: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="messageWhatsapp"
                className="form-label"
              >
                Mensaje de Whatsapp
              </label>
              <input
                type="tel"
                className="form-control"
                id="messageWhatsapp"
                value={formData.messageWhatsapp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    messageWhatsapp: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div
            className={`tab-pane fade ${activeTab === "checkout" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <div className="row">
              <div className="col-sm-3">
                <div className="nav flex-column nav-pills nav-pills-tab" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                  <a className="nav-link active show mb-1" id="v-culqi-tab" data-bs-toggle="pill" href="#v-culqi" role="tab" aria-controls="v-culqi" aria-selected="true">
                    Culqi
                  </a>
                  <a className="nav-link mb-1" id="v-mercadopago-tab" data-bs-toggle="pill" href="#v-mercadopago" role="tab" aria-controls="v-mercadopago" aria-selected="false">
                    Mercado Pago
                  </a>
                  <a className="nav-link mb-1" id="v-digital-wallet-tab" data-bs-toggle="pill" href="#v-digital-wallet" role="tab" aria-controls="v-digital-wallet" aria-selected="false">
                    Yape / Plin
                  </a>
                  <a className="nav-link mb-1" id="v-transfer-tab" data-bs-toggle="pill" href="#v-transfer" role="tab" aria-controls="v-transfer" aria-selected="false">
                    Transferencia
                  </a>
                </div>
              </div>
              <div className="col-sm-9">
                <div className="tab-content pt-0">
                  <div className="tab-pane fade active show" id="v-culqi" role="tabpanel" aria-labelledby="v-culqi-tab">
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="checkout-culqi"
                          checked={formData.checkout_culqi == 'true'}
                          onChange={(e) => setFormData({ ...formData, checkout_culqi: String(e.target.checked) })}
                        />
                        <label className="form-check-label form-label" htmlFor="checkout-culqi">
                          Habilitar pago con Culqi
                          <small className="text-muted d-block">Al habilitar esta opción, permite pagos por Culqi </small>
                        </label>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Título del formulario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.checkout_culqi_name}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_culqi_name: e.target.value
                        })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Clave Pública</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.checkout_culqi_public_key}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_culqi_public_key: e.target.value
                        })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Clave Privada</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.checkout_culqi_private_key}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_culqi_private_key: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div className="tab-pane fade" id="v-mercadopago" role="tabpanel" aria-labelledby="v-mercadopago-tab">
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="checkout-mercadopago"
                          checked={formData.checkout_mercadopago == 'true'}
                          onChange={(e) => setFormData({ ...formData, checkout_mercadopago: String(e.target.checked) })}
                        />
                        <label className="form-check-label form-label" htmlFor="checkout-mercadopago">
                          Habilitar pago con Mercado Pago
                          <small className="text-muted d-block">Al habilitar esta opción, permite pagos por Mercado Pago </small>
                        </label>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Título del formulario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.checkout_mercadopago_name}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_mercadopago_name: e.target.value
                        })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Clave Pública</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.checkout_mercadopago_public_key}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_mercadopago_public_key: e.target.value
                        })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Clave Privada (Access Token)</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.checkout_mercadopago_private_key}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_mercadopago_private_key: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div className="tab-pane fade" id="v-digital-wallet" role="tabpanel" aria-labelledby="v-digital-wallet-tab">
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="checkout-dwallet"
                          checked={formData.checkout_dwallet == 'true'}
                          onChange={(e) => setFormData({ ...formData, checkout_dwallet: String(e.target.checked) })}
                        />
                        <label className="form-check-label form-label" htmlFor="checkout-dwallet">
                          Habilitar pago con Yape/Plin
                          <small className="text-muted d-block">Al habilitar esta opción, permite pagos por Yape/Plin </small>
                        </label>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">QR</label>
                      {
                        formData.checkout_dwallet_qr
                          ? <div className="position-relative">
                            <Tippy content="Eliminar QR">
                              <button className="position-absolute btn btn-xs btn-danger" style={{
                                top: '5px',
                                left: '5px'
                              }} onClick={() => setFormData({
                                ...formData,
                                checkout_dwallet_qr: null
                              })}>
                                <i className="mdi mdi-delete"></i>
                              </button>
                            </Tippy>
                            <img src={`/assets/resources/${formData.checkout_dwallet_qr}`} className="img-thumbnail" style={{
                              height: '200px',
                              width: 'auto'
                            }} />
                          </div>
                          : <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              e.target.value = null

                              const ext = file.name.split('.').pop()
                              const dwallet_name = `qr-digital-wallet.${ext}`

                              const request = new FormData()
                              request.append('image', file)
                              request.append('name', dwallet_name)

                              const result = await galleryRest.save(request)
                              if (!result) return;

                              setFormData({
                                ...formData,
                                checkout_dwallet_qr: dwallet_name
                              });
                            }}
                          />
                      }
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Título</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.checkout_dwallet_name}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_dwallet_name: e.target.value
                        })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        value={formData.checkout_dwallet_description}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_dwallet_description: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  {/* <div className="tab-pane fade" id="v-transfer" role="tabpanel" aria-labelledby="v-transfer-tab">
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="checkout-transfer"
                          checked={formData.checkout_transfer == 'true'}
                          onChange={(e) => setFormData({ ...formData, checkout_transfer: String(e.target.checked) })}
                        />
                        <label className="form-check-label form-label" htmlFor="checkout-transfer">
                          Habilitar pago por transferencia
                          <small className="text-muted d-block">Al habilitar esta opción, permite pagos por transferencia</small>
                        </label>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Código de Cuenta Interbancario (CCI)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.checkout_transfer_cci}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_transfer_cci: e.target.value
                        })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Título</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.checkout_transfer_name}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_transfer_name: e.target.value
                        })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        value={formData.checkout_transfer_description}
                        onChange={(e) => setFormData({
                          ...formData,
                          checkout_transfer_description: e.target.value
                        })}
                      />
                    </div>
                  </div> */}
                  <div className="tab-pane fade" id="v-transfer" role="tabpanel" aria-labelledby="v-transfer-tab">
                    <div className="mb-2">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="checkout-transfer"
                          checked={formData.checkout_transfer === 'true'}
                          onChange={(e) => setFormData({ ...formData, checkout_transfer: String(e.target.checked) })}
                        />
                        <label className="form-check-label form-label" htmlFor="checkout-transfer">
                          Habilitar pago por transferencia
                          <small className="text-muted d-block">Al habilitar esta opción, permite pagos por transferencia</small>
                        </label>
                      </div>
                    </div>

                    {formData.transfer_accounts.map((account, index) => (
                      <div key={index} className="mb-4 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5>Cuenta Bancaria #{index + 1}</h5>
                          {index > 0 && (
                            <button 
                              type="button" 
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                const accounts = [...formData.transfer_accounts];
                                accounts.splice(index, 1);
                                setFormData({...formData, transfer_accounts: accounts});
                              }}
                            >
                              Eliminar Cuenta
                            </button>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Imagen de la Cuenta</label>
                          {account.image ? (
                            <div className="position-relative">
                              <Tippy content="Eliminar Imagen">
                                <button 
                                  className="position-absolute btn btn-xs btn-danger" 
                                  style={{top: '5px', left: '5px'}} 
                                  onClick={() => {
                                    const accounts = [...formData.transfer_accounts];
                                    accounts[index].image = null;
                                    setFormData({...formData, transfer_accounts: accounts});
                                  }}
                                >
                                  <i className="mdi mdi-delete"></i>
                                </button>
                              </Tippy>
                              <img 
                                src={`/assets/resources/${account.image}`} 
                                className="img-thumbnail" 
                                style={{height: '200px', width: 'auto'}} 
                              />
                            </div>
                          ) : (
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                e.target.value = null;

                                const ext = file.name.split('.').pop();
                                const imageName = `transfer-account-${Date.now()}.${ext}`;

                                const request = new FormData();
                                request.append('image', file);
                                request.append('name', imageName);

                                const result = await galleryRest.save(request);
                                if (!result) return;

                                const accounts = [...formData.transfer_accounts];
                                accounts[index].image = imageName;
                                setFormData({...formData, transfer_accounts: accounts});
                              }}
                            />
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Número de Cuenta (CC)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={account.cc}
                            onChange={(e) => {
                              const accounts = [...formData.transfer_accounts];
                              accounts[index].cc = e.target.value;
                              setFormData({...formData, transfer_accounts: accounts});
                            }}
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Código de Cuenta Interbancario (CCI)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={account.cci}
                            onChange={(e) => {
                              const accounts = [...formData.transfer_accounts];
                              accounts[index].cci = e.target.value;
                              setFormData({...formData, transfer_accounts: accounts});
                            }}
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Nombre del Banco/Titular</label>
                          <input
                            type="text"
                            className="form-control"
                            value={account.name}
                            onChange={(e) => {
                              const accounts = [...formData.transfer_accounts];
                              accounts[index].name = e.target.value;
                              setFormData({...formData, transfer_accounts: accounts});
                            }}
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Descripción</label>
                          <textarea
                            className="form-control"
                            value={account.description}
                            onChange={(e) => {
                              const accounts = [...formData.transfer_accounts];
                              accounts[index].description = e.target.value;
                              setFormData({...formData, transfer_accounts: accounts});
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-primary mt-2"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          transfer_accounts: [
                            ...formData.transfer_accounts,
                            {
                              image: null,
                              cc: "",
                              cci: "",
                              name: "",
                              description: ""
                            }
                          ]
                        });
                      }}
                    >
                      Agregar Otra Cuenta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`tab-pane fade ${activeTab === "policies" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <div className="mb-2">
              <QuillFormGroup
                label="Política de privacidad"
                value={formData.privacyPolicy}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    privacyPolicy: value,
                  })
                }
              />
            </div>
            <div className="mb-2">
              <QuillFormGroup
                label="Términos y condiciones"
                value={formData.termsConditions}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    termsConditions: value,
                  })
                }
              />
            </div>
            <div className="mb-2">
              <QuillFormGroup
                label="Políticas de envío"
                value={formData.deliveryPolicy}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    deliveryPolicy: value,
                  })
                }
              />
            </div>
            <div className="mb-2">
              <QuillFormGroup
                label="Políticas de devolución y cambio"
                value={formData.salebackPolicy}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    salebackPolicy: value,
                  })
                }
              />
            </div>
          </div>

          <div
            className={`tab-pane fade ${activeTab === "location" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <LoadScript googleMapsApiKey={Global.GMAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "400px",
                }}
                center={formData.location}
                zoom={10}
                onClick={handleMapClick}
              >
                <Marker position={formData.location} />
              </GoogleMap>
            </LoadScript>
            <small className="form-text text-muted">
              Haz clic en el mapa para seleccionar la ubicación.
            </small>
          </div>

          <div
            className={`tab-pane fade ${activeTab === "shippingfree" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <div className="mb-2">
                <label className="form-label">Envio gratis a partir de:</label>
                <input
                  type="text"
                  placeholder="Ingrese el monto para envio gratis"
                  className="form-control"
                  value={formData.shippingFree}
                  onChange={(e) => setFormData({
                    ...formData,
                    shippingFree: e.target.value
                  })}
                />
              </div>
          </div>

          <div
            className={`tab-pane fade ${activeTab === "corporate" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <div className="mb-2">
              <label className="form-label">Email Corporativo Principal</label>
              <input
                type="email"
                placeholder="contacto@empresa.com"
                className="form-control"
                value={formData.coorporativeEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  coorporativeEmail: e.target.value
                })}
              />
              <small className="text-muted">Este email se usará para comunicaciones corporativas y notificaciones del sistema</small>
            </div>
          </div>

          <div
            className={`tab-pane fade ${activeTab === "pixels" ? "show active" : ""
              }`}
            role="tabpanel"
          >
            <div className="row">
              <div className="col-md-6">
                <h5 className="mb-3">Google Analytics & Ads</h5>
                <div className="mb-3">
                  <label className="form-label">Google Analytics ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX o UA-XXXXXXXX-X"
                    className="form-control"
                    value={formData.googleAnalyticsId}
                    onChange={(e) => setFormData({
                      ...formData,
                      googleAnalyticsId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID de Google Analytics para tracking de visitas</small>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Google Tag Manager ID</label>
                  <input
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    className="form-control"
                    value={formData.googleTagManagerId}
                    onChange={(e) => setFormData({
                      ...formData,
                      googleTagManagerId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID de Google Tag Manager</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Google Ads Conversion ID</label>
                  <input
                    type="text"
                    placeholder="AW-XXXXXXXXX"
                    className="form-control"
                    value={formData.googleAdsConversionId}
                    onChange={(e) => setFormData({
                      ...formData,
                      googleAdsConversionId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID de conversión de Google Ads</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Google Ads Conversion Label</label>
                  <input
                    type="text"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxx"
                    className="form-control"
                    value={formData.googleAdsConversionLabel}
                    onChange={(e) => setFormData({
                      ...formData,
                      googleAdsConversionLabel: e.target.value
                    })}
                  />
                  <small className="text-muted">Etiqueta de conversión de Google Ads</small>
                </div>

                <h5 className="mb-3">Redes Sociales</h5>
                <div className="mb-3">
                  <label className="form-label">Facebook Pixel ID</label>
                  <input
                    type="text"
                    placeholder="XXXXXXXXXXXXXXX"
                    className="form-control"
                    value={formData.facebookPixelId}
                    onChange={(e) => setFormData({
                      ...formData,
                      facebookPixelId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID del píxel de Facebook</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">TikTok Pixel ID</label>
                  <input
                    type="text"
                    placeholder="XXXXXXXXXXXXXXXXX"
                    className="form-control"
                    value={formData.tiktokPixelId}
                    onChange={(e) => setFormData({
                      ...formData,
                      tiktokPixelId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID del píxel de TikTok</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">LinkedIn Insight Tag ID</label>
                  <input
                    type="text"
                    placeholder="XXXXXXX"
                    className="form-control"
                    value={formData.linkedinInsightTag}
                    onChange={(e) => setFormData({
                      ...formData,
                      linkedinInsightTag: e.target.value
                    })}
                  />
                  <small className="text-muted">ID del Insight Tag de LinkedIn</small>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="mb-3">Otras Plataformas</h5>
                <div className="mb-3">
                  <label className="form-label">Hotjar ID</label>
                  <input
                    type="text"
                    placeholder="XXXXXXX"
                    className="form-control"
                    value={formData.hotjarId}
                    onChange={(e) => setFormData({
                      ...formData,
                      hotjarId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID de Hotjar para mapas de calor</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Microsoft Clarity ID</label>
                  <input
                    type="text"
                    placeholder="xxxxxxxxxx"
                    className="form-control"
                    value={formData.clarityId}
                    onChange={(e) => setFormData({
                      ...formData,
                      clarityId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID de Microsoft Clarity</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Twitter Pixel ID</label>
                  <input
                    type="text"
                    placeholder="o1234"
                    className="form-control"
                    value={formData.twitterPixelId}
                    onChange={(e) => setFormData({
                      ...formData,
                      twitterPixelId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID del píxel de Twitter</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Pinterest Tag ID</label>
                  <input
                    type="text"
                    placeholder="26xxxxxxxxxxxxxxxxxx"
                    className="form-control"
                    value={formData.pinterestTagId}
                    onChange={(e) => setFormData({
                      ...formData,
                      pinterestTagId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID del tag de Pinterest</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Snapchat Pixel ID</label>
                  <input
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="form-control"
                    value={formData.snapchatPixelId}
                    onChange={(e) => setFormData({
                      ...formData,
                      snapchatPixelId: e.target.value
                    })}
                  />
                  <small className="text-muted">ID del píxel de Snapchat</small>
                </div>

                <h5 className="mb-3">Scripts Personalizados</h5>
                <div className="mb-3">
                  <label className="form-label">Scripts en Head</label>
                  <textarea
                    rows="4"
                    placeholder="Scripts que se insertarán en el &lt;head&gt;"
                    className="form-control"
                    value={formData.customHeadScripts}
                    onChange={(e) => setFormData({
                      ...formData,
                      customHeadScripts: e.target.value
                    })}
                  />
                  <small className="text-muted">Scripts personalizados para el &lt;head&gt;</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Scripts en Body</label>
                  <textarea
                    rows="4"
                    placeholder="Scripts que se insertarán antes del &lt;/body&gt;"
                    className="form-control"
                    value={formData.customBodyScripts}
                    onChange={(e) => setFormData({
                      ...formData,
                      customBodyScripts: e.target.value
                    })}
                  />
                  <small className="text-muted">Scripts personalizados para el final del &lt;body&gt;</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          Guardar
        </button>
      </form>
    </div>
  );
};

CreateReactScript((el, properties) => {
  createRoot(el).render(
    <BaseAdminto {...properties} title="Datos Generales">
      <Generals {...properties} />
    </BaseAdminto>
  );
});

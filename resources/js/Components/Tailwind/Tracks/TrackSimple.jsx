import React, { useEffect } from "react"
import { Search, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import { GET } from "sode-extend-react"
import SalesRest from "../../../Actions/SalesRest"

const salesRest = new SalesRest()

const getStatusIcon = (status) => {
    return <CheckCircle className="w-4 h-4" />
}

const getStatusBGColor = (color = '#111111', percent = 0.1) => {
    return `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${percent})`
}

const TrackSimple = () => {
    const [orderCode, setOrderCode] = useState(GET?.code ?? '')
    const [statusTracking, setStatusTracking] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    const handleSearch = async (e) => {
        e?.preventDefault()

        if (!orderCode.trim()) return

        setIsLoading(true)
        setNotFound(false)
        setStatusTracking(null)
        try {
            const { status, tracking } = await salesRest.track(orderCode, false)
            if (!status) throw new Error("Pedido no encontrado")
            setStatusTracking(tracking.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
        } catch (error) {
            setNotFound(true)
            setStatusTracking(null)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsLoading(true)
        try {
            const { status, tracking } = await salesRest.track(orderCode, false)
            if (!status) throw new Error("Pedido no encontrado")
            setStatusTracking(null)
            setTimeout(() => {
                setStatusTracking(tracking.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
            }, 100);
        } catch (error) {
            setNotFound(true)
            setStatusTracking(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (orderCode) {
            handleSearch()
        }
    }, [null])
    const currentStatus = statusTracking?.[0] ?? null

    return (
        <div className="min-h-screen bg-gray-50 p-[5%]">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-[5%]">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Rastreo de Pedidos</h1>
                    <p className="text-gray-600">Ingresa el código de tu pedido para ver su estado actual</p>
                </div>

                {/* Formulario de búsqueda */}
                <div className="mb-[5%]">
                    <div className="py-6">
                        <form className="flex gap-3" onSubmit={handleSearch}>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Ingresa el código del pedido (ej: 20250624142749044420)"
                                    value={orderCode}
                                    onChange={(e) => setOrderCode(e.target.value)}
                                    className="w-full px-4 py-2 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !orderCode.trim()}
                                className="px-6 py-2 bg-primary text-white rounded-lg  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                                {!isLoading && "Buscar"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Estado actual */}
                {currentStatus && (
                    <div className="bg-white rounded-lg shadow-sm border mb-8 border-l-4 border-l-green-500" style={{ borderLeftColor: currentStatus.color }}>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Estado Actual</h3>
                                    <p className="text-2xl font-bold" style={{ color: currentStatus.color }}>{currentStatus.name}</p>
                                    <p className="text-gray-600 mt-1">{currentStatus.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Última actualización</p>
                                    <p className="font-semibold">{moment(currentStatus.created_at).format('YYYY-MM-DD')}</p>
                                    <p className="text-sm text-gray-600">{moment(currentStatus.created_at).format('hh:mm a')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensaje de no encontrado */}
                {notFound && (
                    <div className="bg-white rounded-lg shadow-sm border mb-8 border-l-4 border-l-red-500">
                        <div className="p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pedido no encontrado</h3>
                            <p className="text-gray-600">
                                No se encontró información para el código: <strong>{orderCode}</strong>
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Códigos de ejemplo: 20250624142749044420, 20250624142749044421</p>
                        </div>
                    </div>
                )}

                {/* Línea de tiempo */}
                {statusTracking && (
                    <div>
                        <div className="py-6">
                            <div className="flex items-center justify-between mb-8 border-b pb-4">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Tracking de estados
                                </h3>
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    disabled={isLoading}
                                >
                                    <i className={`mdi ${isLoading ? 'mdi-spin mdi-loading' : 'mdi-refresh'} text-gray-600 me-2`} />
                                    Refrescar
                                </button>
                            </div>

                            <div className="relative">
                                {/* Línea vertical */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                <div className="space-y-6">
                                    {statusTracking.map((status, index) => {
                                        return (
                                            <div key={status.id} className="relative flex items-start">
                                                {/* Círculo del estado */}
                                                <div
                                                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-lg ${index == 0 ? "ring-4 ring-opacity-20" : ""} `} style={{ backgroundColor: status.color, '--tw-ring-color': getStatusBGColor(status.color, 0.5) }}
                                                >
                                                    <div className="text-white">
                                                        <i className={status.icon || 'mdi mdi-circle'}></i>
                                                        {/* {getStatusIcon(status.name)} */}
                                                    </div>
                                                </div>

                                                {/* Contenido del estado */}
                                                <div className="ml-6 flex-1">
                                                    <div className="bg-white rounded-lg border shadow-sm p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold`} style={{
                                                                backgroundColor: getStatusBGColor(status.color),
                                                                color: status.color,
                                                                borderColor: status.color,
                                                                // bg-blue-100 text-blue-800 border-blue-200
                                                            }}>
                                                                {status.name}
                                                            </span>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-900">{moment(status.created_at).format('YYYY-MM-DD')}</p>
                                                                <p className="text-xs text-gray-500">{moment(status.created_at).format('hh:mm a')}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700">{status.description}</p>
                                                        {status.isActive && (
                                                            <div className="mt-2">
                                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                                                    Estado Actual
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrackSimple
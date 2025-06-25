import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createRoot } from 'react-dom/client';
import CreateReactScript from '../Utils/CreateReactScript';
import BaseAdminto from '../Components/Adminto/Base';
import Chart from 'react-apexcharts';

const Home = ({ session, totalProducts, totalStock, salesToday, salesMonth, salesYear, incomeToday, incomeMonth, incomeYear, topProducts, newFeatured, ordersByStatus, salesByLocation, topCoupons, topDiscountRules, brands, topClients, salesLast30Days, usersToday, usersMonth, usersYear, customerSatisfaction }) => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const formatIncome = (value) => {
    const numValue = Number(value) || 0;
    return numValue.toFixed(2);
  };

  return (
    <>
      {/* KPIs Modernos */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 position-relative">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-semibold">Total Orders</span>
                <i className="fas fa-ellipsis-v text-muted small"></i>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48, background: '#e0e7ff'}}>
                  <i className="fas fa-shopping-cart text-primary fs-4"></i>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-dark">{salesToday || '—'}</div>
                  <div className="text-muted small">{salesMonth || '—'} <span className="ms-1">Since last month</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 position-relative">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-semibold">Total Revenue</span>
                <i className="fas fa-ellipsis-v text-muted small"></i>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48, background: '#d1fae5'}}>
                  <i className="fas fa-dollar-sign text-success fs-4"></i>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-dark">S/ {formatIncome(incomeToday) || '—'}</div>
                  <div className="text-success small fw-semibold"><i className="fas fa-arrow-up me-1"></i>32% <span className="text-muted ms-1">Since last month</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 position-relative">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-semibold">New Users</span>
                <i className="fas fa-ellipsis-v text-muted small"></i>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48, background: '#fef9c3'}}>
                  <i className="fas fa-user-plus text-warning fs-4"></i>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-dark">{usersToday || '—'}</div>
                  <div className="text-muted small">{usersMonth || '—'} <span className="ms-1">Since last month</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100 position-relative">
            <div className="card-body d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted fw-semibold">Customer Satisfaction</span>
                <i className="fas fa-ellipsis-v text-muted small"></i>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48, background: '#e0e7ff'}}>
                  <i className="fas fa-smile text-info fs-4"></i>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-dark">{customerSatisfaction || '—'}%</div>
                  <div className="badge bg-info bg-opacity-10 text-info fw-semibold">5.7%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y estadísticas modernos */}
      <div className="row g-3 mb-4">
        <div className="col-xl-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-chart-bar text-info"></i>
                <span className="fw-bold">Statistics</span>
              </div>
              <button className="btn btn-sm btn-light border"><i className="fas fa-ellipsis-v"></i></button>
            </div>
            <div className="card-body">
              {(() => {
                // Filtrar datos por rango de fechas
                const filteredData = salesLast30Days.filter(d => {
                  const date = new Date(d.date);
                  return date >= startDate && date <= endDate;
                });
                return (
                  <>
                    <Chart
                      options={{
                        chart: {
                          id: 'ventas30dias',
                          toolbar: { show: false },
                          stacked: false,
                        },
                        xaxis: {
                          categories: filteredData.map(d => d.date),
                          labels: { rotate: -35 }
                        },
                        yaxis: [
                          {
                            title: { text: 'Pedidos' },
                            labels: { style: { colors: '#3b82f6' } },
                            min: 0,
                          },
                          {
                            opposite: true,
                            title: { text: 'Ventas (S/)' },
                            labels: { style: { colors: '#10b981' } },
                            min: 0,
                          }
                        ],
                        dataLabels: { enabled: false },
                        stroke: { curve: 'smooth', width: [0, 3] },
                        colors: ['#3b82f6', '#10b981'],
                        tooltip: {
                          enabled: true,
                          shared: true,
                          intersect: false,
                          y: [
                            {
                              formatter: val => `${val} pedidos`
                            },
                            {
                              formatter: val => `S/ ${Number(val).toFixed(2)}`
                            }
                          ]
                        },
                        legend: { show: true, position: 'top', fontWeight: 600 }
                      }}
                      series={[
                        {
                          name: 'Pedidos',
                          type: 'column',
                          data: filteredData.map(d => d.orders || 0),
                          yAxisIndex: 0
                        },
                        {
                          name: 'Ventas',
                          type: 'line',
                          data: filteredData.map(d => d.amount),
                          yAxisIndex: 1
                        }
                      ]}
                      type="line"
                      height={260}
                    />
                    <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
                      <span className="text-muted small">Rango de fechas:</span>
                      <DatePicker
                        selected={startDate}
                        onChange={date => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="yyyy-MM-dd"
                        className="form-control form-control-sm"
                        maxDate={endDate}
                      />
                      <span className="mx-1">a</span>
                      <DatePicker
                        selected={endDate}
                        onChange={date => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="yyyy-MM-dd"
                        className="form-control form-control-sm"
                        minDate={startDate}
                        maxDate={new Date()}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-chart-pie text-primary"></i>
                <span className="fw-bold">Orders Statistics</span>
              </div>
              <button className="btn btn-sm btn-light border"><i className="fas fa-sync-alt"></i></button>
            </div>
            <div className="card-body">
              <Chart
                options={{
                  chart: {
                    type: 'pie',
                    toolbar: { show: false },
                  },
                  labels: ordersByStatus.map(s => s.name),
                  colors: ordersByStatus.map(s => s.color),
                  legend: {
                    position: 'bottom',
                    fontSize: '15px',
                    fontWeight: 500,
                    markers: { width: 16, height: 16, radius: 8 },
                    itemMargin: { horizontal: 10, vertical: 4 }
                  },
                  tooltip: {
                    enabled: true,
                    style: { fontSize: '15px', fontWeight: 500 },
                    fillSeriesColor: false,
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: { width: 2, colors: ['#fff'] },
                  fill: {
                    type: 'solid',
                  },
                  states: {
                    hover: { filter: { type: 'lighten', value: 0.08 } },
                    active: { filter: { type: 'darken', value: 0.12 } }
                  },
                  animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 700,
                    animateGradually: { enabled: true, delay: 100 },
                    dynamicAnimation: { enabled: true, speed: 300 }
                  }
                }}
                series={ordersByStatus.map(s => s.count)}
                type="pie"
                height={300}
              />
              
            </div>
          </div>
        </div>
        
        <div className="col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-th-large text-success"></i>
                <span className="fw-bold">Ventas por Ubicación (TreeMap)</span>
              </div>
              <button className="btn btn-sm btn-light border"><i className="fas fa-ellipsis-v"></i></button>
            </div>
            <div className="card-body">
              <Chart
                options={{
                  chart: { type: 'treemap', toolbar: { show: false } },
                  legend: { show: false },
                  dataLabels: {
                    enabled: true,
                    style: { fontSize: '14px', fontWeight: 500 },
                    formatter: function(text, op) {
                      // Muestra solo el nombre de la ubicación, no el valor
                      return text.length > 18 ? text.slice(0, 15) + '...' : text;
                    }
                  },
                  colors: ['#10b981', '#3b82f6', '#f59e42', '#f43f5e', '#6366f1', '#06b6d4', '#fbbf24'],
                  tooltip: {
                    enabled: true,
                    y: {
                      formatter: val => `Ventas: ${val}`
                    }
                  },
                  grid: { show: false }
                }}
                series={[
                  {
                    data: salesByLocation.slice(0, 12).map(l => ({
                      x: `${l.department}/${l.province}/${l.district}`,
                      y: l.count
                    }))
                  }
                ]}
                type="treemap"
                height={300}
              />
              <div className="text-muted small mt-2">
                Mostrando top {Math.min(salesByLocation.length, 12)} ubicaciones
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listados y tablas principales mejoradas */}
      <div className="row mb-3">
        <div className="col-xl-6 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-2"><i className="fas fa-fire text-danger"></i></span>
                <h6 className="mb-0 fw-bold">Top Selling Products</h6>
              </div>
              <button className="btn btn-sm btn-outline-primary"><i className="fas fa-download"></i> Export</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{maxHeight: 340}}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Tendencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.name}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={`/storage/images/item/${product.image}`} alt={product.name} className="rounded-circle me-2" style={{width: '40px', height: '40px', objectFit: 'cover', border: '2px solid #e5e7eb'}} onError={e => e.target.src = '/api/cover/thumbnail/null'} />
                            <div>
                              <div className="fw-semibold">{product.name}</div>
                              <span className="badge bg-primary bg-opacity-10 text-primary mt-1">Top</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge bg-success bg-opacity-10 text-success fs-6">{product.quantity}</span></td>
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success"><i className="fas fa-arrow-up me-1"></i>+{Math.round(Math.random() * 20)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center p-2">
                <span className="text-muted small">Mostrando {topProducts.length} productos</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-6 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-2"><i className="fas fa-star text-warning"></i></span>
                <h6 className="mb-0 fw-bold">New Featured Products</h6>
              </div>
              <button className="btn btn-sm btn-outline-primary"><i className="fas fa-upload"></i> Import</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{maxHeight: 340}}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newFeatured.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={`/storage/images/item/${product.image}`} alt={product.name} className="rounded-circle me-2" style={{width: '40px', height: '40px', objectFit: 'cover', border: '2px solid #e5e7eb'}} />
                            <div>
                              <div className="fw-semibold">{product.name}</div>
                              <span className="badge bg-warning bg-opacity-10 text-warning mt-1">Nuevo</span>
                            </div>
                          </div>
                        </td>
                        <td className="fw-bold">S/{Number(product.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center p-2">
                <span className="text-muted small">Mostrando {newFeatured.length} productos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-xl-6 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-2"><i className="fas fa-ticket-alt text-primary"></i></span>
                <h6 className="mb-0 fw-bold">Most Used Coupons</h6>
              </div>
              <button className="btn btn-sm btn-outline-primary"><i className="fas fa-download"></i> Export</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{maxHeight: 340}}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Veces Usado</th>
                      <th>Valor</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCoupons.map((c, i) => (
                      <tr key={i}>
                        <td><span className="badge bg-primary bg-opacity-10 text-primary">{c.code}</span></td>
                        <td className="fw-semibold">{c.name}</td>
                        <td><span className="badge bg-success bg-opacity-10 text-success">{c.used_count}</span></td>
                        <td><span className="badge bg-info bg-opacity-10 text-info">{c.value}</span></td>
                        <td><span className="badge bg-secondary bg-opacity-10 text-secondary">{c.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center p-2">
                <span className="text-muted small">Mostrando {topCoupons.length} cupones</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-6 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-2"><i className="fas fa-percentage text-success"></i></span>
                <h6 className="mb-0 fw-bold">Most Used Discount Rules</h6>
              </div>
              <button className="btn btn-sm btn-outline-primary"><i className="fas fa-download"></i> Export</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{maxHeight: 340}}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Veces Aplicada</th>
                      <th>Monto Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDiscountRules.map((r, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{r.name}</td>
                        <td><span className="badge bg-success bg-opacity-10 text-success">{r.times_used}</span></td>
                        <td><span className="badge bg-info bg-opacity-10 text-info">S/ {formatIncome(r.total_discount)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center p-2">
                <span className="text-muted small">Mostrando {topDiscountRules.length} reglas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-xl-6 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-2"><i className="fas fa-industry text-info"></i></span>
                <h6 className="mb-0 fw-bold">Brands Listing</h6>
              </div>
              <button className="btn btn-sm btn-outline-primary"><i className="fas fa-plus"></i> Add Brand</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{maxHeight: 340}}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Destacada</th>
                      <th>Visible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((b, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{b.name}</td>
                        <td>
                          <span className={`badge ${b.status === 1 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>{b.status === 1 ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td>
                          <span className={`badge ${b.featured ? 'bg-warning bg-opacity-10 text-warning' : 'bg-secondary bg-opacity-10 text-secondary'}`}>{b.featured ? 'Sí' : 'No'}</span>
                        </td>
                        <td>
                          <span className={`badge ${b.visible ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`}>{b.visible ? 'Sí' : 'No'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center p-2">
                <span className="text-muted small">Mostrando {brands.length} marcas</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-6 mb-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="me-2"><i className="fas fa-users text-primary"></i></span>
                <h6 className="mb-0 fw-bold">Top Clients</h6>
              </div>
              <button className="btn btn-sm btn-outline-primary"><i className="fas fa-download"></i> Export</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{maxHeight: 340}}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Email</th>
                      <th>Pedidos</th>
                      <th>Monto Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((c, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{c.email}</td>
                        <td><span className="badge bg-primary bg-opacity-10 text-primary">{c.total_orders}</span></td>
                        <td><span className="badge bg-success bg-opacity-10 text-success">S/ {formatIncome(c.total_spent)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center p-2">
                <span className="text-muted small">Mostrando {topClients.length} clientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

CreateReactScript((el, properties) => {
  createRoot(el).render(
    <BaseAdminto {...properties} title="Dashboard">
      <Home {...properties} />
    </BaseAdminto>
  );
});
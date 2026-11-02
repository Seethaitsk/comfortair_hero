'use client';

import React from 'react';
import { useModal } from '@/context/ModalContext';

export default function ProductSpecModal() {
  const { specState, closeSpec, openAppointment } = useModal();

  if (!specState.isOpen) return null;

  const { name, brand, desc, specs, img } = specState.data;

  const handleEnquire = () => {
    closeSpec();
    openAppointment(name);
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={closeSpec}
      />

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div className="modal-header bg-dark-navy text-white rounded-top-4 py-3 px-4">
              <h5 className="modal-title fw-bold fs-5 mb-0 d-flex align-items-center">
                <i className="fa-solid fa-snowflake me-2 text-primary-blue"></i>
                Product Technical Specifications
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeSpec}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-4 p-md-5">
              <div className="row align-items-center gy-4">
                <div className="col-md-5 text-center">
                  <div className="p-3 bg-light rounded-4 border d-flex align-items-center justify-content-center">
                    <img
                      src={img}
                      alt={name}
                      className="img-fluid rounded-3"
                      style={{ maxHeight: '240px', objectFit: 'contain' }}
                    />
                  </div>
                </div>

                <div className="col-md-7">
                  <span className="badge bg-primary-blue text-white px-3 py-1.5 rounded-pill mb-2 small fw-bold">
                    <i className="fa-solid fa-file-lines me-1" aria-hidden="true"></i> Technical Datasheet
                  </span>
                  <h3 className="fw-bold text-dark-navy mb-2 fs-4">{name}</h3>
                  <p className="text-muted small mb-3 lh-base">
                    {desc ||
                      'Official Carrier/Toshiba certified system engineered for superior cooling efficiency and durable long-term performance.'}
                  </p>

                  <div className="p-3 bg-light rounded-3 border mb-4">
                    <strong className="d-block text-dark-navy small mb-1">
                      <i className="fa-solid fa-microchip text-primary-blue me-1"></i>{' '}
                      Technical Highlights:
                    </strong>
                    <span className="small text-muted d-block">
                      {specs || 'Inverter Energy Saver • Official Manufacturer Warranty'}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-custom-accent rounded-pill px-4 py-2.5 fw-bold"
                      onClick={handleEnquire}
                    >
                      <i className="fa-solid fa-file-invoice-dollar me-1"></i> Request Price Quote
                    </button>
                    <a
                      href="tel:+919843020458"
                      className="btn btn-custom-outline rounded-pill px-4 py-2.5 fw-bold"
                    >
                      <i className="fa-solid fa-phone me-1"></i> Call Specialist
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/*
 * CIASO site configuration.
 *
 * FORMS: until a form-processing endpoint is connected, forms fall back to
 * opening the visitor's email app with their message addressed to CIASO.
 * To enable direct submission, set an endpoint that accepts a POST of
 * multipart/form-data and returns a 2xx status (e.g. a WordPress Contact Form 7
 * REST endpoint, a Formspree form, or CIASO's own API). Never put secret keys here.
 *
 * ANALYTICS: conversion events are pushed to window.dataLayer only if an
 * analytics tool has created it. Nothing is tracked by default.
 */
window.CIASO_CONFIG = {
  email: 'admin@ciaso.ca',
  formEndpoints: {
    support: '',
    contact: '',
    volunteer: '',
    partner: ''
  }
};

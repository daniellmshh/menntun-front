/**
 * Complete these fields with the legal information of the entity that offers
 * Menntun before merging this branch into production. They are deliberately
 * centralized so the privacy notice and terms always identify the same party.
 */
export const legalProfile = {
  serviceName: "Menntun",
  responsibleName: "[RAZÓN SOCIAL O NOMBRE COMPLETO DEL RESPONSABLE]",
  responsibleAddress: "[DOMICILIO COMPLETO DEL RESPONSABLE EN MÉXICO]",
  privacyEmail: "[CORREO PARA DERECHOS ARCO]",
  legalEmail: "[CORREO DE ASUNTOS LEGALES]",
  jurisdiction: "[CIUDAD Y ESTADO PARA JURISDICCIÓN]",
  effectiveDate: "3 de agosto de 2026",
} as const;

export const legalProfileIsComplete = !Object.values(legalProfile).some((value) => value.startsWith("["));

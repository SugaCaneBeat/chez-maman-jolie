/**
 * Source unique pour les infos de contact — à utiliser partout
 * pour éviter la dérive (tel, WhatsApp, Instagram, horaires…).
 */

/* Numéro de téléphone — un seul endroit, plusieurs formats dérivés */
export const PHONE_RAW = "+33753873213";
export const PHONE_E164 = "+33753873213";          // pour href="tel:"
export const PHONE_WA = "33753873213";             // sans le + pour wa.me
export const PHONE_DISPLAY = "07 53 87 32 13";     // pour l'UI

/* Liens construits */
export const TEL_HREF = `tel:${PHONE_E164}`;
export const WA_HREF = `https://wa.me/${PHONE_WA}`;

/* Réseaux sociaux */
export const INSTAGRAM_URL = "https://www.instagram.com/chezmamanjolie/";
export const INSTAGRAM_HANDLE = "@chezmamanjolie";

/* Adresse / zone */
export const LOCATION_LABEL = "Paris 11ème";

/* Horaires */
export const SCHEDULE_LABEL = "Lun – Sam : 11h – 21h30";
export const SCHEDULE_CLOSED = "Dimanche : fermé";
export const SCHEDULE_INLINE = "Lun–Sam 11h–21h30";

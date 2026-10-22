import { handleRequest } from "./routes/Router";

/** Atiende las solicitudes GET que llegan a la API.
 * @param {GoogleAppsScript.Events.DoGet} e Datos enviados por Apps Script.
 * @returns {GoogleAppsScript.Content.TextOutput} Respuesta de la API en JSON.
 */
const doGet = (e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput => {
  return handleRequest("GET", e);
};

/** Atiende las solicitudes POST que llegan a la API.
 * @param {GoogleAppsScript.Events.DoPost} e Datos enviados por Apps Script.
 * @returns {GoogleAppsScript.Content.TextOutput} Respuesta de la API en JSON.
 */
const doPost = (e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput => {
  return handleRequest("POST", e);
};

// Exponer los puntos de entrada en el ámbito global
global.doGet = doGet;
global.doPost = doPost;

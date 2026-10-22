/** Normaliza una fecha al formato YYYY-MM-DD.
 * @param {string | Date} value Fecha recibida o leída desde ORMN.
 * @returns {string} Fecha en formato YYYY-MM-DD.
 */
export const formatDate = (value: string | Date): string => {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const text = String(value).trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(text);
  return match ? match[1] : text;
};

/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * Default heuristic based on market behavior; fine-tune with local comps.
 */
export const getLandSizeFactor = (areaSqm: number): number => {
  if (!areaSqm || areaSqm <= 0) return 1;
  if (areaSqm <= 100) return 1.0; // Pequeños
  if (areaSqm <= 500) return 0.97;
  if (areaSqm <= 1000) return 0.94;
  if (areaSqm <= 2000) return 0.89;
  if (areaSqm <= 5000) return 0.83;
  return 0.77; // Muy grandes
};

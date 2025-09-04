/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * Default heuristic based on market behavior; fine-tune with local comps.
 */
export const getLandSizeFactor = (areaSqm: number): number => {
  if (!areaSqm || areaSqm <= 0) return 1;
  // Urban land: shorter, logical brackets with progressively higher discount
  if (areaSqm <= 80) return 1.0;
  if (areaSqm <= 150) return 0.98;
  if (areaSqm <= 250) return 0.96;
  if (areaSqm <= 400) return 0.94;
  if (areaSqm <= 600) return 0.92;
  if (areaSqm <= 800) return 0.90;
  if (areaSqm <= 1000) return 0.88;
  if (areaSqm <= 1500) return 0.85;
  if (areaSqm <= 2000) return 0.82;
  if (areaSqm <= 3000) return 0.80;
  if (areaSqm <= 5000) return 0.78;
  return 0.75; // Muy grandes
};

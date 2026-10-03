import { Field, PracticeRecord, CarbonBreakdown, EmissionFactorConfig } from '../types';

export const DEFAULT_EMISSION_CONFIG: EmissionFactorConfig = {
  methodology: 'USDA_COMET_FARM',
  coverCropRate: 0.46, // MT CO2e / acre / year
  noTillRate: 0.51,    // MT CO2e / acre / year
  fertilizerReductionRate: 0.25, // MT CO2e / acre / year for ~20% reduction
  grazingRotationRate: 0.72,     // MT CO2e / acre / year
  carbonPricePerTon: 30, // $30/ton baseline voluntary credit or insetting credit
};

export function recalculateFieldCarbon(
  field: Field,
  config: EmissionFactorConfig = DEFAULT_EMISSION_CONFIG
): CarbonBreakdown {
  let coverCropMT = 0;
  let noTillMT = 0;
  let fertilizerReductionMT = 0;
  let grazingRotationMT = 0;
  let compostBiocharMT = 0;

  field.practices.forEach((practice: PracticeRecord) => {
    const ac = practice.acreageApplied || field.acreage;
    let factor = practice.emissionReductionFactor;

    // Apply methodology adjustment if needed
    if (config.methodology === 'IPCC_TIER_1') {
      if (practice.practiceType === 'cover_crop') factor = 0.40;
      if (practice.practiceType === 'no_till') factor = 0.45;
      if (practice.practiceType === 'fertilizer_reduction') factor = 0.20;
      if (practice.practiceType === 'grazing_rotation') factor = 0.60;
    }

    const estimatedMT = Number((ac * factor).toFixed(1));

    switch (practice.practiceType) {
      case 'cover_crop':
        coverCropMT += estimatedMT;
        break;
      case 'no_till':
        noTillMT += estimatedMT;
        break;
      case 'fertilizer_reduction':
        fertilizerReductionMT += estimatedMT;
        break;
      case 'grazing_rotation':
        grazingRotationMT += estimatedMT;
        break;
      case 'compost_biochar':
        compostBiocharMT += estimatedMT;
        break;
    }
  });

  const totalGrossMT = Number(
    (coverCropMT + noTillMT + fertilizerReductionMT + grazingRotationMT + compostBiocharMT).toFixed(1)
  );
  const totalNetPerAcre = field.acreage > 0 ? Number((totalGrossMT / field.acreage).toFixed(2)) : 0;
  const potentialRevenueUSD = Math.round(totalGrossMT * config.carbonPricePerTon);

  // Estimating 5-year SOM accretion: ~0.15% per 1.0 MT net CO2e sequestered annually
  const somAccretion5YrPct = Number((totalNetPerAcre * 0.16).toFixed(2));
  // 1% increase in SOM holds ~27,000 gallons of water per acre
  const waterCapacityGainGallons = Math.round(field.acreage * somAccretion5YrPct * 27000);

  return {
    coverCropMT,
    noTillMT,
    fertilizerReductionMT,
    grazingRotationMT,
    compostBiocharMT,
    totalGrossMT,
    totalNetPerAcre,
    potentialRevenueUSD,
    somAccretion5YrPct,
    waterCapacityGainGallons,
  };
}

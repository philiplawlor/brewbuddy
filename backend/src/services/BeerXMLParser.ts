import { parseStringPromise, Builder } from 'xml2js';
import { IRecipe, IMashProfile, IMashStep, IStyleProfile, IEquipment, IInstruction, IMiscIngredient } from '../types/recipe';

// BeerXML type mappings
const METHOD_MAP: Record<string, IRecipe['method']> = {
  'All Grain': 'all_grain',
  'all grain': 'all_grain',
  'Partial Mash': 'partial_mash',
  'partial mash': 'partial_mash',
  'Extract': 'extract',
  extract: 'extract',
};

const METHOD_REVERSE_MAP: Record<string, string> = {
  all_grain: 'All Grain',
  partial_mash: 'Partial Mash',
  extract: 'Extract',
  biab: 'All Grain', // BIAB maps to All Grain in BeerXML
};

const HOP_USE_MAP: Record<string, string> = {
  Boil: 'Boil',
  boil: 'Boil',
  'Dry Hop': 'Dry Hop',
  dry_hop: 'Dry Hop',
  Mash: 'Mash',
  mash: 'Mash',
  'First Wort': 'First Wort',
  first_wort: 'First Wort',
  Aroma: 'Aroma',
  aroma: 'Aroma',
};

const MASH_STEP_TYPE_MAP: Record<string, IMashStep['type']> = {
  Infusion: 'infusion',
  infusion: 'infusion',
  Temperature: 'temperature',
  temperature: 'temperature',
  Decoction: 'decoction',
  decoction: 'decoction',
};

export interface ParsedBeerXML {
  recipe: Partial<IRecipe>;
  hops: Array<{
    name: string;
    alpha?: number;
    amount?: number;
    time?: number;
    use?: string;
    form?: string;
    origin?: string;
    type?: string;
    notes?: string;
    beta?: number;
    hsi?: number;
    humulene?: number;
    caryophyllene?: number;
    cohumulone?: number;
    myrcene?: number;
    substitutes?: string;
    producer?: string;
    productId?: string;
    year?: string;
  }>;
  fermentables: Array<{
    name: string;
    amount?: number;
    yield?: number;
    color?: number;
    type?: string;
    origin?: string;
    supplier?: string;
    notes?: string;
    potentialExtract?: number;
    coarseFineDiff?: number;
    moisture?: number;
    protein?: number;
    maxInBatch?: number;
    recommendMash?: boolean;
    ibuGalPerLb?: number;
  }>;
  yeasts: Array<{
    name: string;
    type?: string;
    form?: string;
    amount?: number;
    laboratory?: string;
    productId?: string;
    attenuation?: number;
    attenuationMin?: number;
    attenuationMax?: number;
    minTemperature?: number;
    maxTemperature?: number;
    flocculation?: string;
    notes?: string;
    timesCultured?: number;
    maxReuse?: number;
    addToSecondary?: boolean;
    bestFor?: string;
  }>;
  mashProfile?: IMashProfile;
  styleProfile?: IStyleProfile;
  equipment?: IEquipment;
  instructions?: IInstruction[];
  miscIngredients?: IMiscIngredient[];
  brewer?: string;
  asstBrewer?: string;
  carbonation?: number;
  forcedCarbonation?: boolean;
  primingSugarName?: string;
  primingSugarEquiv?: number;
  kegPrimingFactor?: number;
  carbonationTemp?: number;
  primaryAgeDays?: number;
  primaryTemp?: number;
  secondaryAgeDays?: number;
  secondaryTemp?: number;
  tertiaryAgeDays?: number;
  tertiaryTemp?: number;
  ageDays?: number;
  ageTemp?: number;
}

// Sentinel's security config: disable external entity processing
const PARSE_OPTIONS = {
  explicitArray: false,
  normalize: true,
  normalizeTags: true,
  trim: true,
  // Security: disable DTD processing and external entities (XXE protection)
  xmlns: false,
  // xml2js doesn't have a direct "no external entities" option,
  // but we validate/sanitize the input before parsing
};

/**
 * Parse a BeerXML string into a structured BrewBuddy recipe object.
 * @param xmlString - Raw BeerXML content
 * @returns Parsed recipe data ready for import
 */
export async function parseBeerXML(xmlString: string): Promise<ParsedBeerXML> {
  // Security: reject XML that contains DOCTYPE or SYSTEM/PUBLIC declarations (XXE vector)
  if (/<\!DOCTYPE|<\!ENTITY|SYSTEM\s+["']|PUBLIC\s+["']/i.test(xmlString)) {
    throw new Error('XML contains potentially dangerous declarations (DOCTYPE/ENTITY). Import rejected for security.');
  }

  // Security: reject if file is suspiciously large (already checked at route level, but double-check)
  if (xmlString.length > 1_048_576) {
    throw new Error('XML content exceeds 1MB size limit.');
  }

  let result: any;
  try {
    result = await parseStringPromise(xmlString, PARSE_OPTIONS);
  } catch (err: any) {
    throw new Error(`Failed to parse BeerXML: ${err.message || 'Malformed XML'}`);
  }

  // BeerXML wraps recipes in <RECIPES>
  const recipes = result?.recipes?.recipe || result?.recipe;
  if (!recipes) {
    throw new Error('No <RECIPE> found in BeerXML. Ensure the file is valid BeerXML format.');
  }

  // Handle single recipe or array
  const recipe = Array.isArray(recipes) ? recipes[0] : recipes;

  return mapBeerXMLToRecipe(recipe);
}

/**
 * Safely parse a float, returning undefined if the value is missing or unparseable.
 */
function safeFloat(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

/**
 * Map a parsed BeerXML recipe object to BrewBuddy format.
 */
function mapBeerXMLToRecipe(recipe: any): ParsedBeerXML {
  // Map core fields
  const mapped: Partial<IRecipe> = {
    recipeName: recipe.name || 'Imported Recipe',
    style: recipe.style?.name || undefined,
    styleCode: recipe.style?.category_number
      ? `${recipe.style.category_number}${recipe.style.style_letter || ''}`
      : undefined,
    method: METHOD_MAP[recipe.type] || 'all_grain',
    batchSize: safeFloat(recipe.batch_size),
    batchSizeUnit: 'L',
    boilSize: safeFloat(recipe.boil_size),
    preBoilSize: safeFloat(recipe.pre_boil_size),
    boilTimeMinutes: safeFloat(recipe.boil_time),
    efficiency: safeFloat(recipe.efficiency),
    notes: recipe.notes || undefined,
    tasteNotes: recipe.taste_notes || undefined,
    tasteRating: safeFloat(recipe.taste_rating),
    estimatedOg: safeFloat(recipe.og),
    estimatedFg: safeFloat(recipe.fg),
    estimatedAbv: safeFloat(recipe.abv),
    estimatedIbu: safeFloat(recipe.ibu),
    estimatedSrm: safeFloat(recipe.color),
    brewer: recipe.brewer || undefined,
    asstBrewer: recipe.asst_brewer || undefined,
    brewDate: recipe.date ? new Date(recipe.date) : undefined,
    carbonation: safeFloat(recipe.carbonation),
    forcedCarbonation: recipe.forced_carbonation === 'true' || recipe.forced_carbonation === '1',
    primingSugarName: recipe.priming_sugar_name || undefined,
    primingSugarEquiv: safeFloat(recipe.priming_sugar_equiv),
    kegPrimingFactor: safeFloat(recipe.keg_priming_factor),
    carbonationTemp: safeFloat(recipe.carbonation_temp),
    primaryAgeDays: safeFloat(recipe.primary_age),
    primaryTemp: safeFloat(recipe.primary_temp),
    secondaryAgeDays: safeFloat(recipe.secondary_age),
    secondaryTemp: safeFloat(recipe.secondary_temp),
    tertiaryAgeDays: safeFloat(recipe.tertiary_age),
    tertiaryTemp: safeFloat(recipe.tertiary_temp),
    ageDays: safeFloat(recipe.age),
    ageTemp: safeFloat(recipe.age_temp),
  };

  // Map hops with all fields
  const hopsRaw = recipe.hops?.hop;
  const hops = hopsRaw
    ? (Array.isArray(hopsRaw) ? hopsRaw : [hopsRaw]).map((h: any) => ({
        name: h.name || 'Unknown Hop',
        alpha: safeFloat(h.alpha),
        amount: safeFloat(h.amount),
        time: safeFloat(h.time),
        use: HOP_USE_MAP[h.use] || h.use || 'Boil',
        form: h.form || 'Pellet',
        origin: h.origin || undefined,
        type: h.type || undefined,
        notes: h.notes || undefined,
        beta: safeFloat(h.beta),
        hsi: safeFloat(h.hsi),
        humulene: safeFloat(h.humulene),
        caryophyllene: safeFloat(h.caryophyllene),
        cohumulone: safeFloat(h.cohumulone),
        myrcene: safeFloat(h.myrcene),
        substitutes: h.substitutes || undefined,
        producer: h.producer || undefined,
        productId: h.product_id || undefined,
        year: h.year || undefined,
      }))
    : [];

  // Map fermentables with all fields
  const fermRaw = recipe.fermentables?.fermentable;
  const fermentables = fermRaw
    ? (Array.isArray(fermRaw) ? fermRaw : [fermRaw]).map((f: any) => ({
        name: f.name || 'Unknown Grain',
        amount: safeFloat(f.amount),
        yield: safeFloat(f.yield),
        color: safeFloat(f.color),
        type: f.type || 'Grain',
        origin: f.origin || undefined,
        supplier: f.supplier || undefined,
        notes: f.notes || undefined,
        potentialExtract: safeFloat(f.potential),
        coarseFineDiff: safeFloat(f.coarse_fine_diff),
        moisture: safeFloat(f.moisture),
        protein: safeFloat(f.protein),
        maxInBatch: safeFloat(f.max_in_batch),
        recommendMash: f.recommend_mash === 'true' || f.recommend_mash === '1',
        ibuGalPerLb: safeFloat(f.ibu_gal_per_lb),
      }))
    : [];

  // Map yeast with all fields
  const yeastRaw = recipe.yeasts?.yeast;
  const yeasts = yeastRaw
    ? (Array.isArray(yeastRaw) ? yeastRaw : [yeastRaw]).map((y: any) => ({
        name: y.name || 'Unknown Yeast',
        type: y.type || undefined,
        form: y.form || undefined,
        amount: safeFloat(y.amount),
        laboratory: y.laboratory || undefined,
        productId: y.product_id || undefined,
        attenuation: safeFloat(y.attenuation),
        attenuationMin: safeFloat(y.attenuation_min),
        attenuationMax: safeFloat(y.attenuation_max),
        minTemperature: safeFloat(y.min_temperature),
        maxTemperature: safeFloat(y.max_temperature),
        flocculation: y.flocculation || undefined,
        notes: y.notes || undefined,
        timesCultured: safeFloat(y.times_cultured),
        maxReuse: safeFloat(y.max_reuse),
        addToSecondary: y.add_to_secondary === 'true' || y.add_to_secondary === '1',
        bestFor: y.best_for || undefined,
      }))
    : [];

  // Map mash profile
  let mashProfile: IMashProfile | undefined;
  if (recipe.mash?.mash_steps?.mash_step) {
    const stepsRaw = recipe.mash.mash_steps.mash_step;
    const steps = (Array.isArray(stepsRaw) ? stepsRaw : [stepsRaw]).map((s: any) => ({
      name: s.name || 'Step',
      type: MASH_STEP_TYPE_MAP[s.type] || 'infusion',
      infuseAmount: safeFloat(s.infuse_amount),
      stepTemp: safeFloat(s.step_temp),
      stepTime: safeFloat(s.step_time),
      rampTime: safeFloat(s.ramp_time),
      endTemp: safeFloat(s.end_temp),
    }));

    mashProfile = {
      name: recipe.mash.name || 'Mash Profile',
      grainTemp: safeFloat(recipe.mash.grain_temp),
      tunTemp: safeFloat(recipe.mash.tun_temp),
      spargeTemp: safeFloat(recipe.mash.sparge_temp),
      ph: safeFloat(recipe.mash.ph),
      steps,
    };
  }

  // Map style profile (comprehensive style data)
  let styleProfile: IStyleProfile | undefined;
  if (recipe.style) {
    const s = recipe.style;
    styleProfile = {
      categoryNumber: s.category_number || undefined,
      category: s.category || undefined,
      styleLetter: s.style_letter || undefined,
      styleGuide: s.style_guide || undefined,
      name: s.name || undefined,
      version: s.version || undefined,
      aroma: s.aroma || undefined,
      appearance: s.appearance || undefined,
      flavor: s.flavor || undefined,
      mouthfeel: s.mouthfeel || undefined,
      overallImpression: s.overall_impression || undefined,
      profile: s.profile || undefined,
      ingredients: s.ingredients || undefined,
      examples: s.examples || undefined,
      notes: s.notes || undefined,
      ogMin: safeFloat(s.og_min),
      ogMax: safeFloat(s.og_max),
      fgMin: safeFloat(s.fg_min),
      fgMax: safeFloat(s.fg_max),
      ibuMin: safeFloat(s.ibu_min),
      ibuMax: safeFloat(s.ibu_max),
      colorMin: safeFloat(s.color_min),
      colorMax: safeFloat(s.color_max),
      abvMin: safeFloat(s.abv_min),
      abvMax: safeFloat(s.abv_max),
      carbonationMin: safeFloat(s.carbonation_min),
      carbonationMax: safeFloat(s.carbonation_max),
    };
  }

  // Map equipment profile
  let equipment: IEquipment | undefined;
  if (recipe.equipment) {
    const e = recipe.equipment;
    equipment = {
      name: e.name || undefined,
      tunVolume: safeFloat(e.tun_volume),
      tunWeight: safeFloat(e.tun_weight),
      tunSpecificHeat: safeFloat(e.tun_specific_heat),
      mashTunVolume: safeFloat(e.mash_tun_volume),
      mashTunWeight: safeFloat(e.mash_tun_weight),
      mashTunSpecificHeat: safeFloat(e.mash_tun_specific_heat),
      lauterTunVolume: safeFloat(e.lauter_tun_volume),
      lauterTunWeight: safeFloat(e.lauter_tun_weight),
      lauterTunSpecificHeat: safeFloat(e.lauter_tun_specific_heat),
      boilKettleVolume: safeFloat(e.boil_kettle_volume),
      boilKettleWeight: safeFloat(e.boil_kettle_weight),
      boilKettleSpecificHeat: safeFloat(e.boil_kettle_specific_heat),
      boilTime: safeFloat(e.boil_time),
      lauterDeadSpace: safeFloat(e.lauter_dead_space),
      topUpWater: safeFloat(e.top_up_water),
      trubChillerLoss: safeFloat(e.trub_chiller_loss),
      evapRate: safeFloat(e.evap_rate),
      calculatedBoilSize: safeFloat(e.calculated_boil_size),
      calculatedBatchSize: safeFloat(e.calculated_batch_size),
      equipmentLoss: safeFloat(e.equipment_loss),
      whirlpoolTime: safeFloat(e.whirlpool_time),
      whirlpoolTemp: safeFloat(e.whirlpool_temp),
    };
  }

  // Map instructions
  let instructions: IInstruction[] | undefined;
  if (recipe.instructions?.instruction) {
    const instrRaw = recipe.instructions.instruction;
    const instrArr = Array.isArray(instrRaw) ? instrRaw : [instrRaw];
    instructions = instrArr.map((i: any) => ({
      name: i.name || undefined,
      amount: safeFloat(i.amount),
      amountIsWeight: i.amount_is_weight === 'true' || i.amount_is_weight === '1',
      time: safeFloat(i.time),
      step: safeFloat(i.step),
    }));
  }

  // Map misc ingredients
  let miscIngredients: IMiscIngredient[] | undefined;
  if (recipe.miscs?.misc) {
    const miscRaw = recipe.miscs.misc;
    const miscArr = Array.isArray(miscRaw) ? miscRaw : [miscRaw];
    miscIngredients = miscArr.map((m: any) => ({
      name: m.name || 'Unknown Misc',
      type: m.type || undefined,
      amount: safeFloat(m.amount),
      amountIsWeight: m.amount_is_weight === 'true' || m.amount_is_weight === '1',
      useFor: m.use_for || undefined,
      use: m.use || undefined,
      time: safeFloat(m.time),
      notes: m.notes || undefined,
    }));
  }

  return {
    recipe: mapped,
    hops,
    fermentables,
    yeasts,
    mashProfile,
    styleProfile,
    equipment,
    instructions,
    miscIngredients,
    brewer: recipe.brewer || undefined,
    asstBrewer: recipe.asst_brewer || undefined,
    carbonation: safeFloat(recipe.carbonation),
    forcedCarbonation: recipe.forced_carbonation === 'true' || recipe.forced_carbonation === '1',
    primingSugarName: recipe.priming_sugar_name || undefined,
    primingSugarEquiv: safeFloat(recipe.priming_sugar_equiv),
    kegPrimingFactor: safeFloat(recipe.keg_priming_factor),
    carbonationTemp: safeFloat(recipe.carbonation_temp),
    primaryAgeDays: safeFloat(recipe.primary_age),
    primaryTemp: safeFloat(recipe.primary_temp),
    secondaryAgeDays: safeFloat(recipe.secondary_age),
    secondaryTemp: safeFloat(recipe.secondary_temp),
    tertiaryAgeDays: safeFloat(recipe.tertiary_age),
    tertiaryTemp: safeFloat(recipe.tertiary_temp),
    ageDays: safeFloat(recipe.age),
    ageTemp: safeFloat(recipe.age_temp),
  };
}

/**
 * Convert a BrewBuddy recipe to BeerXML string.
 */
export function exportToBeerXML(recipe: IRecipe): string {
  const builder = new Builder({
    rootName: 'RECIPES',
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '  ', newline: '\n' },
  });

  const beerXmlRecipe: any = {
    RECIPE: {
      NAME: recipe.recipeName || 'Untitled Recipe',
      VERSION: 1,
      TYPE: METHOD_REVERSE_MAP[recipe.method] || 'All Grain',
      STYLE: {
        NAME: recipe.style || '',
        VERSION: 1,
      },
      BREWER: recipe.brewer || 'BrewBuddy User',
      BATCH_SIZE: recipe.batchSize || 0,
      BOIL_SIZE: recipe.boilSize || (recipe.batchSize ? recipe.batchSize * 1.25 : 0),
      BOIL_TIME: recipe.boilTimeMinutes || 0,
      EFFICIENCY: recipe.efficiency || 0,
      NOTES: recipe.notes || '',
      OG: recipe.estimatedOg || 0,
      FG: recipe.estimatedFg || 0,
    },
  };

  // Add optional recipe fields
  if (recipe.asstBrewer) beerXmlRecipe.RECIPE.ASST_BREWER = recipe.asstBrewer;
  if (recipe.brewDate) beerXmlRecipe.RECIPE.DATE = recipe.brewDate.toISOString().split('T')[0];
  if (recipe.tasteNotes) beerXmlRecipe.RECIPE.TASTE_NOTES = recipe.tasteNotes;
  if (recipe.tasteRating) beerXmlRecipe.RECIPE.TASTE_RATING = recipe.tasteRating;

  // Add estimated stats if present
  if (recipe.estimatedIbu) {
    beerXmlRecipe.RECIPE.ESTIMATED_IBU = recipe.estimatedIbu;
  }
  if (recipe.estimatedSrm) {
    beerXmlRecipe.RECIPE.ESTIMATED_SRM = recipe.estimatedSrm;
  }
  if (recipe.estimatedAbv) {
    beerXmlRecipe.RECIPE.ABV = recipe.estimatedAbv;
  }

  // Add fermentation data
  if (recipe.primaryAgeDays) beerXmlRecipe.RECIPE.PRIMARY_AGE = recipe.primaryAgeDays;
  if (recipe.primaryTemp) beerXmlRecipe.RECIPE.PRIMARY_TEMP = recipe.primaryTemp;
  if (recipe.secondaryAgeDays) beerXmlRecipe.RECIPE.SECONDARY_AGE = recipe.secondaryAgeDays;
  if (recipe.secondaryTemp) beerXmlRecipe.RECIPE.SECONDARY_TEMP = recipe.secondaryTemp;
  if (recipe.carbonation) beerXmlRecipe.RECIPE.CARBONATION = recipe.carbonation;

  // Add style profile
  if (recipe.styleProfile) {
    const sp = recipe.styleProfile;
    beerXmlRecipe.RECIPE.STYLE = {
      ...beerXmlRecipe.RECIPE.STYLE,
      CATEGORY_NUMBER: sp.categoryNumber || '',
      STYLE_LETTER: sp.styleLetter || '',
      STYLE_GUIDE: sp.styleGuide || '',
      NOTES: sp.notes || '',
      PROFILE: sp.profile || '',
      INGREDIENTS: sp.ingredients || '',
      EXAMPLES: sp.examples || '',
      AROMA: sp.aroma || '',
      APPEARANCE: sp.appearance || '',
      FLAVOR: sp.flavor || '',
      MOUTHFEEL: sp.mouthfeel || '',
      OVERALL_IMPRESSION: sp.overallImpression || '',
      OG_MIN: sp.ogMin || 0,
      OG_MAX: sp.ogMax || 0,
      FG_MIN: sp.fgMin || 0,
      FG_MAX: sp.fgMax || 0,
      IBU_MIN: sp.ibuMin || 0,
      IBU_MAX: sp.ibuMax || 0,
      COLOR_MIN: sp.colorMin || 0,
      COLOR_MAX: sp.colorMax || 0,
      ABV_MIN: sp.abvMin || 0,
      ABV_MAX: sp.abvMax || 0,
    };
  }

  // Add mash profile if present
  if (recipe.mashProfile && recipe.mashProfile.steps?.length > 0) {
    beerXmlRecipe.RECIPE.MASH = {
      NAME: recipe.mashProfile.name || 'Mash Profile',
      VERSION: 1,
      GRAIN_TEMP: recipe.mashProfile.grainTemp || 20,
      MASH_STEPS: {
        MASH_STEP: recipe.mashProfile.steps.map((step) => ({
          NAME: step.name,
          VERSION: 1,
          TYPE: step.type === 'infusion' ? 'Infusion' : step.type === 'temperature' ? 'Temperature' : 'Decoction',
          INFUSE_AMOUNT: step.infuseAmount || 0,
          STEP_TEMP: step.stepTemp || 0,
          STEP_TIME: step.stepTime || 0,
          ...(step.rampTime ? { RAMP_TIME: step.rampTime } : {}),
          ...(step.endTemp ? { END_TEMP: step.endTemp } : {}),
        })),
      },
    };
  }

  return builder.buildObject(beerXmlRecipe);
}

import { parseStringPromise, Builder } from 'xml2js';
import { IRecipe, IMashProfile, IMashStep } from '../types/recipe';

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
  }>;
  yeasts: Array<{
    name: string;
    type?: string;
    form?: string;
    amount?: number;
    laboratory?: string;
    productId?: string;
    attenuation?: number;
    minTemperature?: number;
    maxTemperature?: number;
    flocculation?: string;
    notes?: string;
  }>;
  mashProfile?: IMashProfile;
  brewer?: string;
  styleCategory?: string;
  styleLetter?: string;
  styleGuide?: string;
  styleNotes?: string;
  ogMin?: number;
  ogMax?: number;
  fgMin?: number;
  fgMax?: number;
  ibuMin?: number;
  ibuMax?: number;
  colorMin?: number;
  colorMax?: number;
  abvMin?: number;
  abvMax?: number;
  carbonation?: number;
  primaryAgeDays?: number;
  primaryTemp?: number;
  secondaryAgeDays?: number;
  secondaryTemp?: number;
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
    batchSize: parseFloat(recipe.batch_size) || undefined,
    batchSizeUnit: 'L',
    boilTimeMinutes: parseFloat(recipe.boil_time) || undefined,
    efficiency: parseFloat(recipe.efficiency) || undefined,
    notes: [recipe.notes, recipe.taste_notes].filter(Boolean).join('\n\n') || undefined,
    estimatedOg: parseFloat(recipe.og) || undefined,
    estimatedFg: parseFloat(recipe.fg) || undefined,
    estimatedAbv: recipe.abv ? parseFloat(recipe.abv) : undefined,
    estimatedIbu: recipe.ibu ? parseFloat(recipe.ibu) : undefined,
    estimatedSrm: recipe.color ? parseFloat(recipe.color) : undefined,
    tasteRating: recipe.taste_rating ? parseFloat(recipe.taste_rating) : undefined,
  };

  // Map hops with additional fields
  const hopsRaw = recipe.hops?.hop;
  const hops = hopsRaw
    ? (Array.isArray(hopsRaw) ? hopsRaw : [hopsRaw]).map((h: any) => ({
        name: h.name || 'Unknown Hop',
        alpha: parseFloat(h.alpha) || undefined,
        amount: parseFloat(h.amount) || undefined,
        time: parseFloat(h.time) || undefined,
        use: HOP_USE_MAP[h.use] || h.use || 'Boil',
        form: h.form || 'Pellet',
        origin: h.origin || undefined,
        type: h.type || undefined,
        notes: h.notes || undefined,
      }))
    : [];

  // Map fermentables with additional fields
  const fermRaw = recipe.fermentables?.fermentable;
  const fermentables = fermRaw
    ? (Array.isArray(fermRaw) ? fermRaw : [fermRaw]).map((f: any) => ({
        name: f.name || 'Unknown Grain',
        amount: parseFloat(f.amount) || undefined,
        yield: parseFloat(f.yield) || undefined,
        color: parseFloat(f.color) || undefined,
        type: f.type || 'Grain',
        origin: f.origin || undefined,
        supplier: f.supplier || undefined,
        notes: f.notes || undefined,
      }))
    : [];

  // Map yeast with additional fields
  const yeastRaw = recipe.yeasts?.yeast;
  const yeasts = yeastRaw
    ? (Array.isArray(yeastRaw) ? yeastRaw : [yeastRaw]).map((y: any) => ({
        name: y.name || 'Unknown Yeast',
        type: y.type || undefined,
        form: y.form || undefined,
        amount: parseFloat(y.amount) || undefined,
        laboratory: y.laboratory || undefined,
        productId: y.product_id || undefined,
        attenuation: parseFloat(y.attenuation) || undefined,
        minTemperature: parseFloat(y.min_temperature) || undefined,
        maxTemperature: parseFloat(y.max_temperature) || undefined,
        flocculation: y.flocculation || undefined,
        notes: y.notes || undefined,
      }))
    : [];

  // Map mash profile
  let mashProfile: IMashProfile | undefined;
  if (recipe.mash?.mash_steps?.mash_step) {
    const stepsRaw = recipe.mash.mash_steps.mash_step;
    const steps = (Array.isArray(stepsRaw) ? stepsRaw : [stepsRaw]).map((s: any) => ({
      name: s.name || 'Step',
      type: MASH_STEP_TYPE_MAP[s.type] || 'infusion',
      infuseAmount: parseFloat(s.infuse_amount) || undefined,
      stepTemp: parseFloat(s.step_temp) || undefined,
      stepTime: parseFloat(s.step_time) || undefined,
      rampTime: parseFloat(s.ramp_time) || undefined,
      endTemp: parseFloat(s.end_temp) || undefined,
    }));

    mashProfile = {
      name: recipe.mash.name || 'Mash Profile',
      grainTemp: parseFloat(recipe.mash.grain_temp) || undefined,
      tunTemp: parseFloat(recipe.mash.tun_temp) || undefined,
      spargeTemp: parseFloat(recipe.mash.sparge_temp) || undefined,
      ph: parseFloat(recipe.mash.ph) || undefined,
      steps,
    };
  }

  return {
    recipe: mapped,
    hops,
    fermentables,
    yeasts,
    mashProfile,
    brewer: recipe.brewer || undefined,
    styleCategory: recipe.style?.category || undefined,
    styleLetter: recipe.style?.style_letter || undefined,
    styleGuide: recipe.style?.style_guide || undefined,
    styleNotes: recipe.style?.notes || undefined,
    ogMin: recipe.style?.og_min ? parseFloat(recipe.style.og_min) : undefined,
    ogMax: recipe.style?.og_max ? parseFloat(recipe.style.og_max) : undefined,
    fgMin: recipe.style?.fg_min ? parseFloat(recipe.style.fg_min) : undefined,
    fgMax: recipe.style?.fg_max ? parseFloat(recipe.style.fg_max) : undefined,
    ibuMin: recipe.style?.ibu_min ? parseFloat(recipe.style.ibu_min) : undefined,
    ibuMax: recipe.style?.ibu_max ? parseFloat(recipe.style.ibu_max) : undefined,
    colorMin: recipe.style?.color_min ? parseFloat(recipe.style.color_min) : undefined,
    colorMax: recipe.style?.color_max ? parseFloat(recipe.style.color_max) : undefined,
    abvMin: recipe.style?.abv_min ? parseFloat(recipe.style.abv_min) : undefined,
    abvMax: recipe.style?.abv_max ? parseFloat(recipe.style.abv_max) : undefined,
    carbonation: recipe.carbonation ? parseFloat(recipe.carbonation) : undefined,
    primaryAgeDays: recipe.primary_age ? parseFloat(recipe.primary_age) : undefined,
    primaryTemp: recipe.primary_temp ? parseFloat(recipe.primary_temp) : undefined,
    secondaryAgeDays: recipe.secondary_age ? parseFloat(recipe.secondary_age) : undefined,
    secondaryTemp: recipe.secondary_temp ? parseFloat(recipe.secondary_temp) : undefined,
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
      BREWER: 'BrewBuddy User',
      BATCH_SIZE: recipe.batchSize || 0,
      BOIL_SIZE: recipe.batchSize ? recipe.batchSize * 1.25 : 0, // estimate boil size
      BOIL_TIME: recipe.boilTimeMinutes || 0,
      EFFICIENCY: recipe.efficiency || 0,
      NOTES: recipe.notes || '',
      OG: recipe.estimatedOg || 0,
      FG: recipe.estimatedFg || 0,
    },
  };

  // Add estimated stats if present
  if (recipe.estimatedIbu) {
    beerXmlRecipe.RECIPE.ESTIMATED_IBU = recipe.estimatedIbu;
  }
  if (recipe.estimatedSrm) {
    beerXmlRecipe.RECIPE.ESTIMATED_SRM = recipe.estimatedSrm;
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

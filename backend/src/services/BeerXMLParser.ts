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
  }>;
  fermentables: Array<{
    name: string;
    amount?: number;
    yield?: number;
    color?: number;
    type?: string;
  }>;
  yeasts: Array<{
    name: string;
    type?: string;
    form?: string;
    amount?: number;
    laboratory?: string;
    productId?: string;
    attenuation?: number;
  }>;
  mashProfile?: IMashProfile;
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
    styleCode: recipe.style?.category_number || undefined,
    method: METHOD_MAP[recipe.type] || 'all_grain',
    batchSize: parseFloat(recipe.batch_size) || undefined,
    batchSizeUnit: 'L',
    boilTimeMinutes: parseFloat(recipe.boil_time) || undefined,
    efficiency: parseFloat(recipe.efficiency) || undefined,
    notes: [recipe.notes, recipe.taste_notes].filter(Boolean).join('\n\n') || undefined,
    estimatedOg: parseFloat(recipe.og) || undefined,
    estimatedFg: parseFloat(recipe.fg) || undefined,
  };

  // Map hops
  const hopsRaw = recipe.hops?.hop;
  const hops = hopsRaw
    ? (Array.isArray(hopsRaw) ? hopsRaw : [hopsRaw]).map((h: any) => ({
        name: h.name || 'Unknown Hop',
        alpha: parseFloat(h.alpha) || undefined,
        amount: parseFloat(h.amount) || undefined, // BeerXML uses kg
        time: parseFloat(h.time) || undefined,
        use: HOP_USE_MAP[h.use] || h.use || 'Boil',
        form: h.form || 'Pellet',
      }))
    : [];

  // Map fermentables
  const fermRaw = recipe.fermentables?.fermentable;
  const fermentables = fermRaw
    ? (Array.isArray(fermRaw) ? fermRaw : [fermRaw]).map((f: any) => ({
        name: f.name || 'Unknown Grain',
        amount: parseFloat(f.amount) || undefined,
        yield: parseFloat(f.yield) || undefined,
        color: parseFloat(f.color) || undefined,
        type: f.type || 'Grain',
      }))
    : [];

  // Map yeast
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

  return { recipe: mapped, hops, fermentables, yeasts, mashProfile };
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

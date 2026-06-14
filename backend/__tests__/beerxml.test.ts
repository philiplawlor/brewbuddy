import { parseBeerXML, exportToBeerXML, ParsedBeerXML } from '../src/services/BeerXMLParser';

// Sample valid BeerXML
const SAMPLE_BEERXML = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Test IPA</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <STYLE>
      <NAME>American IPA</NAME>
      <CATEGORY_NUMBER>21</CATEGORY_NUMBER>
    </STYLE>
    <BREWER>Test Brewer</BREWER>
    <BATCH_SIZE>20</BATCH_SIZE>
    <BOIL_TIME>60</BOIL_TIME>
    <EFFICIENCY>75</EFFICIENCY>
    <OG>1.065</OG>
    <FG>1.012</FG>
    <NOTES>Great IPA recipe</NOTES>
    <HOPS>
      <HOP>
        <NAME>Citra</NAME>
        <ALPHA>12</ALPHA>
        <AMOUNT>0.028</AMOUNT>
        <TIME>60</TIME>
        <USE>Boil</USE>
        <FORM>Pellet</FORM>
      </HOP>
      <HOP>
        <NAME>Mosaic</NAME>
        <ALPHA>12.5</ALPHA>
        <AMOUNT>0.014</AMOUNT>
        <TIME>5</TIME>
        <USE>Dry Hop</USE>
        <FORM>Pellet</FORM>
      </HOP>
    </HOPS>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Pale Malt (2-Row)</NAME>
        <AMOUNT>4.5</AMOUNT>
        <YIELD>80</YIELD>
        <COLOR>2</COLOR>
        <TYPE>Grain</TYPE>
      </FERMENTABLE>
      <FERMENTABLE>
        <NAME>CaraPils</NAME>
        <AMOUNT>0.5</AMOUNT>
        <YIELD>75</YIELD>
        <COLOR>5</COLOR>
        <TYPE>Grain</TYPE>
      </FERMENTABLE>
    </FERMENTABLES>
    <YEASTS>
      <YEAST>
        <NAME>US-05</NAME>
        <TYPE>Ale</TYPE>
        <FORM>Dry</FORM>
        <AMOUNT>0.01</AMOUNT>
        <LABORATORY>Fermentis</LABORATORY>
        <PRODUCT_ID>US-05</PRODUCT_ID>
        <ATTENUATION>77</ATTENUATION>
      </YEAST>
    </YEASTS>
    <MASH>
      <NAME>Single Infusion</NAME>
      <GRAIN_TEMP>22</GRAIN_TEMP>
      <MASH_STEPS>
        <MASH_STEP>
          <NAME>Mash In</NAME>
          <TYPE>Infusion</TYPE>
          <INFUSE_AMOUNT>15</INFUSE_AMOUNT>
          <STEP_TEMP>66</STEP_TEMP>
          <STEP_TIME>60</STEP_TIME>
        </MASH_STEP>
      </MASH_STEPS>
    </MASH>
  </RECIPE>
</RECIPES>`;

describe('BeerXML Parser', () => {
  describe('parseBeerXML', () => {
    it('should parse a valid BeerXML string', async () => {
      const result = await parseBeerXML(SAMPLE_BEERXML);

      expect(result.recipe.recipeName).toBe('Test IPA');
      expect(result.recipe.method).toBe('all_grain');
      expect(result.recipe.batchSize).toBe(20);
      expect(result.recipe.boilTimeMinutes).toBe(60);
      expect(result.recipe.efficiency).toBe(75);
      expect(result.recipe.estimatedOg).toBe(1.065);
      expect(result.recipe.estimatedFg).toBe(1.012);
      expect(result.recipe.notes).toBe('Great IPA recipe');
    });

    it('should parse hops correctly', async () => {
      const result = await parseBeerXML(SAMPLE_BEERXML);

      expect(result.hops).toHaveLength(2);
      expect(result.hops[0].name).toBe('Citra');
      expect(result.hops[0].alpha).toBe(12);
      expect(result.hops[0].amount).toBe(0.028);
      expect(result.hops[0].use).toBe('Boil');
      expect(result.hops[1].use).toBe('Dry Hop');
    });

    it('should parse fermentables correctly', async () => {
      const result = await parseBeerXML(SAMPLE_BEERXML);

      expect(result.fermentables).toHaveLength(2);
      expect(result.fermentables[0].name).toBe('Pale Malt (2-Row)');
      expect(result.fermentables[0].amount).toBe(4.5);
      expect(result.fermentables[0].yield).toBe(80);
      expect(result.fermentables[0].type).toBe('Grain');
    });

    it('should parse yeast correctly', async () => {
      const result = await parseBeerXML(SAMPLE_BEERXML);

      expect(result.yeasts).toHaveLength(1);
      expect(result.yeasts[0].name).toBe('US-05');
      expect(result.yeasts[0].type).toBe('Ale');
      expect(result.yeasts[0].form).toBe('Dry');
      expect(result.yeasts[0].laboratory).toBe('Fermentis');
      expect(result.yeasts[0].productId).toBe('US-05');
      expect(result.yeasts[0].attenuation).toBe(77);
    });

    it('should parse mash profile correctly', async () => {
      const result = await parseBeerXML(SAMPLE_BEERXML);

      expect(result.mashProfile).toBeDefined();
      expect(result.mashProfile!.name).toBe('Single Infusion');
      expect(result.mashProfile!.grainTemp).toBe(22);
      expect(result.mashProfile!.steps).toHaveLength(1);
      expect(result.mashProfile!.steps[0].name).toBe('Mash In');
      expect(result.mashProfile!.steps[0].type).toBe('infusion');
      expect(result.mashProfile!.steps[0].stepTemp).toBe(66);
      expect(result.mashProfile!.steps[0].stepTime).toBe(60);
    });

    it('should handle partial mash type', async () => {
      const xml = SAMPLE_BEERXML.replace('<TYPE>All Grain</TYPE>', '<TYPE>Partial Mash</TYPE>');
      const result = await parseBeerXML(xml);
      expect(result.recipe.method).toBe('partial_mash');
    });

    it('should handle extract type', async () => {
      const xml = SAMPLE_BEERXML.replace('<TYPE>All Grain</TYPE>', '<TYPE>Extract</TYPE>');
      const result = await parseBeerXML(xml);
      expect(result.recipe.method).toBe('extract');
    });

    it('should handle recipe without hops', async () => {
      const xml = SAMPLE_BEERXML.replace(/<HOPS>[\s\S]*?<\/HOPS>/, '');
      const result = await parseBeerXML(xml);
      expect(result.hops).toHaveLength(0);
    });

    it('should handle recipe without mash profile', async () => {
      const xml = SAMPLE_BEERXML.replace(/<MASH>[\s\S]*?<\/MASH>/, '');
      const result = await parseBeerXML(xml);
      expect(result.mashProfile).toBeUndefined();
    });

    it('should handle single hop (non-array)', async () => {
      const xml = SAMPLE_BEERXML.replace(/<HOP>[\s\S]*?<\/HOP>[\s\S]*?<HOP>[\s\S]*?<\/HOP>/, '<HOP><NAME>Citra</NAME><ALPHA>12</ALPHA><AMOUNT>0.028</AMOUNT><TIME>60</TIME><USE>Boil</USE><FORM>Pellet</FORM></HOP>');
      const result = await parseBeerXML(xml);
      expect(result.hops).toHaveLength(1);
    });

    it('should reject XML with DOCTYPE (XXE attack)', async () => {
      const maliciousXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<RECIPES><RECIPE><NAME>&xxe;</NAME></RECIPE></RECIPES>`;

      await expect(parseBeerXML(maliciousXml)).rejects.toThrow('potentially dangerous declarations');
    });

    it('should reject XML with ENTITY declaration', async () => {
      const maliciousXml = `<?xml version="1.0"?>
<!ENTITY test "value">
<RECIPES><RECIPE><NAME>Test</NAME></RECIPE></RECIPES>`;

      await expect(parseBeerXML(maliciousXml)).rejects.toThrow('potentially dangerous declarations');
    });

    it('should reject XML with SYSTEM declaration', async () => {
      const maliciousXml = `<?xml version="1.0"?>
<RECIPES><RECIPE><NAME SYSTEM "file:///etc/passwd">Test</NAME></RECIPE></RECIPES>`;

      await expect(parseBeerXML(maliciousXml)).rejects.toThrow('potentially dangerous declarations');
    });

    it('should reject XML exceeding 1MB', async () => {
      const hugeXml = `<?xml version="1.0"?><RECIPES><RECIPE><NAME>${'x'.repeat(1_048_577)}</NAME></RECIPE></RECIPES>`;
      await expect(parseBeerXML(hugeXml)).rejects.toThrow('exceeds 1MB');
    });

    it('should throw on malformed XML', async () => {
      await expect(parseBeerXML('not xml at all')).rejects.toThrow('Failed to parse BeerXML');
    });

    it('should throw when no recipe found', async () => {
      const xml = `<?xml version="1.0"?><RECIPES></RECIPES>`;
      await expect(parseBeerXML(xml)).rejects.toThrow('No <RECIPE> found');
    });
  });

  describe('exportToBeerXML', () => {
    it('should export a recipe to valid BeerXML', () => {
      const recipe = {
        recipeName: 'Exported Stout',
        method: 'all_grain' as const,
        style: 'Irish Stout',
        batchSize: 20,
        boilTimeMinutes: 60,
        efficiency: 72,
        notes: 'Rich stout recipe',
        estimatedOg: 1.048,
        estimatedFg: 1.012,
        estimatedIbu: 35,
        estimatedSrm: 28,
      } as any;

      const xml = exportToBeerXML(recipe);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<RECIPES>');
      expect(xml).toContain('<NAME>Exported Stout</NAME>');
      expect(xml).toContain('<TYPE>All Grain</TYPE>');
      expect(xml).toContain('<BATCH_SIZE>20</BATCH_SIZE>');
      expect(xml).toContain('<BOIL_TIME>60</BOIL_TIME>');
      expect(xml).toContain('<EFFICIENCY>72</EFFICIENCY>');
      expect(xml).toContain('<OG>1.048</OG>');
      expect(xml).toContain('<FG>1.012</FG>');
      expect(xml).toContain('<ESTIMATED_IBU>35</ESTIMATED_IBU>');
      expect(xml).toContain('<ESTIMATED_SRM>28</ESTIMATED_SRM>');
      expect(xml).toContain('<NOTES>Rich stout recipe</NOTES>');
      expect(xml).toContain('<STYLE>');
      expect(xml).toContain('<NAME>Irish Stout</NAME>');
    });

    it('should export mash profile when present', () => {
      const recipe = {
        recipeName: 'Mash Test',
        method: 'all_grain' as const,
        mashProfile: {
          name: 'Step Mash',
          grainTemp: 22,
          steps: [
            { name: 'Mash In', type: 'infusion', stepTemp: 66, stepTime: 60, infuseAmount: 15 },
            { name: 'Mash Out', type: 'temperature', stepTemp: 76, stepTime: 10, rampTime: 5, endTemp: 76 },
          ],
        },
      } as any;

      const xml = exportToBeerXML(recipe);

      expect(xml).toContain('<MASH>');
      expect(xml).toContain('<NAME>Step Mash</NAME>');
      expect(xml).toContain('<GRAIN_TEMP>22</GRAIN_TEMP>');
      expect(xml).toContain('<MASH_STEPS>');
      expect(xml).toContain('<NAME>Mash In</NAME>');
      expect(xml).toContain('<TYPE>Infusion</TYPE>');
      expect(xml).toContain('<STEP_TEMP>66</STEP_TEMP>');
      expect(xml).toContain('<NAME>Mash Out</NAME>');
      expect(xml).toContain('<TYPE>Temperature</TYPE>');
      expect(xml).toContain('<RAMP_TIME>5</RAMP_TIME>');
      expect(xml).toContain('<END_TEMP>76</END_TEMP>');
    });

    it('should map partial_mash to Partial Mash', () => {
      const recipe = { recipeName: 'Test', method: 'partial_mash' as const } as any;
      const xml = exportToBeerXML(recipe);
      expect(xml).toContain('<TYPE>Partial Mash</TYPE>');
    });

    it('should map extract to Extract', () => {
      const recipe = { recipeName: 'Test', method: 'extract' as const } as any;
      const xml = exportToBeerXML(recipe);
      expect(xml).toContain('<TYPE>Extract</TYPE>');
    });

    it('should map biab to All Grain', () => {
      const recipe = { recipeName: 'Test', method: 'biab' as const } as any;
      const xml = exportToBeerXML(recipe);
      expect(xml).toContain('<TYPE>All Grain</TYPE>');
    });

    it('should estimate boil size as batchSize * 1.25', () => {
      const recipe = { recipeName: 'Test', method: 'all_grain' as const, batchSize: 20 } as any;
      const xml = exportToBeerXML(recipe);
      expect(xml).toContain('<BOIL_SIZE>25</BOIL_SIZE>');
    });

    it('should handle recipe with no style or notes', () => {
      const recipe = { recipeName: 'Simple', method: 'all_grain' as const } as any;
      const xml = exportToBeerXML(recipe);
      expect(xml).toContain('<NAME>Simple</NAME>');
      expect(xml).toContain('<NOTES');
    });

    it('should handle recipe with no mash profile', () => {
      const recipe = { recipeName: 'No Mash', method: 'all_grain' as const } as any;
      const xml = exportToBeerXML(recipe);
      expect(xml).not.toContain('<MASH>');
    });

    it('should sanitize recipe name in export', () => {
      const recipe = { recipeName: 'Test Recipe & Stuff!', method: 'all_grain' as const } as any;
      const xml = exportToBeerXML(recipe);
      expect(xml).toContain('<NAME>Test Recipe &amp; Stuff!</NAME>');
    });
  });

  describe('roundtrip (export → import)', () => {
    it('should preserve core fields through export and re-import', async () => {
      const originalRecipe = {
        recipeName: 'Roundtrip Pale Ale',
        method: 'all_grain' as const,
        style: 'American Pale Ale',
        batchSize: 19,
        boilTimeMinutes: 60,
        efficiency: 72,
        notes: 'Test roundtrip',
        estimatedOg: 1.055,
        estimatedFg: 1.012,
        mashProfile: {
          name: 'Single Infusion',
          grainTemp: 22,
          steps: [
            { name: 'Mash In', type: 'infusion' as const, stepTemp: 66, stepTime: 60, infuseAmount: 15 },
          ],
        },
      } as any;

      const xml = exportToBeerXML(originalRecipe);
      const parsed = await parseBeerXML(xml);

      expect(parsed.recipe.recipeName).toBe('Roundtrip Pale Ale');
      expect(parsed.recipe.method).toBe('all_grain');
      expect(parsed.recipe.style).toBe('American Pale Ale');
      expect(parsed.recipe.batchSize).toBe(19);
      expect(parsed.recipe.boilTimeMinutes).toBe(60);
      expect(parsed.recipe.efficiency).toBe(72);
      expect(parsed.recipe.estimatedOg).toBe(1.055);
      expect(parsed.recipe.estimatedFg).toBe(1.012);
      expect(parsed.mashProfile).toBeDefined();
      expect(parsed.mashProfile!.name).toBe('Single Infusion');
      expect(parsed.mashProfile!.grainTemp).toBe(22);
      expect(parsed.mashProfile!.steps).toHaveLength(1);
      expect(parsed.mashProfile!.steps[0].stepTemp).toBe(66);
    });
  });
});

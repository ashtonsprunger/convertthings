import { MCP_TOOLS, MCP_SERVER_INFO, executeTool } from './mcpTools';

describe('MCP Tools Engine', () => {
  test('exports server info and 4 defined tools', () => {
    expect(MCP_SERVER_INFO.name).toBe('ConvertThings');
    expect(MCP_TOOLS.length).toBe(4);

    const toolNames = MCP_TOOLS.map((t) => t.name);
    expect(toolNames).toContain('convert_units');
    expect(toolNames).toContain('parse_and_convert');
    expect(toolNames).toContain('list_units');
    expect(toolNames).toContain('get_reference_table');
  });

  test('convert_units: accurately converts kilometers to miles', async () => {
    const res = await executeTool('convert_units', {
      value: 100,
      from: 'km',
      to: 'mi',
    });

    expect(res.isError).toBe(false);
    expect(res.structuredData).toBeDefined();
    expect(res.structuredData.value).toBe(100);
    expect(res.structuredData.from.id).toBe('km');
    expect(res.structuredData.to.id).toBe('mi');
    expect(Math.round(res.structuredData.result)).toBe(62);
    expect(res.structuredData.readout).toContain('100 km =');
    expect(res.structuredData.formula).toContain('0.62137119');
  });

  test('convert_units: accurately converts Celsius to Fahrenheit', async () => {
    const res = await executeTool('convert_units', {
      value: 100,
      from: 'c',
      to: 'f',
    });

    expect(res.isError).toBe(false);
    expect(res.structuredData.result).toBe(212);
    expect(res.structuredData.formula).toBe('°F = (°C × 9/5) + 32');
  });

  test('convert_units: handles incompatible unit error gracefully', async () => {
    const res = await executeTool('convert_units', {
      value: 5,
      from: 'km',
      to: 'kg',
    });

    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('Incompatible unit conversion');
  });

  test('parse_and_convert: handles natural language input', async () => {
    const res = await executeTool('parse_and_convert', {
      query: '150 lbs into kg',
    });

    expect(res.isError).toBe(false);
    expect(res.structuredData.from.id).toBe('lb');
    expect(res.structuredData.to.id).toBe('kg');
    expect(Math.round(res.structuredData.result)).toBe(68);
  });

  test('parse_and_convert: handles compound unit queries with mixed units', async () => {
    // 5 ft 10 in to cm
    const resHeight = await executeTool('parse_and_convert', {
      query: '5 ft 10 in to cm',
    });

    expect(resHeight.isError).toBe(false);
    expect(resHeight.structuredData.isCompound).toBe(true);
    expect(resHeight.structuredData.compoundDisplay).toBe('5 ft 10 in');
    expect(resHeight.structuredData.to.id).toBe('cm');
    expect(parseFloat(resHeight.structuredData.formattedResult)).toBeCloseTo(177.8, 1);
    expect(resHeight.content[0].text).toContain('5 ft 10 in = 177.8 Centimeters (cm)');

    // 2 lbs 4 oz to g
    const resMass = await executeTool('parse_and_convert', {
      query: '2 lbs 4 oz to g',
    });

    expect(resMass.isError).toBe(false);
    expect(resMass.structuredData.isCompound).toBe(true);
    expect(resMass.structuredData.compoundDisplay).toBe('2 lb 4 oz');
    expect(resMass.structuredData.to.id).toBe('g');
    expect(parseFloat(resMass.structuredData.formattedResult)).toBeCloseTo(1020.58, 2);
    expect(resMass.content[0].text).toContain('2 lb 4 oz = 1020.58 Grams (g)');
  });

  test('list_units: returns all categories when unconstrained', async () => {
    const res = await executeTool('list_units', {});
    expect(res.isError).toBe(false);
    expect(res.structuredData.totalCategories).toBe(15);
    expect(res.structuredData.totalUnits).toBeGreaterThan(100);
  });

  test('list_units: filters by category', async () => {
    const res = await executeTool('list_units', { category: 'cooking' });
    expect(res.isError).toBe(false);
    expect(res.structuredData.category).toBe('cooking');
    expect(res.structuredData.units.length).toBeGreaterThan(5);
  });

  test('get_reference_table: produces markdown table of benchmark values', async () => {
    const res = await executeTool('get_reference_table', { from: 'km', to: 'mi' });
    expect(res.isError).toBe(false);
    expect(res.content[0].text).toContain('| Kilometers (km) | Miles (mi) |');
    expect(res.structuredData.benchmarks.length).toBe(10);
  });
});

import * as tsj from 'ts-json-schema-generator';
import * as fs from 'fs';

export function generateJsonSchema(pathFile: string, typeName: string) {
  const config = {
    path: pathFile, // Path to your TS file
    tsconfig: './tsconfig.json', // Path to your tsconfig.json
    type: typeName, // The name of the type you want to generate the schema for
  };

  const output_path = `./tmp/${typeName}.json`; // Where to save the generated schema

  // Generate the schema
  const schema = tsj.createGenerator(config).createSchema(config.type);

  // Optionally, you can manipulate the schema here if you need to add descriptions or make any changes

  // Save the schema to a file
  fs.writeFileSync(output_path, JSON.stringify(schema, null, 2));

  console.log(`Schema generated and saved to ${output_path}`);
  return JSON.stringify(schema, null, 2);
}

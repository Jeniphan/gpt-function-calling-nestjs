export interface IOpenAiFunctionCalling {
  GetWeather: (
    location: string,
    unit: 'c' | 'f',
  ) => Promise<{ location: string; temp: number; unit: 'c' | 'f' }>;
}

export class FunctionCallingGpt implements IOpenAiFunctionCalling {
  async GetWeather(
    location: string,
    unit: 'c' | 'f',
  ): Promise<{ location: string; temp: number; unit: 'c' | 'f' }> {
    return {
      location,
      temp: 24.0,
      unit,
    };
  }
}

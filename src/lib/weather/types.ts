export type Units = "metric" | "imperial";

export type Place = {
  name: string;
  latitude: number;
  longitude: number;
  admin?: string | null;
  country?: string | null;
  timezone?: string | null;
};

export type RainDriver = {
  id: "model" | "moisture" | "fetch" | "cloud" | "cape";
  label: string;
  score: number;
  note: string;
};

export type RainEstimate = {
  chance: number;
  modelChance: number;
  headline: string;
  fetchLabel: string;
  arrival: string;
  drivers: RainDriver[];
};

export type CurrentWeather = {
  time: string;
  timezone: string;
  temperatureC: number;
  apparentC: number;
  humidity: number;
  dewpointC: number;
  pressureHpa: number;
  cloudCover: number;
  precipitationMm: number;
  weatherCode: number;
  isDay: boolean;
  windSpeedKmh: number;
  windGustKmh: number;
  windDir: number;
  rain: RainEstimate;
};

export type HourPoint = {
  time: string;
  temperatureC: number;
  humidity: number;
  dewpointC: number;
  precipMm: number;
  modelChance: number;
  weatherCode: number;
  cloudCover: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDir: number;
  isDay: boolean;
  cape: number;
  rain: RainEstimate;
};

export type DayPoint = {
  date: string;
  weatherCode: number;
  tempMaxC: number;
  tempMinC: number;
  precipMm: number;
  modelChance: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDir: number;
  sunrise: string;
  sunset: string;
  uvMax: number;
  rain: RainEstimate;
};

export type Forecast = {
  place: Place;
  current: CurrentWeather;
  hourly: HourPoint[];
  daily: DayPoint[];
  nextRain: HourPoint | null;
  windShift: { from: number; to: number; hours: number } | null;
};

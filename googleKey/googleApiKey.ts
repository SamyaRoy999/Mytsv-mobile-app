export const GOOGLEMAPAPIKEY = ({ query }: any) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;
};

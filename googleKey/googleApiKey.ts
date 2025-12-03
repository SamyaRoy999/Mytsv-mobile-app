export const GOOGLEMAPAPIKEY = ({ query }: any) => {
    const res = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=AIzaSyBayI9g3oFshYVEOzBoKGapFbXijcgR6xE`
    return res
}